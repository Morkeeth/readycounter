import { useCallback, useEffect, useMemo, useState } from 'react';
import { getStore } from '../data/stores';
import { useShopStore } from '../store/shopStore';
import type { AgentTrialReceipt } from '../types/agent-trial';
import { invokeToolLocally } from '../webmcp/registerTools';

/**
 * A real model shopping the active store through the browser's WebMCP tools.
 * The server owns the model transcript; the browser can return results only
 * for call ids that the server issued.
 */

interface ToolCall {
  id: string;
  name: string;
  arguments: string;
}

interface StepResponse {
  message?: string | null;
  toolCalls?: ToolCall[];
  done?: boolean;
  trial?: AgentTrialReceipt;
  error?: string;
  detail?: string;
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

interface ModelInfo {
  id: string;
  label: string;
}

interface AgentConfig {
  configured?: boolean;
  provider?: 'openai' | 'openrouter' | null;
  promptVersion?: string;
  models?: ModelInfo[];
}

function isBlocked(body: string): boolean {
  try {
    const value = JSON.parse(body) as { blocked?: boolean; ok?: boolean };
    return value.blocked === true || value.ok === false;
  } catch {
    return false;
  }
}

function statusLabel(receipt: AgentTrialReceipt): string {
  if (receipt.status === 'error') return 'ERROR';
  if (receipt.summary.checkoutReached && receipt.summary.blocked) return 'BLOCKER PROVED';
  if (receipt.summary.checkoutReached) return 'CHECKOUT REACHED';
  return receipt.status === 'completed' ? 'PARTIAL PATH' : 'RUNNING';
}

export function AgentShopper() {
  const storeId = useShopStore((state) => state.storeId);
  const store = getStore(storeId);
  const storeMeta = useMemo(
    () => ({ id: store.id, name: store.name, source: store.audit?.source ?? 'builtin' }),
    [store.audit?.source, store.id, store.name],
  );
  const [goal, setGoal] = useState(GOALS[0]);
  const [log, setLog] = useState<Entry[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [config, setConfig] = useState<AgentConfig>({});
  const [receipts, setReceipts] = useState<AgentTrialReceipt[]>([]);

  useEffect(() => {
    void fetch('/api/v1/agent/models')
      .then((response) => response.json())
      .then((data: AgentConfig) => setConfig(data))
      .catch(() => setConfig({ configured: false }));
  }, []);

  const runOne = useCallback(
    async (showLog: boolean): Promise<AgentTrialReceipt | null> => {
      let trialId = '';
      let toolResults: Array<{ callId: string; output: string }> = [];
      const push = (entry: Entry) => {
        if (showLog) setLog((items) => [...items, entry]);
      };

      for (let turn = 0; turn < MAX_TURNS + 1; turn += 1) {
        const response = await fetch('/api/v1/agent/step', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(
            trialId
              ? { trialId, toolResults }
              : { goal, store: storeMeta },
          ),
        });
        const data = (await response.json()) as StepResponse;
        if (data.trial) trialId = data.trial.id;

        if (!response.ok) {
          push({
            kind: 'error',
            body: data.hint ?? data.detail ?? data.error ?? `HTTP ${response.status}`,
          });
          return data.trial ?? null;
        }
        if (data.message) push({ kind: 'say', body: data.message });
        if (!data.toolCalls?.length) return data.trial ?? null;

        toolResults = [];
        for (const call of data.toolCalls) {
          let args: Record<string, unknown> = {};
          try {
            args = JSON.parse(call.arguments || '{}') as Record<string, unknown>;
          } catch {
            args = {};
          }
          push({ kind: 'call', name: call.name, args: JSON.stringify(args) });

          let output: string;
          try {
            output = await invokeToolLocally(call.name, args);
          } catch (error) {
            output = JSON.stringify({
              ok: false,
              error: error instanceof Error ? error.message : String(error),
            });
          }
          push({ kind: 'result', name: call.name, body: output, blocked: isBlocked(output) });
          toolResults.push({ callId: call.id, output });
        }
      }
      return null;
    },
    [goal, storeMeta],
  );

  const run = useCallback(
    async (count: number) => {
      setBusy(true);
      setLog([]);
      setReceipts([]);
      try {
        for (let index = 0; index < count; index += 1) {
          setProgress(count === 1 ? 'Agent is shopping…' : `Trial ${index + 1} of ${count}…`);
          const receipt = await runOne(index === count - 1);
          if (receipt) setReceipts((items) => [...items, receipt]);
        }
      } finally {
        setProgress('');
        setBusy(false);
      }
    },
    [runOne],
  );

  const modelLabel = config.models?.[0]?.label ?? 'GPT-5.6 Terra';
  const providerLabel = config.provider === 'openai' ? 'OpenAI Responses API' : 'deployment fallback';

  return (
    <section className="agent-shopper" aria-label="Run a real agent trial against this store">
      <p className="integrations__section-label">Agent trial</p>
      <h3>Test the store with a real model</h3>
      <p className="integrations__muted">
        {modelLabel} chooses among eight commerce tools. This page executes each call through{' '}
        <code>document.modelContext</code>. The server keeps the transcript, and Render KV keeps the
        receipt. The model tests the store; it never assigns the readiness score.
      </p>

      <div className="agent-shopper__controls">
        <label className="integrations__shop-label">
          Shopping goal
          <select
            className="integrations__shop-input"
            value={goal}
            onChange={(event) => setGoal(event.target.value)}
            disabled={busy}
          >
            {GOALS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <div className="agent-shopper__actions">
          <button type="button" className="btn btn--primary" onClick={() => void run(1)} disabled={busy}>
            {busy ? progress : 'Run one trial'}
          </button>
          <button type="button" className="btn btn--secondary" onClick={() => void run(3)} disabled={busy}>
            Repeat 3×
          </button>
        </div>
      </div>

      {receipts.length > 0 ? (
        <div className="agent-shopper__receipts" aria-label="Persistent agent trial receipts">
          {receipts.map((receipt, index) => (
            <article className="agent-shopper__receipt" key={receipt.id}>
              <div>
                <span className="agent-shopper__receipt-index">TRIAL {index + 1}</span>
                <strong>{statusLabel(receipt)}</strong>
              </div>
              <dl>
                <div><dt>Search</dt><dd>{receipt.summary.searched ? 'yes' : 'no'}</dd></div>
                <div><dt>Cart</dt><dd>{receipt.summary.cartChanged ? 'changed' : 'no'}</dd></div>
                <div><dt>Checkout</dt><dd>{receipt.summary.checkoutReached ? 'reached' : 'no'}</dd></div>
                <div><dt>Calls</dt><dd>{receipt.summary.callCount}</dd></div>
              </dl>
              <p>{receipt.summary.blocker ?? receipt.finalMessage ?? 'Receipt saved.'}</p>
              <small>{new Date(receipt.createdAt).toLocaleString()} · {receipt.id.slice(0, 8)}</small>
            </article>
          ))}
        </div>
      ) : null}

      {log.length > 0 ? (
        <ol className="agent-shopper__log">
          {log.map((entry, index) => (
            <li key={index} className={`agent-shopper__row agent-shopper__row--${entry.kind}`}>
              {entry.kind === 'call' ? (
                <><span className="agent-shopper__arrow">→</span><code>{entry.name}({entry.args})</code></>
              ) : entry.kind === 'result' ? (
                <code className={entry.blocked ? 'agent-shopper__blocked' : undefined}>
                  {entry.body.replace(/\s+/g, ' ').slice(0, 220)}
                </code>
              ) : entry.kind === 'say' ? (
                <p className="agent-shopper__say">{entry.body}</p>
              ) : (
                <p className="integrations__warn">{entry.body}</p>
              )}
            </li>
          ))}
        </ol>
      ) : null}

      <p className="integrations__muted agent-shopper__model">
        {providerLabel} · {config.promptVersion ?? 'prompt loading'} · {store.name}
      </p>
    </section>
  );
}
