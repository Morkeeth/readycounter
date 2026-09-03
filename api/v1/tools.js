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
    tools: TOOL_MANIFEST
  });
}
export {
  handler as default
};
//# sourceMappingURL=tools.js.map
