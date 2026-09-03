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

// api/v1/agent/step.ts
var MODELS = [{ id: "gpt-5.4", label: "GPT-5.4" }];
var DEFAULT_MODEL = MODELS[0].id;
function provider() {
  if (process.env.OPENAI_API_KEY) {
    return {
      name: "openai",
      url: "https://api.openai.com/v1/chat/completions",
      key: process.env.OPENAI_API_KEY,
      model: DEFAULT_MODEL,
      headers: {}
    };
  }
  if (process.env.OPENROUTER_API_KEY) {
    return {
      name: "openrouter",
      url: "https://openrouter.ai/api/v1/chat/completions",
      key: process.env.OPENROUTER_API_KEY,
      model: `openai/${DEFAULT_MODEL}`,
      headers: { "HTTP-Referer": "https://readycounter.vercel.app", "X-Title": "ReadyCounter" }
    };
  }
  return null;
}
var MAX_GOAL = 200;
var MAX_STEPS = 8;
var MAX_HISTORY = 24;
var MAX_TOOL_RESULT = 1200;
var SYSTEM = `You are a shopping agent working inside a merchant's own web page.

You can only act through the tools provided. Work toward the user's shopping
goal in as few calls as possible:
  search_catalog to find something, get_product for detail, add_to_order to put
  it in the shared cart, then prepare_checkout.

prepare_checkout will often REFUSE \u2014 a CAPTCHA, a forced login, or stale stock.
That refusal is the point of this demo, not a failure on your part. When it
refuses, stop calling tools and reply in one short sentence saying what blocked
the purchase and quoting the reason the tool gave you.

Never invent product ids, prices or stock. Only use values a tool returned.
Keep every message under 40 words.`;
var ALLOWED = /* @__PURE__ */ new Set([
  "search_catalog",
  "get_product",
  "add_to_order",
  "update_line_quantity",
  "remove_line",
  "get_order",
  "get_delivery_quote",
  "prepare_checkout"
]);
function toOpenAITools() {
  return TOOL_MANIFEST_WITH_SCHEMAS.filter((t) => ALLOWED.has(t.name)).map((t) => ({
    type: "function",
    function: {
      name: t.name,
      description: t.description,
      parameters: t.inputSchema ?? { type: "object", properties: {} }
    }
  }));
}
async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const api = provider();
  if (!api) {
    return res.status(503).json({
      error: "agent_unconfigured",
      hint: "Set OPENAI_API_KEY (or OPENROUTER_API_KEY). Every other path in ReadyCounter works without it."
    });
  }
  const body = req.body ?? {};
  const goal = typeof body.goal === "string" ? body.goal.slice(0, MAX_GOAL).trim() : "";
  if (!goal) return res.status(400).json({ error: "goal_required" });
  const raw = Array.isArray(body.history) ? body.history : [];
  if (raw.length > MAX_HISTORY) return res.status(400).json({ error: "history_too_long" });
  const history = raw.filter((m) => m && (m.role === "assistant" || m.role === "tool")).map(
    (m) => m.role === "tool" ? {
      role: "tool",
      tool_call_id: String(m.tool_call_id ?? "").slice(0, 80),
      content: String(m.content ?? "").slice(0, MAX_TOOL_RESULT)
    } : { role: "assistant", content: m.content ?? null, tool_calls: m.tool_calls }
  );
  const steps = history.filter((m) => m.role === "assistant").length;
  if (steps >= MAX_STEPS) {
    return res.status(200).json({
      done: true,
      message: "Stopping \u2014 this demo caps the agent at eight steps.",
      steps,
      model: DEFAULT_MODEL
    });
  }
  try {
    const upstream = await fetch(api.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${api.key}`,
        "content-type": "application/json",
        ...api.headers
      },
      body: JSON.stringify({
        model: api.model,
        max_tokens: 500,
        temperature: 0,
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: goal },
          ...history
        ],
        tools: toOpenAITools(),
        tool_choice: "auto"
      })
    });
    if (!upstream.ok) {
      const detail = await upstream.text();
      return res.status(502).json({ error: "upstream_failed", status: upstream.status, detail: detail.slice(0, 300) });
    }
    const data = await upstream.json();
    const message = data.choices?.[0]?.message ?? {};
    const calls = (message.tool_calls ?? []).filter((c) => ALLOWED.has(c.function?.name));
    res.setHeader("cache-control", "no-store");
    return res.status(200).json({
      model: DEFAULT_MODEL,
      provider: api.name,
      steps: steps + 1,
      message: message.content ?? null,
      toolCalls: calls.map((c) => ({ id: c.id, name: c.function.name, arguments: c.function.arguments })),
      done: calls.length === 0
    });
  } catch (err) {
    return res.status(502).json({ error: "agent_failed", detail: err instanceof Error ? err.message : String(err) });
  }
}
export {
  MODELS,
  handler as default
};
//# sourceMappingURL=step.js.map
