import { useState } from 'react';
import { PRODUCTS } from '../data/catalog';
import { invokeToolLocally } from '../webmcp/registerTools';

const SAMPLE_CALLS = [
  {
    label: 'search_catalog: espresso',
    tool: 'search_catalog',
    args: { query: 'espresso' },
  },
  {
    label: 'add_to_order: pour over kit',
    tool: 'add_to_order',
    args: { product_id: 'sku-pour-over', quantity: 1 },
  },
  {
    label: 'get_order',
    tool: 'get_order',
    args: {},
  },
  {
    label: 'prepare_checkout',
    tool: 'prepare_checkout',
    args: {},
  },
] as const;

export function DevToolPanel() {
  const [output, setOutput] = useState('');

  const run = async (tool: string, args: Record<string, unknown>) => {
    setOutput(await invokeToolLocally(tool, args));
  };

  return (
    <details className="dev-panel">
      <summary>Judge harness — invoke WebMCP tools without browser flag</summary>
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
            SKU
            <select
              id="dev-sku"
              onChange={(e) => {
                void e;
              }}
            >
              {PRODUCTS.filter((p) => p.inStock).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => {
              const select = document.getElementById('dev-sku') as HTMLSelectElement;
              void run('add_to_order', {
                product_id: select.value,
                quantity: 1,
              });
            }}
          >
            add_to_order
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
