import type { VercelRequest, VercelResponse } from '@vercel/node';
import { TOOL_MANIFEST_WITH_SCHEMAS } from '../../../src/webmcp/toolManifest';

/**
 * One step of a real agent shopping the store.
 *
 * The model decides which WebMCP tool to call next. It never touches the store
 * itself — the BROWSER executes the tool through document.modelContext and
 * posts the result back here for the next step. Model on the outside, the
 * deterministic instrument on the inside.
 *
 * The API key stays on the server. The client picks a model only from a fixed
 * whitelist and cannot touch the system prompt or the tool list, so this
 * endpoint cannot be turned into a general-purpose LLM proxy.
 */

/**
 * One model, one task, one evidence trail.
 *
 * A picker across five frontier models was built and then removed: it turned the
 * product into a model bake-off and diluted the single claim, which is about the
 * STORE and not about which model shops best.
 *
 * Pinned rather than configurable by the client — an arbitrary model string would
 * make this a general-purpose LLM proxy on someone else's key.
 */
export const MODELS = [{ id: 'openai/gpt-5.6-terra-pro', label: 'GPT-5.6 Terra Pro' }] as const;

const DEFAULT_MODEL = MODELS[0].id;
const MAX_GOAL = 200;
const MAX_STEPS = 8;
const MAX_HISTORY = 24;
const MAX_TOOL_RESULT = 1200;

const SYSTEM = `You are a shopping agent working inside a merchant's own web page.

You can only act through the tools provided. Work toward the user's shopping
goal in as few calls as possible:
  search_catalog to find something, get_product for detail, add_to_order to put
  it in the shared cart, then prepare_checkout.

prepare_checkout will often REFUSE — a CAPTCHA, a forced login, or stale stock.
That refusal is the point of this demo, not a failure on your part. When it
refuses, stop calling tools and reply in one short sentence saying what blocked
the purchase and quoting the reason the tool gave you.

Never invent product ids, prices or stock. Only use values a tool returned.
Keep every message under 40 words.`;

/** Only shopping tools. The audit and import tools are not the agent's business. */
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

interface Msg {
  role: 'assistant' | 'tool' | 'user';
  content?: string | null;
  tool_calls?: unknown;
  tool_call_id?: string;
  name?: string;
}

function toOpenAITools() {
  return TOOL_MANIFEST_WITH_SCHEMAS.filter((t) => ALLOWED.has(t.name)).map((t) => ({
    type: 'function' as const,
    function: {
      name: t.name,
      description: t.description,
      parameters: t.inputSchema ?? { type: 'object', properties: {} },
    },
  }));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    return res.status(503).json({
      error: 'agent_unconfigured',
      hint: 'Set OPENROUTER_API_KEY. Every other path in ReadyCounter works without it.',
    });
  }

  const body = (req.body ?? {}) as { goal?: unknown; history?: unknown; model?: unknown };
  const goal = typeof body.goal === 'string' ? body.goal.slice(0, MAX_GOAL).trim() : '';
  if (!goal) return res.status(400).json({ error: 'goal_required' });

  const asked = typeof body.model === 'string' ? body.model : '';
  const model = MODELS.some((m) => m.id === asked) ? asked : DEFAULT_MODEL;

  const raw = Array.isArray(body.history) ? (body.history as Msg[]) : [];
  if (raw.length > MAX_HISTORY) return res.status(400).json({ error: 'history_too_long' });

  // Rebuild the transcript ourselves so the client cannot inject roles or a
  // different system prompt.
  const history = raw
    .filter((m) => m && (m.role === 'assistant' || m.role === 'tool'))
    .map((m) =>
      m.role === 'tool'
        ? {
            role: 'tool' as const,
            tool_call_id: String(m.tool_call_id ?? '').slice(0, 80),
            content: String(m.content ?? '').slice(0, MAX_TOOL_RESULT),
          }
        : { role: 'assistant' as const, content: m.content ?? null, tool_calls: m.tool_calls },
    );

  const steps = history.filter((m) => m.role === 'assistant').length;
  if (steps >= MAX_STEPS) {
    return res.status(200).json({
      done: true,
      message: 'Stopping — this demo caps the agent at eight steps.',
      steps,
      model,
    });
  }

  try {
    const upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'content-type': 'application/json',
        'HTTP-Referer': 'https://readycounter.vercel.app',
        'X-Title': 'ReadyCounter',
      },
      body: JSON.stringify({
        model,
        max_tokens: 500,
        temperature: 0,
        messages: [
          { role: 'system', content: SYSTEM },
          { role: 'user', content: goal },
          ...history,
        ],
        tools: toOpenAITools(),
        tool_choice: 'auto',
      }),
    });

    if (!upstream.ok) {
      const detail = await upstream.text();
      return res.status(502).json({ error: 'upstream_failed', status: upstream.status, detail: detail.slice(0, 300) });
    }

    const data = (await upstream.json()) as {
      choices?: { message?: { content?: string; tool_calls?: { id: string; function: { name: string; arguments: string } }[] } }[];
    };
    const message = data.choices?.[0]?.message ?? {};
    const calls = (message.tool_calls ?? []).filter((c) => ALLOWED.has(c.function?.name));

    res.setHeader('cache-control', 'no-store');
    return res.status(200).json({
      model,
      steps: steps + 1,
      message: message.content ?? null,
      toolCalls: calls.map((c) => ({ id: c.id, name: c.function.name, arguments: c.function.arguments })),
      done: calls.length === 0,
    });
  } catch (err) {
    return res.status(502).json({ error: 'agent_failed', detail: err instanceof Error ? err.message : String(err) });
  }
}
