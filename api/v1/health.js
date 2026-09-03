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
import { gunzipSync, gzipSync } from "node:zlib";
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

// src/data/sandbox-stores.ts
var AGENT_OK = [
  { id: "card_on_file", label: "Card on file", agentCompletable: true }
];
var CHAOS_PETS = [
  { id: "cp-kibble", name: "Chaos Kibble 15lb", description: "Chicken & chaos. Vet approved-ish.", price: 48, currency: "USD", tags: ["dog"], category: "food", inStock: true, feedPrice: 52 },
  { id: "cp-squeak", name: "Squeaky Void Duck", description: "Unreasonably loud. Agents hate it.", price: 14, currency: "USD", tags: ["toy"], category: "toys", inStock: true },
  { id: "cp-bed", name: "Memory Foam Dog Bed", description: "XL. Removable cover.", price: 89, currency: "USD", tags: ["bed"], category: "beds", inStock: true, gtin: "00819999001001" },
  { id: "cp-treat", name: "Salmon Bites", description: "Single ingredient. 8oz.", price: 12, currency: "USD", tags: ["treat"], category: "treats", inStock: true, feedPrice: 12 },
  { id: "cp-cat", name: "Cat Chaos Wand", description: "Feather attachment. 3-pack.", price: 9, currency: "USD", tags: ["cat"], category: "toys", inStock: true },
  { id: "cp-bandana", name: "Agent-Proof Bandana", description: "S/M. Machine wash.", price: 16, currency: "USD", tags: ["merch"], category: "merch", inStock: true },
  { id: "cp-sub", name: "Monthly Treat Box", description: "Surprise toys. Cancel anytime.", price: 29, currency: "USD", tags: ["subscription"], category: "subscription", inStock: true },
  { id: "cp-oos", name: "Limited Edition Collar", description: "Sold out. Restock unknown.", price: 22, currency: "USD", tags: ["collar"], category: "merch", inStock: false }
];
var VINYL_PRODUCTS = [
  { id: "mv-1979", name: "Midnight on Vinyl \u2014 1979 Press", description: "180g remaster. Gatefold.", price: 34, currency: "USD", tags: ["vinyl"], category: "records", inStock: true, gtin: "00818888001001", feedPrice: 29 },
  { id: "mv-live", name: "Live at the Cellar", description: "2LP. Record Store Day.", price: 42, currency: "USD", tags: ["vinyl"], category: "records", inStock: true, gtin: "00818888001018", feedPrice: 38 },
  { id: "mv-tee", name: "Tour Tee \u2014 Fade Black", description: "Unisex. Soft cotton.", price: 28, currency: "USD", tags: ["merch"], category: "merch", inStock: true, gtin: "00818888001025", feedPrice: 24 },
  { id: "mv-poster", name: "Glow-in-Dark Poster", description: "24\xD736. Ships rolled.", price: 18, currency: "USD", tags: ["merch"], category: "merch", inStock: true, gtin: "00818888001032", feedPrice: 15 },
  { id: "mv-cassette", name: "Demo Tape (Cassette)", description: "Limited 100. Orange shell.", price: 12, currency: "USD", tags: ["tape"], category: "records", inStock: true, gtin: "00818888001049", feedPrice: 12 },
  { id: "mv-bundle", name: "LP + Tee Bundle", description: "Save on the combo.", price: 55, currency: "USD", tags: ["bundle"], category: "bundles", inStock: true, gtin: "00818888001056", feedPrice: 49 },
  { id: "mv-slipmat", name: "Custom Slipmat", description: "Felt. Anti-static.", price: 22, currency: "USD", tags: ["equipment"], category: "equipment", inStock: true, gtin: "00818888001063", feedPrice: 22 },
  { id: "mv-sub", name: "Record of the Month", description: "Curated reissues.", price: 32, currency: "USD", tags: ["subscription"], category: "subscription", inStock: true, gtin: "00818888001070", feedPrice: 32 }
];
var PARADISE_PRODUCTS = [
  { id: "ap-beans", name: "Agent-Friendly Espresso", description: "GTIN on every bag. Guest checkout.", price: 19, currency: "USD", tags: ["coffee"], category: "beans", inStock: true, gtin: "00817777001001", feedPrice: 19 },
  { id: "ap-kit", name: "Starter Brew Kit", description: "Everything an agent needs to quote.", price: 45, currency: "USD", tags: ["kit"], category: "kits", inStock: true, gtin: "00817777001018", feedPrice: 45 },
  { id: "ap-mug", name: "Paradise Mug", description: "12oz. Dishwasher safe.", price: 16, currency: "USD", tags: ["merch"], category: "merch", inStock: true, gtin: "00817777001025", feedPrice: 16 },
  { id: "ap-sub", name: "Monthly Agent Box", description: "Structured feed sync.", price: 28, currency: "USD", tags: ["subscription"], category: "subscription", inStock: true, gtin: "00817777001032", feedPrice: 28 },
  { id: "ap-grinder", name: "Quiet Burr Grinder", description: "Agent-readable specs.", price: 79, currency: "USD", tags: ["equipment"], category: "equipment", inStock: true, gtin: "00817777001049", feedPrice: 79 },
  { id: "ap-cold", name: "Cold Brew RTD", description: "Shelf-stable 14 days.", price: 6, currency: "USD", tags: ["rtd"], category: "beverages", inStock: true, gtin: "00817777001056", feedPrice: 6 },
  { id: "ap-decaf", name: "Swiss Water Decaf", description: "Full barcode coverage.", price: 20, currency: "USD", tags: ["decaf"], category: "beans", inStock: true, gtin: "00817777001063", feedPrice: 20 },
  { id: "ap-gift", name: "Gift Card", description: "Digital delivery.", price: 50, currency: "USD", tags: ["gift"], category: "gift", inStock: true, gtin: "00817777001070", feedPrice: 50 }
];
var GHOST_PRODUCTS = [
  { id: "gg-lamp", name: "Haunted Desk Lamp", description: "Dims when agents approach.", price: 44, currency: "USD", tags: ["home"], category: "home", inStock: false, gtin: "00816666001001", feedPrice: 44 },
  { id: "gg-candle", name: "Spectral Candle", description: "Smells like checkout errors.", price: 18, currency: "USD", tags: ["home"], category: "home", inStock: false, gtin: "00816666001018", feedPrice: 18 },
  { id: "gg-mirror", name: "Mirror (Sold Out)", description: "Reflects your cart abandon rate.", price: 120, currency: "USD", tags: ["home"], category: "home", inStock: false, gtin: "00816666001025", feedPrice: 120 },
  { id: "gg-pillow", name: "Ghost Pillow", description: "Soft. In stock.", price: 32, currency: "USD", tags: ["home"], category: "home", inStock: true, gtin: "00816666001032", feedPrice: 32 },
  { id: "gg-blanket", name: "Weighted Blanket", description: "Heavy like stale feeds.", price: 89, currency: "USD", tags: ["home"], category: "home", inStock: true, gtin: "00816666001049", feedPrice: 89 },
  { id: "gg-mug", name: "404 Mug", description: "Not found (in warehouse).", price: 14, currency: "USD", tags: ["merch"], category: "merch", inStock: false, gtin: "00816666001056", feedPrice: 14 },
  { id: "gg-poster", name: "Abandonment Poster", description: "78.6% edition.", price: 22, currency: "USD", tags: ["merch"], category: "merch", inStock: true, gtin: "00816666001063", feedPrice: 22 },
  { id: "gg-sticker", name: "Sticker Pack", description: "Five ghosts. In stock.", price: 8, currency: "USD", tags: ["merch"], category: "merch", inStock: true, gtin: "00816666001070", feedPrice: 8 }
];
function def(id, name, tagline, products, merchant, categories, sandboxProfile) {
  return { id, name, tagline, products, merchant, categories, sandboxProfile };
}
var SANDBOX_STORES = {
  "chaos-pets": def(
    "chaos-pets",
    "Chaos Pets Supply",
    "Everything an agent could want \xB7 none of it reachable",
    CHAOS_PETS,
    {
      storeName: "Chaos Pets Supply",
      checkoutRequiresCaptcha: true,
      checkoutRequiresAccount: true,
      paymentMethods: []
    },
    ["food", "toys", "treats", "beds", "merch", "subscription"],
    "multi-wall"
  ),
  "midnight-vinyl": def(
    "midnight-vinyl",
    "Midnight Vinyl Club",
    "Feed says $29 \xB7 shelf says $34 \xB7 agents bail",
    VINYL_PRODUCTS,
    {
      storeName: "Midnight Vinyl Club",
      checkoutRequiresCaptcha: false,
      checkoutRequiresAccount: false,
      paymentMethods: AGENT_OK
    },
    ["records", "merch", "bundles", "equipment", "subscription"],
    "feed-drift"
  ),
  "agent-paradise": def(
    "agent-paradise",
    "Agent Paradise Co.",
    "The control group \u2014 every line green",
    PARADISE_PRODUCTS,
    {
      storeName: "Agent Paradise Co.",
      checkoutRequiresCaptcha: false,
      checkoutRequiresAccount: false,
      paymentMethods: AGENT_OK
    },
    ["beans", "kits", "merch", "subscription", "equipment", "beverages", "gift"],
    "golden-path"
  ),
  "ghost-goods": def(
    "ghost-goods",
    "Ghost Goods",
    "Catalog full \xB7 shelf empty \xB7 stale at checkout",
    GHOST_PRODUCTS,
    {
      storeName: "Ghost Goods",
      checkoutRequiresCaptcha: false,
      checkoutRequiresAccount: false,
      paymentMethods: AGENT_OK
    },
    ["home", "merch"],
    "stale-shelf"
  )
};

// src/data/stores.ts
var EMBER_OAK_PRODUCTS = [
  {
    id: "sku-espresso",
    name: "House Espresso Blend",
    description: "12oz bag. Notes of dark chocolate and orange zest. Whole bean.",
    price: 18,
    currency: "USD",
    tags: ["coffee", "espresso", "whole-bean"],
    category: "beans",
    inStock: true,
    gtin: "00812345001001",
    feedPrice: 18
  },
  {
    id: "sku-pour-over",
    name: "Single-Origin Pour Over Kit",
    description: "Ceramic dripper, filters (100), and 8oz sample of Ethiopian Yirgacheffe.",
    price: 42,
    currency: "USD",
    tags: ["coffee", "gift", "brewing"],
    category: "kits",
    inStock: true,
    gtin: "00812345001018",
    feedPrice: 42
  },
  {
    id: "sku-grinder",
    name: "Burr Grinder Mini",
    description: "38mm conical burrs. 15 grind settings. USB-C rechargeable.",
    price: 89,
    currency: "USD",
    tags: ["equipment", "grinder"],
    category: "equipment",
    inStock: true,
    gtin: "00812345001025",
    feedPrice: 89
  },
  {
    id: "sku-cold-brew",
    name: "Cold Brew Concentrate",
    description: "32oz bottle. 1:4 dilution. Shelf-stable 14 days refrigerated.",
    price: 14,
    currency: "USD",
    tags: ["coffee", "cold-brew", "ready-to-drink"],
    category: "beverages",
    inStock: true,
    gtin: "00812345001032",
    feedPrice: 14
  },
  {
    id: "sku-mug",
    name: "Stoneware Diner Mug",
    description: "10oz. Dishwasher safe. Ember & Oak logo.",
    price: 22,
    currency: "USD",
    tags: ["merch", "gift"],
    category: "merch",
    inStock: true,
    gtin: "00812345001049",
    feedPrice: 22
  },
  {
    id: "sku-subscription",
    name: "Monthly Bean Club",
    description: "Rotating single-origin. Ships first Monday. Cancel anytime.",
    price: 24,
    currency: "USD",
    tags: ["subscription", "coffee"],
    category: "subscription",
    inStock: true,
    feedPrice: 24
  },
  {
    id: "sku-decaf",
    name: "Swiss Water Decaf",
    description: "12oz bag. Colombia sugar-cane process. Whole bean.",
    price: 19,
    currency: "USD",
    tags: ["coffee", "decaf"],
    category: "beans",
    inStock: false,
    gtin: "00812345001056",
    feedPrice: 19
  },
  {
    id: "sku-scale",
    name: "Brew Scale",
    description: "0.1g precision. Auto-timer for pour-over.",
    price: 35,
    currency: "USD",
    tags: ["equipment"],
    category: "equipment",
    inStock: true,
    gtin: "00812345001063",
    feedPrice: 29
  }
];
var NEON_MATCHA_PRODUCTS = [
  {
    id: "nm-ceremonial",
    name: "Ceremonial Grade Matcha",
    description: "30g tin. Uji, Kyoto. Stone-ground. First harvest.",
    price: 38,
    currency: "USD",
    tags: ["matcha", "ceremonial"],
    category: "powder",
    inStock: true,
    gtin: "00812346001001",
    feedPrice: 38
  },
  {
    id: "nm-latte",
    name: "Barista Latte Blend",
    description: "100g pouch. Optimized for oat milk lattes.",
    price: 26,
    currency: "USD",
    tags: ["matcha", "latte"],
    category: "powder",
    inStock: true,
    feedPrice: 26
  },
  {
    id: "nm-whisk",
    name: "Bamboo Chasen Whisk",
    description: "80-prong traditional whisk. Hand-cut.",
    price: 24,
    currency: "USD",
    tags: ["equipment", "ceremony"],
    category: "equipment",
    inStock: true,
    feedPrice: 24
  },
  {
    id: "nm-bowl",
    name: "Chawan Tea Bowl",
    description: "400ml ceramic. Matte glaze. Dishwasher safe.",
    price: 45,
    currency: "USD",
    tags: ["equipment", "ceremony"],
    category: "equipment",
    inStock: true,
    feedPrice: 45
  },
  {
    id: "nm-rtd",
    name: "Ready-to-Drink Matcha",
    description: "12oz can. Unsweetened. Shelf-stable.",
    price: 5,
    currency: "USD",
    tags: ["rtd", "ready-to-drink"],
    category: "beverages",
    inStock: true,
    feedPrice: 5
  },
  {
    id: "nm-sub",
    name: "Matcha Monthly",
    description: "Rotating regional matcha. Pause anytime.",
    price: 32,
    currency: "USD",
    tags: ["subscription"],
    category: "subscription",
    inStock: true,
    feedPrice: 32
  },
  {
    id: "nm-soldout",
    name: "Limited Hojicha Powder",
    description: "Seasonal roast. 50g.",
    price: 28,
    currency: "USD",
    tags: ["hojicha"],
    category: "powder",
    inStock: false,
    gtin: "00812346001018",
    feedPrice: 28
  },
  {
    id: "nm-set",
    name: "Starter Ceremony Set",
    description: "Whisk, bowl, scoop, and 20g ceremonial sample.",
    price: 72,
    currency: "USD",
    tags: ["kit", "gift"],
    category: "kits",
    inStock: true,
    feedPrice: 65
  }
];
var EMBER_OAK_PAYMENT = [
  {
    id: "card_on_file",
    label: "Card on file",
    agentCompletable: true
  },
  {
    id: "apple_pay",
    label: "Apple Pay",
    agentCompletable: false,
    humanStep: "device biometric on the handset"
  },
  {
    id: "invoice_net30",
    label: "Invoice, net 30",
    agentCompletable: false,
    humanStep: "manual approval by the wholesale desk"
  }
];
var NEON_MATCHA_PAYMENT = [
  {
    id: "card_3ds",
    label: "Card with 3-D Secure",
    agentCompletable: false,
    humanStep: "3-D Secure step-up on every transaction"
  },
  {
    id: "paypal",
    label: "PayPal",
    agentCompletable: false,
    humanStep: "redirect to a PayPal login"
  },
  {
    id: "bank_transfer",
    label: "Bank transfer",
    agentCompletable: false,
    humanStep: "the shopper moves the money by hand"
  }
];
var STORES = {
  "ember-oak": {
    id: "ember-oak",
    name: "Ember & Oak Coffee",
    tagline: "Small-batch coffee \xB7 shipped fresh weekly",
    products: EMBER_OAK_PRODUCTS,
    merchant: {
      storeName: "Ember & Oak Coffee",
      checkoutRequiresCaptcha: true,
      checkoutRequiresAccount: false,
      paymentMethods: EMBER_OAK_PAYMENT
    },
    categories: ["beans", "kits", "equipment", "beverages", "merch", "subscription"],
    sandboxProfile: "captcha-wall"
  },
  "neon-matcha": {
    id: "neon-matcha",
    name: "Neon Matcha Lab",
    tagline: "Ceremonial matcha from Uji \xB7 barista blends",
    products: NEON_MATCHA_PRODUCTS,
    merchant: {
      storeName: "Neon Matcha Lab",
      checkoutRequiresCaptcha: false,
      checkoutRequiresAccount: true,
      paymentMethods: NEON_MATCHA_PAYMENT
    },
    categories: ["powder", "kits", "equipment", "beverages", "subscription"],
    sandboxProfile: "account-wall"
  },
  ...SANDBOX_STORES
};
var DEFAULT_STORE_ID = "ember-oak";
var STORE_IDS = Object.keys(STORES);
var CUSTOM_STORAGE_KEY = "readycounter-custom-stores";
function loadCustomStores() {
  if (typeof localStorage === "undefined") return {};
  try {
    const raw = localStorage.getItem(CUSTOM_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
var customStores = loadCustomStores();
var MERCHANT_DEFAULTS = STORES[DEFAULT_STORE_ID].merchant;

// src/server/shopify.ts
function getShopifyConfig() {
  const clientId = process.env.SHOPIFY_CLIENT_ID?.trim();
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET?.trim();
  const appUrl = (process.env.SHOPIFY_APP_URL ?? "https://tooltruth-webmcp.vercel.app").replace(
    /\/$/,
    ""
  );
  if (!clientId || !clientSecret) return null;
  return {
    clientId,
    clientSecret,
    appUrl,
    scopes: process.env.SHOPIFY_SCOPES ?? "read_products,read_product_listings",
    devShop: process.env.SHOPIFY_DEV_SHOP?.trim() ?? null
  };
}
function shopifyConfigured() {
  return getShopifyConfig() !== null;
}

// api/v1/health.ts
async function handler(_req, res) {
  const backend = await kvBackend();
  const redisOk = backend === "redis" ? await kvPing() : false;
  const renderKv = await getRenderKvInfo();
  const lastAuditBatch = await loadAuditBatchMetaFromKv();
  res.status(200).json({
    ok: true,
    service: "readycounter-api",
    version: 1,
    integrations: [
      "shopify-catalog",
      "shopify-oauth",
      "coshop-rooms",
      "webmcp",
      "render-kv",
      "url-audit",
      "render-cron"
    ],
    useCase: "shopify-oauth + render-kv \u2014 connect catalog, persist audit, live co-shop",
    kv: { backend, redisOk },
    shopify: { configured: shopifyConfigured() },
    render: {
      partner: true,
      kv: renderKv,
      lastAuditBatchAt: lastAuditBatch?.at ?? null,
      cronBlueprint: "render.yaml",
      statusEndpoint: "/api/v1/render/status"
    }
  });
}
export {
  handler as default
};
//# sourceMappingURL=health.js.map
