import { useState } from 'react';
import { getStore } from '../data/stores';
import { useShopStore } from '../store/shopStore';
import { invokeToolLocally } from '../webmcp/registerTools';

const SAMPLE_CALLS = [
  {
    label: 'search_catalog: espresso',
    tool: 'search_catalog',
    args: { query: 'espresso' },
  },
  {
    label: 'get_readiness_score',
    tool: 'get_readiness_score',
    args: {},
  },
  {
    label: 'add_to_order: first SKU',
    tool: 'add_to_order',
    args: { product_id: '__FIRST__', quantity: 1 },
  },
  {
    label: 'simulate_agent_journey',
    tool: 'simulate_agent_journey',
    args: {},
  },
  {
    label: 'apply_readiness_fix: disable_captcha',
    tool: 'apply_readiness_fix',
    args: { fix: 'disable_captcha' },
  },
] as const;

export function DevToolPanel() {
  const [output, setOutput] = useState('');
  const storeId = useShopStore((s) => s.storeId);
  const products = getStore(storeId).products;
  const firstSku = products.find((p) => p.inStock)?.id ?? products[0]?.id;

  const run = async (tool: string, args: Record<string, unknown>) => {
    const resolved = { ...args };
    if (resolved.product_id === '__FIRST__') {
      resolved.product_id = firstSku;
    }
    setOutput(await invokeToolLocally(tool, resolved));
  };

  return (
    <details className="dev-panel">
      <summary>Agent tool console — test WebMCP tools without the browser flag</summary>
      <div className="dev-panel__body">
        <p className="dev-panel__hint">
          Same tools your shopping assistant uses in Chrome. Run calls here to verify catalog,
          order sync, and readiness before going live.
        </p>
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
              {products.filter((p) => p.inStock).map((p) => (
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
