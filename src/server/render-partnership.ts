/**
 * Render partnership layer — Key Value is the durable backbone for ReadyCounter.
 * Vercel runs stateless API; Render persists stores, rooms, and audit batches.
 */

import { kvBackend, kvGet, kvPing, kvSet } from './kv';

export const RENDER_KV_PREFIX = 'rc:render:';
export const AUDIT_BATCH_KEY = `${RENDER_KV_PREFIX}audit-batch:latest`;
export const AUDIT_BATCH_AT_KEY = `${RENDER_KV_PREFIX}audit-batch:at`;

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
  rows: Array<{
    url: string;
    storeId?: string;
    catalogScore?: number;
    catalogBudget?: number;
    gtinPct?: number;
    captchaHint?: boolean;
    method?: string;
    products?: number;
    error?: string;
  }>;
}

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

export async function saveAuditBatchToKv(rows: AuditBatchSummary['rows']): Promise<void> {
  const succeeded = rows.filter((r) => !r.error);
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

  const summary: AuditBatchSummary = {
    at: new Date().toISOString(),
    shopCount: rows.length,
    succeeded: succeeded.length,
    avgCatalogScore: avgCatalog,
    avgGtinPct: avgGtin,
    rows,
  };
  await kvSet(AUDIT_BATCH_KEY, JSON.stringify(summary));
  await kvSet(AUDIT_BATCH_AT_KEY, summary.at);
}

export async function loadAuditBatchFromKv(): Promise<AuditBatchSummary | null> {
  const raw = await kvGet(AUDIT_BATCH_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuditBatchSummary;
  } catch {
    return null;
  }
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
  lastAuditBatch: AuditBatchSummary | null;
  cron: {
    available: boolean;
    schedule: string;
    command: string;
  };
  blueprint: string;
}

export async function getRenderPartnershipStatus(): Promise<RenderPartnershipStatus> {
  const kv = await getRenderKvInfo();
  const lastAuditBatch = await loadAuditBatchFromKv();
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
