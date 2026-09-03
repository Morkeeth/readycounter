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

// src/integrations/shopify-catalog.ts
function normalizeTags(tags) {
  if (Array.isArray(tags)) return tags.map((t) => String(t).trim()).filter(Boolean);
  if (typeof tags === "string") {
    return tags.split(",").map((t) => t.trim()).filter(Boolean);
  }
  return [];
}
function shopifyToProduct(row) {
  const variant = row.variants[0];
  const price = variant ? parseFloat(variant.price) : 0;
  const category = row.product_type || "merch";
  const tagsRaw = row.tags;
  return {
    id: variant?.sku ?? row.id,
    name: row.title,
    description: row.body_html.replace(/<[^>]+>/g, " ").trim(),
    price: Number.isFinite(price) ? price : 0,
    currency: "USD",
    tags: normalizeTags(tagsRaw),
    category,
    inStock: (variant?.inventory_quantity ?? 0) > 0,
    ...variant?.barcode ? { gtin: variant.barcode } : {},
    feedPrice: price
  };
}
function importShopifyFeed(feed, opts) {
  const slug = opts?.storeId ?? `import-${feed.store.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 24)}`;
  const products = feed.products.map(shopifyToProduct);
  const categories = [...new Set(products.map((p) => p.category))];
  const name = opts?.name ?? feed.store;
  return {
    id: slug,
    name,
    tagline: "Imported Shopify catalog \u2014 agent-ready feed",
    products,
    merchant: {
      storeName: name,
      checkoutRequiresCaptcha: false,
      checkoutRequiresAccount: false
    },
    categories
  };
}

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
async function kvSet(key, value, opts) {
  memory.set(key, value);
  const timeout = opts?.large ? KV_LARGE_OP_MS : KV_OP_MS;
  await withRedis((client) => client.set(key, value), timeout);
}

// src/server/custom-stores.ts
var memory2 = /* @__PURE__ */ new Map();
var STORE_PREFIX = "rc:store:";
async function registerServerCustomStore(def2) {
  memory2.set(def2.id, def2);
  await kvSet(`${STORE_PREFIX}${def2.id}`, JSON.stringify(def2));
}

// api/v1/stores/custom.ts
async function handler(req, res) {
  if (req.method === "POST") {
    const body = req.body;
    if (body.store) {
      await registerServerCustomStore(body.store);
      return res.status(201).json({ ok: true, storeId: body.store.id });
    }
    if (body.feed) {
      const def2 = importShopifyFeed(body.feed, {
        storeId: body.storeId,
        name: body.storeName
      });
      await registerServerCustomStore(def2);
      return res.status(201).json({
        ok: true,
        storeId: def2.id,
        name: def2.name,
        productCount: def2.products.length
      });
    }
    return res.status(400).json({ error: "Provide feed or store in body" });
  }
  if (req.method === "GET") {
    return res.status(200).json({
      hint: "POST Shopify feed JSON or full StoreDefinition to register a custom store for API reads."
    });
  }
  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Method not allowed" });
}
export {
  handler as default
};
//# sourceMappingURL=custom.js.map
