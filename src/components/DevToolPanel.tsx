import { useState } from 'react';
import { PRODUCTS } from '../data/catalog';
import { invokeToolLocally } from '../webmcp/registerTools';

const SAMPLE_CALLS = [
  {
    label: 'Search for Mom under $70',
    tool: 'search_products',
    args: { recipient: 'mom', max_price: 70 },
  },
  {
    label: 'Stage scarf for Mom',
    tool: 'stage_for_recipient',
    args: { product_id: 'p1', recipient: 'mom' },
  },
  {
    label: 'Board state',
    tool: 'get_staging_board',
    args: {},
  },
  {
    label: 'Budget status',
    tool: 'get_budget_status',
    args: {},
  },
] as const;

export function DevToolPanel() {
  const [output, setOutput] = useState<string>('');
  const [productId, setProductId] = useState('p1');
  const [recipient, setRecipient] = useState<'mom' | 'dad' | 'sister'>('mom');

  const run = async (tool: string, args: Record<string, unknown>) => {
    const result = await invokeToolLocally(tool, args);
    setOutput(result);
  };

  return (
    <details className="dev-panel">
      <summary>Judge / dev tool harness (no WebMCP required)</summary>
      <div className="dev-panel__body">
        <div className="dev-panel__samples">
          {SAMPLE_CALLS.map((sample) => (
            <button
              key={sample.label}
              type="button"
              className="btn btn--secondary"
              onClick={() => run(sample.tool, { ...sample.args })}
            >
              {sample.label}
            </button>
          ))}
        </div>
        <div className="dev-panel__manual">
          <label>
            Product
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            >
              {PRODUCTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id} — {p.name} (${p.price})
                </option>
              ))}
            </select>
          </label>
          <label>
            Recipient
            <select
              value={recipient}
              onChange={(e) =>
                setRecipient(e.target.value as 'mom' | 'dad' | 'sister')
              }
            >
              <option value="mom">mom</option>
              <option value="dad">dad</option>
              <option value="sister">sister</option>
            </select>
          </label>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() =>
              run('stage_for_recipient', {
                product_id: productId,
                recipient,
              })
            }
          >
            stage_for_recipient
          </button>
        </div>
        {output && (
          <pre className="dev-panel__output" aria-label="Tool output">
            {output}
          </pre>
        )}
      </div>
    </details>
  );
}
