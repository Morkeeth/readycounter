import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kvGet, kvSet } from '../../../src/server/kv';
import { checkRateLimitAsync, clientIp } from '../../../src/server/rate-limit';
import type {
  AgentProvider,
  AgentTrialCall,
  AgentTrialReceipt,
  AgentTrialSummary,
} from '../../../src/types/agent-trial';
import { TOOL_MANIFEST_WITH_SCHEMAS } from '../../../src/webmcp/toolManifest';

/**
 * A model chooses the calls; the browser executes them through WebMCP.
 *
 * The server owns the transcript and verifies every returned call id. The
 * browser never supplies assistant messages, a system prompt, or a model id.
 */

export const MODELS = [{ id: 'gpt-5.6-terra', label: 'GPT-5.6 Terra' }] as const;
export const PROMPT_VERSION = 'readycounter-shopper-v2';

const OPENAI_MODEL = MODELS[0].id;
const OPENROUTER_FALLBACK_MODEL = 'openai/gpt-5.6-terra-pro';
const MAX_GOAL = 200;
const MAX_STEPS = 8;
const MAX_TOOL_RESULT = 1200;
const TRIAL_KEY = 'rc:agent-trial:';
const RECENT_KEY = 'rc:agent-trials:recent';
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

const SYSTEM = `You are a shopping agent working inside a merchant's own web page.

You can only act through the tools provided. Work toward the user's shopping
goal in as few calls as possible: search_catalog to find something,
get_product for detail, add_to_order to put it in the shared cart, then
prepare_checkout.

prepare_checkout may refuse because of a CAPTCHA, forced login, or stale stock.
That refusal is useful evidence. When it refuses, stop calling tools and reply
in one short sentence with the blocker and the tool's reason.

Never invent product ids, prices, or stock. Only use values a tool returned.
Keep every message under 40 words.`;

const ALLOWED = new Set([
  'search_catalog',
  'get_product',
  'add_to_order',
  'update_line_quantity',
  'remove_line',
  'get_order',
  'get_delivery_quote',
  'prepare_checkout',
]);

interface PendingCall {
  id: string;
  name: string;
  arguments: string;
}

interface ToolResultInput {
  callId: string;
  output: string;
}

interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'tool';
  content?: string | null;
  tool_calls?: { id: string; type: 'function'; function: { name: string; arguments: string } }[];
  tool_call_id?: string;
}

interface TrialSession {
  receipt: AgentTrialReceipt;
  pendingCalls: PendingCall[];
  previousResponseId?: string;
  openRouterHistory?: OpenRouterMessage[];
  steps: number;
}

function numberFromEnv(name: string, fallback: number): number {
  const parsed = Number(process.env[name]);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function directTools() {
  return TOOL_MANIFEST_WITH_SCHEMAS.filter((tool) => ALLOWED.has(tool.name)).map((tool) => ({
    type: 'function' as const,
    name: tool.name,
    description: tool.description,
    parameters: tool.inputSchema ?? { type: 'object', properties: {} },
  }));
}

function openRouterTools() {
  return directTools().map(({ type, name, description, parameters }) => ({
    type,
    function: { name, description, parameters },
  }));
}

function provider(): AgentProvider | null {
  if (process.env.OPENAI_API_KEY) return 'openai';
  if (process.env.OPENROUTER_API_KEY) return 'openrouter';
  return null;
}

function publicModel(selected: AgentProvider): string {
  return selected === 'openai' ? OPENAI_MODEL : OPENROUTER_FALLBACK_MODEL;
}

function parseBlocker(output: string): { blocked: boolean; reason: string | null } {
  try {
    const parsed = JSON.parse(output) as {
      blocked?: boolean;
      ok?: boolean;
      reason?: unknown;
      error?: unknown;
      blocker?: unknown;
    };
    const blocked = parsed.blocked === true || parsed.ok === false;
    const raw = parsed.reason ?? parsed.blocker ?? parsed.error;
    return { blocked, reason: blocked && typeof raw === 'string' ? raw.slice(0, 240) : null };
  } catch {
    return { blocked: false, reason: null };
  }
}

export function summarizeCalls(calls: AgentTrialCall[]): AgentTrialSummary {
  const blocker = calls
    .map((call) => (call.result ? parseBlocker(call.result) : { blocked: false, reason: null }))
    .find((result) => result.blocked);
  return {
    callCount: calls.length,
    searched: calls.some((call) => call.name === 'search_catalog'),
    productRead: calls.some((call) => call.name === 'get_product'),
    cartChanged: calls.some((call) =>
      ['add_to_order', 'update_line_quantity', 'remove_line'].includes(call.name),
    ),
    checkoutReached: calls.some((call) => call.name === 'prepare_checkout'),
    blocked: Boolean(blocker),
    blocker: blocker?.reason ?? null,
  };
}

async function saveSession(session: TrialSession): Promise<void> {
  session.receipt.summary = summarizeCalls(session.receipt.calls);
  await kvSet(`${TRIAL_KEY}${session.receipt.id}`, JSON.stringify(session));

  let recent: AgentTrialReceipt[] = [];
  const raw = await kvGet(RECENT_KEY);
  if (raw) {
    try {
      recent = JSON.parse(raw) as AgentTrialReceipt[];
    } catch {
      recent = [];
    }
  }
  const next = [session.receipt, ...recent.filter((item) => item.id !== session.receipt.id)].slice(0, 20);
  await kvSet(RECENT_KEY, JSON.stringify(next));
}

async function loadSession(id: string): Promise<TrialSession | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const raw = await kvGet(`${TRIAL_KEY}${id}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TrialSession;
  } catch {
    return null;
  }
}

function cleanStore(value: unknown): { id: string; name: string; source: string } {
  const store = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  const clean = (field: unknown, fallback: string, max: number) =>
    typeof field === 'string' && field.trim() ? field.trim().slice(0, max) : fallback;
  return {
    id: clean(store.id, 'unknown-store', 100),
    name: clean(store.name, 'Unknown store', 120),
    source: clean(store.source, 'unknown', 40),
  };
}

function cleanToolResults(value: unknown): ToolResultInput[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 12).map((item) => {
    const row = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
    return {
      callId: String(row.callId ?? '').slice(0, 120),
      output: String(row.output ?? '').slice(0, MAX_TOOL_RESULT),
    };
  });
}

export function validateToolResultIds(
  pending: Array<{ id: string }>,
  results: Array<{ callId: string }>,
): string | null {
  if (pending.length === 0) return results.length === 0 ? null : 'unexpected_tool_results';
  if (results.length !== pending.length) return 'tool_result_count_mismatch';
  const ids = new Set(results.map((result) => result.callId));
  if (ids.size !== results.length) return 'duplicate_tool_result';
  if (pending.some((call) => !ids.has(call.id))) return 'unknown_tool_call_id';
  return null;
}

function applyToolResults(session: TrialSession, results: ToolResultInput[]): string | null {
  const validationError = validateToolResultIds(session.pendingCalls, results);
  if (validationError) return validationError;
  const byId = new Map(results.map((result) => [result.callId, result]));

  for (const pending of session.pendingCalls) {
    const result = byId.get(pending.id)!;
    const saved = session.receipt.calls.find((call) => call.callId === pending.id);
    if (saved) {
      saved.result = result.output;
      saved.blocked = parseBlocker(result.output).blocked;
    }
    session.openRouterHistory?.push({ role: 'tool', tool_call_id: pending.id, content: result.output });
  }
  session.pendingCalls = [];
  return null;
}

async function callOpenAI(session: TrialSession, results: ToolResultInput[]) {
  const input = session.previousResponseId
    ? results.map((result) => ({ type: 'function_call_output', call_id: result.callId, output: result.output }))
    : session.receipt.goal;

  const upstream = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      instructions: SYSTEM,
      input,
      previous_response_id: session.previousResponseId,
      tools: directTools(),
      tool_choice: 'auto',
      reasoning: { effort: 'low' },
      text: { verbosity: 'low' },
      max_output_tokens: 500,
      store: true,
      metadata: { product: 'readycounter', trial_id: session.receipt.id, prompt_version: PROMPT_VERSION },
    }),
  });
  if (!upstream.ok) {
    throw new Error(`OpenAI ${upstream.status}: ${(await upstream.text()).slice(0, 300)}`);
  }

  const data = (await upstream.json()) as {
    id: string;
    output?: Array<{
      type?: string;
      call_id?: string;
      name?: string;
      arguments?: string;
      content?: Array<{ type?: string; text?: string }>;
    }>;
    output_text?: string;
  };
  session.previousResponseId = data.id;
  const calls = (data.output ?? [])
    .filter((item) => item.type === 'function_call' && item.call_id && item.name && ALLOWED.has(item.name))
    .map((item) => ({ id: item.call_id!, name: item.name!, arguments: item.arguments ?? '{}' }));
  const messageText =
    data.output_text ??
    (data.output ?? [])
      .flatMap((item) => item.content ?? [])
      .filter((item) => item.type === 'output_text')
      .map((item) => item.text ?? '')
      .join('');
  const message = messageText || null;
  return { calls, message };
}

async function callOpenRouter(session: TrialSession) {
  const history = session.openRouterHistory ?? [{ role: 'user' as const, content: session.receipt.goal }];
  session.openRouterHistory = history;
  const upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'content-type': 'application/json',
      'HTTP-Referer': 'https://readycounter.vercel.app',
      'X-Title': 'ReadyCounter',
    },
    body: JSON.stringify({
      model: OPENROUTER_FALLBACK_MODEL,
      max_tokens: 500,
      temperature: 0,
      messages: [{ role: 'system', content: SYSTEM }, ...history],
      tools: openRouterTools(),
      tool_choice: 'auto',
    }),
  });
  if (!upstream.ok) {
    throw new Error(`OpenRouter ${upstream.status}: ${(await upstream.text()).slice(0, 300)}`);
  }
  const data = (await upstream.json()) as {
    choices?: Array<{
      message?: {
        content?: string | null;
        tool_calls?: Array<{ id: string; function: { name: string; arguments: string } }>;
      };
    }>;
  };
  const message = data.choices?.[0]?.message ?? {};
  const calls = (message.tool_calls ?? [])
    .filter((call) => ALLOWED.has(call.function?.name))
    .map((call) => ({ id: call.id, name: call.function.name, arguments: call.function.arguments }));
  history.push({
    role: 'assistant',
    content: message.content ?? null,
    tool_calls: calls.map((call) => ({
      id: call.id,
      type: 'function',
      function: { name: call.name, arguments: call.arguments },
    })),
  });
  return { calls, message: message.content ?? null };
}

async function startAllowed(req: VercelRequest) {
  const ip = clientIp(req);
  const hourly = await checkRateLimitAsync(
    `agent-trial:ip:${ip}`,
    numberFromEnv('AGENT_TRIALS_PER_IP_HOUR', 6),
    HOUR_MS,
  );
  if (!hourly.allowed) return hourly;
  return checkRateLimitAsync(
    'agent-trial:global',
    numberFromEnv('AGENT_TRIALS_GLOBAL_DAY', 200),
    DAY_MS,
  );
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const selectedProvider = provider();
  if (!selectedProvider) {
    return res.status(503).json({
      error: 'agent_unconfigured',
      hint: 'Set OPENAI_API_KEY. OPENROUTER_API_KEY is supported only as a deployment fallback.',
    });
  }

  const body = (req.body ?? {}) as Record<string, unknown>;
  const requestedId = typeof body.trialId === 'string' ? body.trialId : '';
  const toolResults = cleanToolResults(body.toolResults);
  let session = requestedId ? await loadSession(requestedId) : null;

  if (requestedId && !session) return res.status(404).json({ error: 'trial_not_found' });
  if (!session) {
    const allowed = await startAllowed(req);
    if (!allowed.allowed) {
      res.setHeader('retry-after', String(allowed.retryAfterSec ?? 60));
      return res.status(429).json({ error: 'trial_limit_reached', retryAfterSec: allowed.retryAfterSec });
    }
    const goal = typeof body.goal === 'string' ? body.goal.slice(0, MAX_GOAL).trim() : '';
    if (!goal) return res.status(400).json({ error: 'goal_required' });
    const store = cleanStore(body.store);
    const now = new Date().toISOString();
    const receipt: AgentTrialReceipt = {
      id: crypto.randomUUID(),
      status: 'running',
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
      summary: summarizeCalls([]),
    };
    session = { receipt, pendingCalls: [], steps: 0 };
  } else if (session.receipt.status !== 'running') {
    return res.status(200).json({ done: true, toolCalls: [], trial: session.receipt });
  }

  const inputError = applyToolResults(session, toolResults);
  if (inputError) return res.status(400).json({ error: inputError });

  if (session.steps >= MAX_STEPS) {
    session.receipt.status = 'completed';
    session.receipt.completedAt = new Date().toISOString();
    session.receipt.finalMessage = 'Stopped at the eight-step safety policy.';
    await saveSession(session);
    return res.status(200).json({ done: true, toolCalls: [], trial: session.receipt });
  }

  try {
    const output =
      session.receipt.provider === 'openai'
        ? await callOpenAI(session, toolResults)
        : await callOpenRouter(session);
    session.steps += 1;
    session.pendingCalls = output.calls;
    session.receipt.calls.push(
      ...output.calls.map((call) => ({
        callId: call.id,
        name: call.name,
        arguments: call.arguments.slice(0, 800),
      })),
    );
    if (output.calls.length === 0) {
      session.receipt.status = 'completed';
      session.receipt.completedAt = new Date().toISOString();
      session.receipt.finalMessage = output.message;
    }
    await saveSession(session);

    res.setHeader('cache-control', 'no-store');
    return res.status(200).json({
      done: output.calls.length === 0,
      message: output.message,
      toolCalls: output.calls,
      trial: session.receipt,
    });
  } catch (error) {
    session.receipt.status = 'error';
    session.receipt.completedAt = new Date().toISOString();
    session.receipt.finalMessage = error instanceof Error ? error.message : String(error);
    await saveSession(session);
    return res.status(502).json({
      error: 'agent_failed',
      detail: session.receipt.finalMessage,
      trial: session.receipt,
    });
  }
}
