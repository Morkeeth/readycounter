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

// api/v1/agent/step.ts
var MODELS = [
  { id: "openai/gpt-5.6-terra-pro", label: "GPT-5.6 Terra Pro" },
  { id: "anthropic/claude-opus-5", label: "Claude Opus 5" },
  { id: "anthropic/claude-sonnet-5", label: "Claude Sonnet 5" },
  { id: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro" },
  { id: "openai/gpt-5.6-sol", label: "GPT-5.6 Sol" }
];
var DEFAULT_MODEL = MODELS[0].id;
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
  return TOOL_MANIFEST.filter((t) => ALLOWED.has(t.name)).map((t) => ({
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
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    return res.status(503).json({
      error: "agent_unconfigured",
      hint: "Set OPENROUTER_API_KEY. Every other path in ReadyCounter works without it."
    });
  }
  const body = req.body ?? {};
  const goal = typeof body.goal === "string" ? body.goal.slice(0, MAX_GOAL).trim() : "";
  if (!goal) return res.status(400).json({ error: "goal_required" });
  const asked = typeof body.model === "string" ? body.model : "";
  const model = MODELS.some((m) => m.id === asked) ? asked : DEFAULT_MODEL;
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
      model
    });
  }
  try {
    const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "content-type": "application/json",
        "HTTP-Referer": "https://readycounter.vercel.app",
        "X-Title": "ReadyCounter"
      },
      body: JSON.stringify({
        model,
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
      model,
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
