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
async function kvGet(key, opts) {
  const timeout = opts?.large ? KV_LARGE_OP_MS : KV_OP_MS;
  const value = await withRedis((client) => client.get(key), timeout);
  if (value !== void 0) return value;
  return memory.get(key) ?? null;
}
async function kvSet(key, value, opts) {
  memory.set(key, value);
  const timeout = opts?.large ? KV_LARGE_OP_MS : KV_OP_MS;
  await withRedis((client) => client.set(key, value), timeout);
}

// src/server/rate-limit.ts
var buckets = /* @__PURE__ */ new Map();
function checkRateLimit(key, max, windowMs) {
  const now = Date.now();
  const entry = buckets.get(key);
  if (!entry || entry.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }
  if (entry.count >= max) {
    return { allowed: false, retryAfterSec: Math.ceil((entry.resetAt - now) / 1e3) };
  }
  entry.count += 1;
  return { allowed: true };
}
async function checkRateLimitAsync(key, max, windowMs) {
  const redisKey = `rc:rl:${key}`;
  const now = Date.now();
  try {
    const raw = await kvGet(redisKey);
    let entry = null;
    if (raw) {
      try {
        entry = JSON.parse(raw);
      } catch {
        entry = null;
      }
    }
    if (!entry || entry.resetAt <= now) {
      entry = { count: 1, resetAt: now + windowMs };
      await kvSet(redisKey, JSON.stringify(entry));
      buckets.set(key, entry);
      return { allowed: true };
    }
    if (entry.count >= max) {
      return { allowed: false, retryAfterSec: Math.ceil((entry.resetAt - now) / 1e3) };
    }
    entry.count += 1;
    await kvSet(redisKey, JSON.stringify(entry));
    buckets.set(key, entry);
    return { allowed: true };
  } catch {
    return checkRateLimit(key, max, windowMs);
  }
}
function clientIp(req) {
  const forwarded = req.headers?.["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0]?.trim() ?? "unknown";
  if (Array.isArray(forwarded)) return forwarded[0] ?? "unknown";
  return "unknown";
}

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
var MODELS = [{ id: "gpt-5.6-terra", label: "GPT-5.6 Terra" }];
var PROMPT_VERSION = "readycounter-shopper-v2";
var OPENAI_MODEL = MODELS[0].id;
var OPENROUTER_FALLBACK_MODEL = "openai/gpt-5.6-terra-pro";
var MAX_GOAL = 200;
var MAX_STEPS = 8;
var MAX_TOOL_RESULT = 1200;
var TRIAL_KEY = "rc:agent-trial:";
var RECENT_KEY = "rc:agent-trials:recent";
var HOUR_MS = 60 * 60 * 1e3;
var DAY_MS = 24 * HOUR_MS;
var SYSTEM = `You are a shopping agent working inside a merchant's own web page.

You can only act through the tools provided. Work toward the user's shopping
goal in as few calls as possible: search_catalog to find something,
get_product for detail, add_to_order to put it in the shared cart, then
prepare_checkout.

prepare_checkout may refuse because of a CAPTCHA, forced login, or stale stock.
That refusal is useful evidence. When it refuses, stop calling tools and reply
in one short sentence with the blocker and the tool's reason.

Never invent product ids, prices, or stock. Only use values a tool returned.
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
function numberFromEnv(name, fallback) {
  const parsed = Number(process.env[name]);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}
function directTools() {
  return TOOL_MANIFEST_WITH_SCHEMAS.filter((tool) => ALLOWED.has(tool.name)).map((tool) => ({
    type: "function",
    name: tool.name,
    description: tool.description,
    parameters: tool.inputSchema ?? { type: "object", properties: {} }
  }));
}
function openRouterTools() {
  return directTools().map(({ type, name, description, parameters }) => ({
    type,
    function: { name, description, parameters }
  }));
}
function provider() {
  if (process.env.OPENAI_API_KEY) return "openai";
  if (process.env.OPENROUTER_API_KEY) return "openrouter";
  return null;
}
function publicModel(selected) {
  return selected === "openai" ? OPENAI_MODEL : OPENROUTER_FALLBACK_MODEL;
}
function parseBlocker(output) {
  try {
    const parsed = JSON.parse(output);
    const blocked = parsed.blocked === true || parsed.ok === false;
    const raw = parsed.reason ?? parsed.blocker ?? parsed.error;
    return { blocked, reason: blocked && typeof raw === "string" ? raw.slice(0, 240) : null };
  } catch {
    return { blocked: false, reason: null };
  }
}
function summarizeCalls(calls) {
  const blocker = calls.map((call) => call.result ? parseBlocker(call.result) : { blocked: false, reason: null }).find((result) => result.blocked);
  return {
    callCount: calls.length,
    searched: calls.some((call) => call.name === "search_catalog"),
    productRead: calls.some((call) => call.name === "get_product"),
    cartChanged: calls.some(
      (call) => ["add_to_order", "update_line_quantity", "remove_line"].includes(call.name)
    ),
    checkoutReached: calls.some((call) => call.name === "prepare_checkout"),
    blocked: Boolean(blocker),
    blocker: blocker?.reason ?? null
  };
}
async function saveSession(session) {
  session.receipt.summary = summarizeCalls(session.receipt.calls);
  await kvSet(`${TRIAL_KEY}${session.receipt.id}`, JSON.stringify(session));
  let recent = [];
  const raw = await kvGet(RECENT_KEY);
  if (raw) {
    try {
      recent = JSON.parse(raw);
    } catch {
      recent = [];
    }
  }
  const next = [session.receipt, ...recent.filter((item) => item.id !== session.receipt.id)].slice(0, 20);
  await kvSet(RECENT_KEY, JSON.stringify(next));
}
async function loadSession(id) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const raw = await kvGet(`${TRIAL_KEY}${id}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
function cleanStore(value) {
  const store = value && typeof value === "object" ? value : {};
  const clean = (field, fallback, max) => typeof field === "string" && field.trim() ? field.trim().slice(0, max) : fallback;
  return {
    id: clean(store.id, "unknown-store", 100),
    name: clean(store.name, "Unknown store", 120),
    source: clean(store.source, "unknown", 40)
  };
}
function cleanToolResults(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 12).map((item) => {
    const row = item && typeof item === "object" ? item : {};
    return {
      callId: String(row.callId ?? "").slice(0, 120),
      output: String(row.output ?? "").slice(0, MAX_TOOL_RESULT)
    };
  });
}
function validateToolResultIds(pending, results) {
  if (pending.length === 0) return results.length === 0 ? null : "unexpected_tool_results";
  if (results.length !== pending.length) return "tool_result_count_mismatch";
  const ids = new Set(results.map((result) => result.callId));
  if (ids.size !== results.length) return "duplicate_tool_result";
  if (pending.some((call) => !ids.has(call.id))) return "unknown_tool_call_id";
  return null;
}
function applyToolResults(session, results) {
  const validationError = validateToolResultIds(session.pendingCalls, results);
  if (validationError) return validationError;
  const byId = new Map(results.map((result) => [result.callId, result]));
  for (const pending of session.pendingCalls) {
    const result = byId.get(pending.id);
    const saved = session.receipt.calls.find((call) => call.callId === pending.id);
    if (saved) {
      saved.result = result.output;
      saved.blocked = parseBlocker(result.output).blocked;
    }
    session.openRouterHistory?.push({ role: "tool", tool_call_id: pending.id, content: result.output });
  }
  session.pendingCalls = [];
  return null;
}
async function callOpenAI(session, results) {
  const input = session.previousResponseId ? results.map((result) => ({ type: "function_call_output", call_id: result.callId, output: result.output })) : session.receipt.goal;
  const upstream = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      instructions: SYSTEM,
      input,
      previous_response_id: session.previousResponseId,
      tools: directTools(),
      tool_choice: "auto",
      reasoning: { effort: "low" },
      text: { verbosity: "low" },
      max_output_tokens: 500,
      store: true,
      metadata: { product: "readycounter", trial_id: session.receipt.id, prompt_version: PROMPT_VERSION }
    })
  });
  if (!upstream.ok) {
    throw new Error(`OpenAI ${upstream.status}: ${(await upstream.text()).slice(0, 300)}`);
  }
  const data = await upstream.json();
  session.previousResponseId = data.id;
  const calls = (data.output ?? []).filter((item) => item.type === "function_call" && item.call_id && item.name && ALLOWED.has(item.name)).map((item) => ({ id: item.call_id, name: item.name, arguments: item.arguments ?? "{}" }));
  const messageText = data.output_text ?? (data.output ?? []).flatMap((item) => item.content ?? []).filter((item) => item.type === "output_text").map((item) => item.text ?? "").join("");
  const message = messageText || null;
  return { calls, message };
}
async function callOpenRouter(session) {
  const history = session.openRouterHistory ?? [{ role: "user", content: session.receipt.goal }];
  session.openRouterHistory = history;
  const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "content-type": "application/json",
      "HTTP-Referer": "https://readycounter.vercel.app",
      "X-Title": "ReadyCounter"
    },
    body: JSON.stringify({
      model: OPENROUTER_FALLBACK_MODEL,
      max_tokens: 500,
      temperature: 0,
      messages: [{ role: "system", content: SYSTEM }, ...history],
      tools: openRouterTools(),
      tool_choice: "auto"
    })
  });
  if (!upstream.ok) {
    throw new Error(`OpenRouter ${upstream.status}: ${(await upstream.text()).slice(0, 300)}`);
  }
  const data = await upstream.json();
  const message = data.choices?.[0]?.message ?? {};
  const calls = (message.tool_calls ?? []).filter((call) => ALLOWED.has(call.function?.name)).map((call) => ({ id: call.id, name: call.function.name, arguments: call.function.arguments }));
  history.push({
    role: "assistant",
    content: message.content ?? null,
    tool_calls: calls.map((call) => ({
      id: call.id,
      type: "function",
      function: { name: call.name, arguments: call.arguments }
    }))
  });
  return { calls, message: message.content ?? null };
}
async function startAllowed(req) {
  const ip = clientIp(req);
  const hourly = await checkRateLimitAsync(
    `agent-trial:ip:${ip}`,
    numberFromEnv("AGENT_TRIALS_PER_IP_HOUR", 6),
    HOUR_MS
  );
  if (!hourly.allowed) return hourly;
  return checkRateLimitAsync(
    "agent-trial:global",
    numberFromEnv("AGENT_TRIALS_GLOBAL_DAY", 200),
    DAY_MS
  );
}
async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const selectedProvider = provider();
  if (!selectedProvider) {
    return res.status(503).json({
      error: "agent_unconfigured",
      hint: "Set OPENAI_API_KEY. OPENROUTER_API_KEY is supported only as a deployment fallback."
    });
  }
  const body = req.body ?? {};
  const requestedId = typeof body.trialId === "string" ? body.trialId : "";
  const toolResults = cleanToolResults(body.toolResults);
  let session = requestedId ? await loadSession(requestedId) : null;
  if (requestedId && !session) return res.status(404).json({ error: "trial_not_found" });
  if (!session) {
    const allowed = await startAllowed(req);
    if (!allowed.allowed) {
      res.setHeader("retry-after", String(allowed.retryAfterSec ?? 60));
      return res.status(429).json({ error: "trial_limit_reached", retryAfterSec: allowed.retryAfterSec });
    }
    const goal = typeof body.goal === "string" ? body.goal.slice(0, MAX_GOAL).trim() : "";
    if (!goal) return res.status(400).json({ error: "goal_required" });
    const store = cleanStore(body.store);
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const receipt = {
      id: crypto.randomUUID(),
      status: "running",
      goal,
      storeId: store.id,
      storeName: store.name,
      storeSource: store.source,
      provider: selectedProvider,
      model: publicModel(selectedProvider),
      promptVersion: PROMPT_VERSION,
      createdAt: now,
      completedAt: null,
      finalMessage: null,
      calls: [],
      summary: summarizeCalls([])
    };
    session = { receipt, pendingCalls: [], steps: 0 };
  } else if (session.receipt.status !== "running") {
    return res.status(200).json({ done: true, toolCalls: [], trial: session.receipt });
  }
  const inputError = applyToolResults(session, toolResults);
  if (inputError) return res.status(400).json({ error: inputError });
  if (session.steps >= MAX_STEPS) {
    session.receipt.status = "completed";
    session.receipt.completedAt = (/* @__PURE__ */ new Date()).toISOString();
    session.receipt.finalMessage = "Stopped at the eight-step safety policy.";
    await saveSession(session);
    return res.status(200).json({ done: true, toolCalls: [], trial: session.receipt });
  }
  try {
    const output = session.receipt.provider === "openai" ? await callOpenAI(session, toolResults) : await callOpenRouter(session);
    session.steps += 1;
    session.pendingCalls = output.calls;
    session.receipt.calls.push(
      ...output.calls.map((call) => ({
        callId: call.id,
        name: call.name,
        arguments: call.arguments.slice(0, 800)
      }))
    );
    if (output.calls.length === 0) {
      session.receipt.status = "completed";
      session.receipt.completedAt = (/* @__PURE__ */ new Date()).toISOString();
      session.receipt.finalMessage = output.message;
    }
    await saveSession(session);
    res.setHeader("cache-control", "no-store");
    return res.status(200).json({
      done: output.calls.length === 0,
      message: output.message,
      toolCalls: output.calls,
      trial: session.receipt
    });
  } catch (error) {
    session.receipt.status = "error";
    session.receipt.completedAt = (/* @__PURE__ */ new Date()).toISOString();
    session.receipt.finalMessage = error instanceof Error ? error.message : String(error);
    await saveSession(session);
    return res.status(502).json({
      error: "agent_failed",
      detail: session.receipt.finalMessage,
      trial: session.receipt
    });
  }
}
export {
  MODELS,
  PROMPT_VERSION,
  handler as default,
  summarizeCalls,
  validateToolResultIds
};
//# sourceMappingURL=step.js.map
