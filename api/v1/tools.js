// src/webmcp/toolSchemas.ts
var TOOL_SCHEMAS = {
  search_catalog: {
    type: "object",
    properties: {
      query: { type: "string", description: "Free-text search." },
      category: {
        type: "string",
        enum: [
          "beans",
          "kits",
          "equipment",
          "beverages",
          "merch",
          "subscription",
          "powder"
        ]
      },
      max_price: { type: "number", minimum: 0 },
      in_stock_only: { type: "boolean" }
    },
    additionalProperties: false
  },
  get_product: {
    type: "object",
    properties: {
      id: { type: "string", description: "Product SKU id. `product_id` and `sku` are accepted too." }
    },
    required: ["id"],
    additionalProperties: false
  },
  add_to_order: {
    type: "object",
    properties: {
      product_id: {
        type: "string",
        description: "Product SKU id, as returned by search_catalog. `id` and `sku` are accepted too."
      },
      quantity: { type: "integer", minimum: 1, maximum: 99, default: 1 }
    },
    required: ["product_id"],
    additionalProperties: false
  },
  update_line_quantity: {
    type: "object",
    properties: {
      line_id: { type: "string" },
      quantity: { type: "integer", minimum: 0, maximum: 99 }
    },
    required: ["line_id", "quantity"],
    additionalProperties: false
  },
  remove_line: {
    type: "object",
    properties: { line_id: { type: "string" } },
    required: ["line_id"],
    additionalProperties: false
  },
  get_order: {
    type: "object",
    properties: {},
    additionalProperties: false
  },
  get_delivery_quote: {
    type: "object",
    properties: {},
    additionalProperties: false
  },
  prepare_checkout: {
    type: "object",
    properties: {},
    additionalProperties: false
  },
  get_readiness_score: {
    type: "object",
    properties: {},
    additionalProperties: false
  },
  get_merchant_config: {
    type: "object",
    properties: {},
    additionalProperties: false
  },
  create_coshop_room: {
    type: "object",
    properties: {},
    additionalProperties: false
  },
  export_shopify_catalog: {
    type: "object",
    properties: {},
    additionalProperties: false
  },
  validate_catalog_feed: {
    type: "object",
    properties: {},
    additionalProperties: false
  },
  apply_readiness_fix: {
    type: "object",
    properties: {
      fix: {
        type: "string",
        enum: ["disable_captcha", "disable_account_wall", "sync_feed_prices"]
      }
    },
    required: ["fix"],
    additionalProperties: false
  },
  simulate_agent_journey: {
    type: "object",
    properties: {},
    additionalProperties: false
  },
  import_shopify_catalog: {
    type: "object",
    properties: {
      feed: { type: "object", description: "Shopify Catalog export JSON" },
      store_id: { type: "string" },
      store_name: { type: "string" }
    },
    required: ["feed"],
    additionalProperties: false
  },
  get_field_companion: {
    type: "object",
    properties: {
      topic: {
        type: "string",
        description: "all | issues | checklist | research | protocols | issue id (e.g. gtin-gap) | rank number"
      }
    },
    additionalProperties: false
  },
  review_against_field: {
    type: "object",
    properties: {
      gtinPct: { type: "number" },
      catalogScore: { type: "number" },
      captchaHint: { type: "boolean" },
      productsJsonOk: { type: "boolean" },
      accountWall: { type: "boolean" },
      error: { type: "string" }
    },
    additionalProperties: false
  }
};

// src/webmcp/toolManifest.ts
var WEBMCP_TOOL_COUNT = 18;
var TOOL_MANIFEST = [
  {
    name: "search_catalog",
    description: "Search catalog by query, category, max_price, in_stock_only.",
    readOnly: true
  },
  { name: "get_product", description: "Full product record by SKU id.", readOnly: true },
  { name: "add_to_order", description: "Add to shared co-shop order (no payment)." },
  { name: "update_line_quantity", description: "Update line quantity in shared order." },
  { name: "remove_line", description: "Remove a line from shared order." },
  { name: "get_order", description: "Current shared order + subtotal.", readOnly: true },
  { name: "get_delivery_quote", description: "Shipping quote for current order.", readOnly: true },
  {
    name: "prepare_checkout",
    description: "Validate checkout; blocked if CAPTCHA/account wall.",
    readOnly: true
  },
  {
    name: "get_readiness_score",
    description: "Merchant readiness /100 + per-check breakdown.",
    readOnly: true
  },
  { name: "get_merchant_config", description: "Checkout flags + store metadata.", readOnly: true },
  {
    name: "create_coshop_room",
    description: "Create live API-backed co-shop room with share URL."
  },
  {
    name: "export_shopify_catalog",
    description: "Export Shopify Catalog JSON for agent feeds.",
    readOnly: true
  },
  {
    name: "validate_catalog_feed",
    description: "Validate Shopify-shaped feed (GTIN, variants, prices).",
    readOnly: true
  },
  {
    name: "apply_readiness_fix",
    description: "Autopilot: disable CAPTCHA, remove account wall, or sync stale feed prices."
  },
  {
    name: "simulate_agent_journey",
    description: "Run search \u2192 add \u2192 order \u2192 checkout and return pass/fail per step.",
    readOnly: true
  },
  {
    name: "import_shopify_catalog",
    description: "Import Shopify JSON as a new browsable store (client persist)."
  },
  {
    name: "get_field_companion",
    description: "Agent commerce handbook: pressing issues, checklist, research briefs, protocols. topic=issues|checklist|research|protocols|gtin-gap|\u2026",
    readOnly: true
  },
  {
    name: "review_against_field",
    description: "Map a store\u2019s crawl signals (gtinPct, captchaHint, catalogScore, error) to handbook issues + next steps.",
    readOnly: true
  }
];
var TOOL_MANIFEST_WITH_SCHEMAS = TOOL_MANIFEST.map((t) => ({
  ...t,
  inputSchema: TOOL_SCHEMAS[t.name]
}));

// api/v1/tools.ts
function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }
  return res.status(200).json({
    version: "1",
    toolCount: WEBMCP_TOOL_COUNT,
    openapi: "/openapi.yaml",
    tools: TOOL_MANIFEST_WITH_SCHEMAS
  });
}
export {
  handler as default
};
//# sourceMappingURL=tools.js.map
