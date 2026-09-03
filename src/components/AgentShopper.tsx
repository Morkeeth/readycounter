import { useCallback, useEffect, useState } from 'react';
import { invokeToolLocally } from '../webmcp/registerTools';

/**
 * A real model shopping the store through the real WebMCP tools.
 *
 * The loop is: ask the model what to call next → execute it in THIS page via
 * document.modelContext → hand the result back → repeat. The model never
 * touches the store directly and never sees an API key; the key stays on the
 * server behind /api/v1/agent/step.
 *
 * This is the point of the whole submission made literal. The score is
 * arithmetic and stays arithmetic — the model is the shopper, not the judge —
 * and it gets stopped by the same CAPTCHA a real customer's agent would hit.
 */

interface ToolCall {
  id: string;
  name: string;
  arguments: string;
}

interface StepResponse {
  model?: string;
  steps?: number;
  message?: string | null;
  toolCalls?: ToolCall[];
  done?: boolean;
  error?: string;
  hint?: string;
}

type Entry =
  | { kind: 'call'; name: string; args: string }
  | { kind: 'result'; name: string; body: string; blocked: boolean }
  | { kind: 'say'; body: string }
  | { kind: 'error'; body: string };

const GOALS = [
  'Buy me a bag of espresso beans under $20.',
  'I want a pour over kit and something to weigh the beans.',
  'Find the cheapest thing in stock and check out.',
];

const MAX_TURNS = 8;

interface ModelOption {
  id: string;
  label: string;
}

function isBlocked(body: string): boolean {
  try {
    const o = JSON.parse(body) as { blocked?: boolean; ok?: boolean };
    return o.blocked === true || o.ok === false;
  } catch {
    return false;
  }
}

export function AgentShopper() {
  const [goal, setGoal] = useState(GOALS[0]);
  const [log, setLog] = useState<Entry[]>([]);
  const [busy, setBusy] = useState(false);
  const [ran, setRan] = useState<string | null>(null);
  const [models, setModels] = useState<ModelOption[]>([]);
  const [model, setModel] = useState('');

  useEffect(() => {
    void fetch('/api/v1/agent/models')
      .then((r) => r.json())
      .then((d: { models?: ModelOption[] }) => {
        if (!d.models?.length) return;
        setModels(d.models);
        setModel((m) => m || d.models![0].id);
      })
      .catch(() => undefined);
  }, []);

  const run = useCallback(async () => {
    setBusy(true);
    setLog([]);
    setRan(null);

    const history: Record<string, unknown>[] = [];
    const push = (e: Entry) => setLog((l) => [...l, e]);

    try {
      for (let turn = 0; turn < MAX_TURNS; turn += 1) {
        const res = await fetch('/api/v1/agent/step', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ goal, model, history }),
        });
        const data = (await res.json()) as StepResponse;

        if (!res.ok) {
          push({ kind: 'error', body: data.hint ?? data.error ?? `HTTP ${res.status}` });
          break;
        }
        if (data.model) setRan(data.model);

        history.push({
          role: 'assistant',
          content: data.message ?? null,
          tool_calls: (data.toolCalls ?? []).map((c) => ({
            id: c.id,
            type: 'function',
            function: { name: c.name, arguments: c.arguments },
          })),
        });

        if (data.message) push({ kind: 'say', body: data.message });

        if (!data.toolCalls?.length) break;

        for (const call of data.toolCalls) {
          let args: Record<string, unknown> = {};
          try {
            args = JSON.parse(call.arguments || '{}');
          } catch {
            args = {};
          }
          push({ kind: 'call', name: call.name, args: JSON.stringify(args) });

          let body: string;
          try {
            body = await invokeToolLocally(call.name, args);
          } catch (err) {
            body = JSON.stringify({ ok: false, error: err instanceof Error ? err.message : String(err) });
          }
          push({ kind: 'result', name: call.name, body, blocked: isBlocked(body) });
          history.push({ role: 'tool', tool_call_id: call.id, content: body });
        }
      }
    } finally {
      setBusy(false);
    }
  }, [goal, model]);

  return (
    <section className="agent-shopper" aria-label="Watch a real agent shop this store">
      <p className="integrations__section-label">Prove it with a real agent</p>
      <h3>Let a model shop the store</h3>
      <p className="integrations__muted">
        Pick a frontier model, give it a shopping goal, and it drives these 18 WebMCP tools itself.
        The model chooses every call; this page executes them through <code>document.modelContext</code>.
        The readiness score stays arithmetic — the model is the shopper, never the judge.
      </p>

      <div className="agent-shopper__controls">
        <label className="integrations__shop-label">
          Agent
          <select
            className="integrations__shop-input"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            disabled={busy || !models.length}
          >
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </label>
        <label className="integrations__shop-label">
          Shopping goal
          <select
            className="integrations__shop-input"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            disabled={busy}
          >
            {GOALS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="btn btn--primary" onClick={() => void run()} disabled={busy}>
          {busy ? 'Agent is shopping…' : 'Send the agent'}
        </button>
      </div>

      {log.length > 0 ? (
        <ol className="agent-shopper__log">
          {log.map((e, i) => (
            <li key={i} className={`agent-shopper__row agent-shopper__row--${e.kind}`}>
              {e.kind === 'call' ? (
                <>
                  <span className="agent-shopper__arrow">→</span>
                  <code>
                    {e.name}({e.args})
                  </code>
                </>
              ) : e.kind === 'result' ? (
                <code className={e.blocked ? 'agent-shopper__blocked' : undefined}>
                  {e.body.replace(/\s+/g, ' ').slice(0, 220)}
                </code>
              ) : e.kind === 'say' ? (
                <p className="agent-shopper__say">{e.body}</p>
              ) : (
                <p className="integrations__warn">{e.body}</p>
              )}
            </li>
          ))}
        </ol>
      ) : null}

      {ran ? <p className="integrations__muted agent-shopper__model">Ran on {ran}</p> : null}
    </section>
  );
}
