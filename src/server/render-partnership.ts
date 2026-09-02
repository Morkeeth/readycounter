/**
 * Render partnership layer — Key Value is the durable backbone for ReadyCounter.
 * Vercel runs stateless API; Render persists stores, rooms, and audit batches.
 */

import { gunzipSync, gzipSync } from 'node:zlib';
import { kvBackend, kvGet, kvPing, kvSet } from './kv';

export const RENDER_KV_PREFIX = 'rc:render:';
export const AUDIT_BATCH_KEY = `${RENDER_KV_PREFIX}audit-batch:latest`;
export const AUDIT_BATCH_AT_KEY = `${RENDER_KV_PREFIX}audit-batch:at`;
/** Tiny meta twin — survives when the full (gzip) blob is slow on cold start. */
export const AUDIT_BATCH_META_KEY = `${RENDER_KV_PREFIX}audit-batch:meta`;

const GZIP_PREFIX = 'gz1:';

export interface RenderKvInfo {
  provider: 'render' | 'other' | 'memory';
  hostname: string | null;
  region: string | null;
  instanceHint: string | null;
  connected: boolean;
}

export interface AuditBatchSummary {
  at: string;
  shopCount: number;
  succeeded: number;
  avgCatalogScore: number;
  avgGtinPct: number;
  avgOfferPct?: number | null;
  rows: Array<{
    url: string;
    storeId?: string;
    catalogScore?: number;
    catalogBudget?: number;
    gtinPct?: number;
    offerPct?: number | null;
    captchaHint?: boolean;
    method?: string;
    products?: number;
    error?: string;
  }>;
}

export type AuditBatchMeta = Omit<AuditBatchSummary, 'rows'>;

/** Process-local cache — warm Vercel instances skip Redis after first hit. */
let batchCache: { at: number; value: AuditBatchSummary } | null = null;
const BATCH_CACHE_TTL_MS = 60_000;

export function parseRenderKvFromUrl(redisUrl: string | undefined): RenderKvInfo {
  if (!redisUrl?.trim()) {
    return { provider: 'memory', hostname: null, region: null, instanceHint: null, connected: false };
  }
  try {
    const u = new URL(redisUrl);
    const host = u.hostname;
    const isRender = host.includes('keyvalue.render.com') || host.includes('render.com');
    const regionMatch = host.match(/^([a-z]+)-keyvalue\.render\.com$/);
    const instanceHint = u.username || host.split('.')[0] || null;
    return {
      provider: isRender ? 'render' : 'other',
      hostname: host,
      region: regionMatch?.[1] ?? process.env.RENDER_KV_REGION ?? null,
      instanceHint,
      connected: false,
    };
  } catch {
    return { provider: 'other', hostname: null, region: null, instanceHint: null, connected: false };
  }
}

export async function getRenderKvInfo(): Promise<RenderKvInfo> {
  const base = parseRenderKvFromUrl(process.env.REDIS_URL);
  const backend = await kvBackend();
  const connected = backend === 'redis' && (await kvPing());
  return { ...base, provider: backend === 'redis' ? base.provider : 'memory', connected };
}

function slimRows(rows: AuditBatchSummary['rows']): AuditBatchSummary['rows'] {
  return rows.map((r) => ({
    url: r.url,
    ...(r.storeId ? { storeId: r.storeId } : {}),
    ...(r.catalogScore !== undefined ? { catalogScore: r.catalogScore } : {}),
    ...(r.catalogBudget !== undefined ? { catalogBudget: r.catalogBudget } : {}),
    ...(r.gtinPct !== undefined ? { gtinPct: r.gtinPct } : {}),
    ...(r.offerPct !== undefined && r.offerPct !== null ? { offerPct: r.offerPct } : {}),
    ...(r.captchaHint ? { captchaHint: true } : {}),
    ...(r.method ? { method: r.method } : {}),
    ...(r.products !== undefined ? { products: r.products } : {}),
    ...(r.error ? { error: r.error } : {}),
  }));
}

export function encodeAuditBatchPayload(summary: AuditBatchSummary): string {
  const json = JSON.stringify(summary);
  const gz = gzipSync(Buffer.from(json, 'utf8')).toString('base64');
  return `${GZIP_PREFIX}${gz}`;
}

export function decodeAuditBatchPayload(raw: string): AuditBatchSummary | null {
  try {
    if (raw.startsWith(GZIP_PREFIX)) {
      const buf = Buffer.from(raw.slice(GZIP_PREFIX.length), 'base64');
      const json = gunzipSync(buf).toString('utf8');
      return JSON.parse(json) as AuditBatchSummary;
    }
    return JSON.parse(raw) as AuditBatchSummary;
  } catch {
    return null;
  }
}

function metaFromSummary(summary: AuditBatchSummary): AuditBatchMeta {
  return {
    at: summary.at,
    shopCount: summary.shopCount,
    succeeded: summary.succeeded,
    avgCatalogScore: summary.avgCatalogScore,
    avgGtinPct: summary.avgGtinPct,
    avgOfferPct: summary.avgOfferPct,
  };
}

export async function saveAuditBatchToKv(rows: AuditBatchSummary['rows']): Promise<void> {
  const slim = slimRows(rows);
  const succeeded = slim.filter((r) => !r.error);
  const avgCatalog =
    succeeded.length === 0
      ? 0
      : Math.round(
          succeeded.reduce((n, r) => n + (r.catalogScore ?? 0), 0) / succeeded.length,
        );
  const avgGtin =
    succeeded.length === 0
      ? 0
      : Math.round(succeeded.reduce((n, r) => n + (r.gtinPct ?? 0), 0) / succeeded.length);
  const withOffer = succeeded.filter((r) => r.offerPct != null);
  const avgOffer =
    withOffer.length === 0
      ? null
      : Math.round(withOffer.reduce((n, r) => n + (r.offerPct ?? 0), 0) / withOffer.length);

  const summary: AuditBatchSummary = {
    at: new Date().toISOString(),
    shopCount: slim.length,
    succeeded: succeeded.length,
    avgCatalogScore: avgCatalog,
    avgGtinPct: avgGtin,
    avgOfferPct: avgOffer,
    rows: slim,
  };
  const encoded = encodeAuditBatchPayload(summary);
  await kvSet(AUDIT_BATCH_KEY, encoded, { large: true });
  await kvSet(AUDIT_BATCH_AT_KEY, summary.at);
  await kvSet(AUDIT_BATCH_META_KEY, JSON.stringify(metaFromSummary(summary)));
  batchCache = { at: Date.now(), value: summary };
}

async function fetchBatchFromKv(): Promise<AuditBatchSummary | null> {
  const raw = await kvGet(AUDIT_BATCH_KEY, { large: true });
  if (!raw) return null;
  return decodeAuditBatchPayload(raw);
}

export async function loadAuditBatchFromKv(): Promise<AuditBatchSummary | null> {
  if (batchCache && Date.now() - batchCache.at < BATCH_CACHE_TTL_MS) {
    return batchCache.value;
  }

  let summary = await fetchBatchFromKv();
  if (!summary) {
    // Cold-start race: connect + first GET can miss. One retry after a short pause.
    await new Promise((r) => setTimeout(r, 150));
    summary = await fetchBatchFromKv();
  }
  if (summary) {
    batchCache = { at: Date.now(), value: summary };
    return summary;
  }
  return null;
}

/** Meta-only — for health/status when full rows are not needed. */
export async function loadAuditBatchMetaFromKv(): Promise<AuditBatchMeta | null> {
  if (batchCache && Date.now() - batchCache.at < BATCH_CACHE_TTL_MS) {
    return metaFromSummary(batchCache.value);
  }
  const raw = await kvGet(AUDIT_BATCH_META_KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as AuditBatchMeta;
    } catch {
      /* fall through */
    }
  }
  const full = await loadAuditBatchFromKv();
  return full ? metaFromSummary(full) : null;
}

export interface RenderPartnershipStatus {
  partner: 'render';
  tagline: string;
  kv: RenderKvInfo;
  keys: {
    stores: 'rc:store:*';
    rooms: 'rc:room:*';
    auditBatch: typeof AUDIT_BATCH_KEY;
  };
  /** Meta only — full rows live at GET /api/v1/rankings. */
  lastAuditBatch: AuditBatchMeta | null;
  cron: {
    available: boolean;
    schedule: string;
    command: string;
  };
  blueprint: string;
}

export async function getRenderPartnershipStatus(): Promise<RenderPartnershipStatus> {
  const kv = await getRenderKvInfo();
  const lastAuditBatch = await loadAuditBatchMetaFromKv();
  return {
    partner: 'render',
    tagline: 'Render Key Value persists merchant audits and live co-shop rooms across Vercel cold starts.',
    kv,
    keys: {
      stores: 'rc:store:*',
      rooms: 'rc:room:*',
      auditBatch: AUDIT_BATCH_KEY,
    },
    lastAuditBatch,
    cron: {
      available: true,
      schedule: '0 6 * * 1',
      command: 'npm run render:cron-audit',
    },
    blueprint: 'render.yaml',
  };
}
