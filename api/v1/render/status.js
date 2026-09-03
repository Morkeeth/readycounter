// src/server/render-partnership.ts
import { gunzipSync, gzipSync } from "node:zlib";

// src/server/kv.ts
var memory = /* @__PURE__ */ new Map();
var CONNECT_MS = 8e3;
var KV_OP_MS = 1e4;
var KV_LARGE_OP_MS = 2e4;
var redisClient = null;
var redisReady = null;
function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("redis op timeout")), ms);
    promise.then((v) => {
      clearTimeout(timer);
      resolve(v);
    }).catch((err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}
function dropRedisClient(client) {
  if (client && redisClient !== client) return;
  redisClient = null;
  redisReady = null;
}
async function connectRedis() {
  const url = process.env.REDIS_URL?.trim();
  if (!url) return null;
  if (redisClient) {
    if (redisClient.isOpen) return redisClient;
    dropRedisClient(redisClient);
  }
  if (!redisReady) {
    redisReady = withTimeout(
      (async () => {
        try {
          const { createClient } = await import("redis");
          const client = createClient({
            url,
            socket: {
              connectTimeout: CONNECT_MS,
              reconnectStrategy: () => false,
              ...url.startsWith("rediss://") ? { tls: true } : {}
            }
          });
          client.on("error", () => {
          });
          await client.connect();
          redisClient = client;
          return client;
        } catch {
          redisReady = null;
          return null;
        }
      })(),
      CONNECT_MS
    ).catch(() => {
      redisReady = null;
      return null;
    });
  }
  return redisReady;
}
async function kvBackend() {
  const client = await connectRedis();
  return client ? "redis" : "memory";
}
async function kvPing() {
  const client = await connectRedis();
  if (!client) return false;
  try {
    const pong = await withTimeout(client.ping(), 4e3);
    return pong === "PONG";
  } catch (err) {
    if (isClosedClientError(client, err)) dropRedisClient(client);
    return false;
  }
}
function isClosedClientError(client, err) {
  if (!client.isOpen) return true;
  const name = err?.name;
  const message = err?.message ?? "";
  return name === "ClientClosedError" || /client is closed/i.test(message);
}
async function withRedis(op, ms) {
  let client = await connectRedis();
  if (!client) return void 0;
  try {
    return await withTimeout(op(client), ms);
  } catch (err) {
    if (!isClosedClientError(client, err)) return void 0;
    dropRedisClient(client);
    client = await connectRedis();
    if (!client) return void 0;
    try {
      return await withTimeout(op(client), ms);
    } catch {
      return void 0;
    }
  }
}
async function kvGet(key, opts) {
  const timeout = opts?.large ? KV_LARGE_OP_MS : KV_OP_MS;
  const value = await withRedis((client) => client.get(key), timeout);
  if (value !== void 0) return value;
  return memory.get(key) ?? null;
}

// src/server/render-partnership.ts
var RENDER_KV_PREFIX = "rc:render:";
var AUDIT_BATCH_KEY = `${RENDER_KV_PREFIX}audit-batch:latest`;
var AUDIT_BATCH_AT_KEY = `${RENDER_KV_PREFIX}audit-batch:at`;
var AUDIT_BATCH_META_KEY = `${RENDER_KV_PREFIX}audit-batch:meta`;
var GZIP_PREFIX = "gz1:";
var batchCache = null;
var BATCH_CACHE_TTL_MS = 6e4;
function parseRenderKvFromUrl(redisUrl) {
  if (!redisUrl?.trim()) {
    return { provider: "memory", hostname: null, region: null, instanceHint: null, connected: false };
  }
  try {
    const u = new URL(redisUrl);
    const host = u.hostname;
    const isRender = host.includes("keyvalue.render.com") || host.includes("render.com");
    const regionMatch = host.match(/^([a-z]+)-keyvalue\.render\.com$/);
    const instanceHint = u.username || host.split(".")[0] || null;
    return {
      provider: isRender ? "render" : "other",
      hostname: host,
      region: regionMatch?.[1] ?? process.env.RENDER_KV_REGION ?? null,
      instanceHint,
      connected: false
    };
  } catch {
    return { provider: "other", hostname: null, region: null, instanceHint: null, connected: false };
  }
}
async function getRenderKvInfo() {
  const base = parseRenderKvFromUrl(process.env.REDIS_URL);
  const backend = await kvBackend();
  const connected = backend === "redis" && await kvPing();
  return { ...base, provider: backend === "redis" ? base.provider : "memory", connected };
}
function decodeAuditBatchPayload(raw) {
  try {
    if (raw.startsWith(GZIP_PREFIX)) {
      const buf = Buffer.from(raw.slice(GZIP_PREFIX.length), "base64");
      const json = gunzipSync(buf).toString("utf8");
      return JSON.parse(json);
    }
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
function metaFromSummary(summary) {
  return {
    at: summary.at,
    shopCount: summary.shopCount,
    succeeded: summary.succeeded,
    avgCatalogScore: summary.avgCatalogScore,
    avgGtinPct: summary.avgGtinPct,
    avgOfferPct: summary.avgOfferPct
  };
}
async function fetchBatchFromKv() {
  const raw = await kvGet(AUDIT_BATCH_KEY, { large: true });
  if (!raw) return null;
  return decodeAuditBatchPayload(raw);
}
async function loadAuditBatchFromKv() {
  if (batchCache && Date.now() - batchCache.at < BATCH_CACHE_TTL_MS) {
    return batchCache.value;
  }
  let summary = await fetchBatchFromKv();
  if (!summary) {
    await new Promise((r) => setTimeout(r, 150));
    summary = await fetchBatchFromKv();
  }
  if (summary) {
    batchCache = { at: Date.now(), value: summary };
    return summary;
  }
  if (batchCache) return batchCache.value;
  return null;
}
async function loadAuditBatchMetaFromKv() {
  if (batchCache && Date.now() - batchCache.at < BATCH_CACHE_TTL_MS) {
    return metaFromSummary(batchCache.value);
  }
  const raw = await kvGet(AUDIT_BATCH_META_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
    }
  }
  const full = await loadAuditBatchFromKv();
  return full ? metaFromSummary(full) : null;
}
async function getRenderPartnershipStatus() {
  const kv = await getRenderKvInfo();
  const lastAuditBatch = await loadAuditBatchMetaFromKv();
  return {
    partner: "render",
    tagline: "Render Key Value persists merchant audits and live co-shop rooms across Vercel cold starts.",
    kv,
    keys: {
      stores: "rc:store:*",
      rooms: "rc:room:*",
      auditBatch: AUDIT_BATCH_KEY
    },
    lastAuditBatch,
    cron: {
      available: true,
      schedule: "0 6 * * 1",
      command: "npm run render:cron-audit"
    },
    blueprint: "render.yaml"
  };
}

// api/v1/render/status.ts
async function handler(_req, res) {
  const status = await getRenderPartnershipStatus();
  return res.status(200).json(status);
}
export {
  handler as default
};
//# sourceMappingURL=status.js.map
