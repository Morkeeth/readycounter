import { useEffect, useState } from 'react';
import { apiAvailable } from '../api/client';
import {
  importShopifyFeed,
  toShopifyCatalog,
  validateStoreCatalog,
  type ShopifyCatalogExport,
} from '../integrations/shopify-catalog';
import { registerCustomStore } from '../data/stores';
import { useShopStore } from '../store/shopStore';
import { DevToolPanel } from './DevToolPanel';

export function IntegrationsPanel() {
  const storeId = useShopStore((s) => s.storeId);
  const switchStore = useShopStore((s) => s.switchStore);
  const [apiUp, setApiUp] = useState<boolean | null>(null);
  const [importJson, setImportJson] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const feed = validateStoreCatalog(storeId);
  const shopify = toShopifyCatalog(storeId);

  useEffect(() => {
    void apiAvailable().then(setApiUp);
  }, []);

  const downloadFeed = () => {
    const blob = new Blob([JSON.stringify(shopify, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${storeId}-shopify-catalog.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importFeed = () => {
    setImportError(null);
    try {
      const parsed = JSON.parse(importJson) as ShopifyCatalogExport;
      const def = importShopifyFeed(parsed);
      registerCustomStore(def);
      switchStore(def.id);
      setImportJson('');
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Invalid JSON');
    }
  };

  return (
    <section className="integrations" aria-label="Connect your store">
      <header className="integrations__header">
        <h2>Connect your store</h2>
        <p className="integrations__lead">
          Import your catalog, export for agent feeds, or call the REST API. Scores and fixes
          run on your ReadyCounter sandbox — use the checklist to update your live store.
        </p>
      </header>

      <div className="integrations__grid">
        <article className="integrations__card">
          <h3>REST API</h3>
          <p>
            <code>GET /api/v1/health</code> · <code>/catalog</code> · <code>/readiness</code> ·{' '}
            <code>/tools</code>
          </p>
          <p>
            Status:{' '}
            <strong className={apiUp ? 'integrations__ok' : 'integrations__warn'}>
              {apiUp === null
                ? 'checking…'
                : apiUp
                  ? 'connected'
                  : 'local preview — deploy for live API'}
            </strong>
          </p>
          <p className="integrations__muted">
            OpenAPI spec at <code>/openapi.yaml</code>
          </p>
        </article>

        <article className="integrations__card">
          <h3>Shopify catalog export</h3>
          <p>
            {feed.ok
              ? 'Your feed is valid for agent discovery.'
              : `${feed.issues.length} issues blocking full agent discovery.`}
          </p>
          <ul className="integrations__issues">
            {feed.issues.slice(0, 4).map((issue) => (
              <li key={`${issue.productId}-${issue.field}`}>
                <code>{issue.productId}</code> — {issue.message}
              </li>
            ))}
          </ul>
          <button type="button" className="btn btn--secondary" onClick={downloadFeed}>
            Download catalog JSON
          </button>
        </article>

        <article className="integrations__card integrations__card--wide">
          <h3>Import your catalog</h3>
          <p>
            Paste Shopify Catalog JSON to spin up a store on ReadyCounter. Your team can shop
            and run readiness checks immediately.
          </p>
          <textarea
            className="integrations__import"
            rows={6}
            placeholder='{ "store": "My Shop", "products": [...] }'
            value={importJson}
            onChange={(e) => setImportJson(e.target.value)}
          />
          {importError ? <p className="integrations__warn">{importError}</p> : null}
          <button
            type="button"
            className="btn btn--primary"
            disabled={!importJson.trim()}
            onClick={importFeed}
          >
            Import catalog
          </button>
        </article>

        <article className="integrations__card">
          <h3>Live co-shop sessions</h3>
          <p>
            Create a session with <code>POST /api/v1/rooms</code>, then share{' '}
            <code>?room=…&store=…</code>. Everyone sees the same cart in real time.
          </p>
          <p className="integrations__muted">See INTEGRATIONS.md for API examples.</p>
        </article>
      </div>

      <DevToolPanel />
    </section>
  );
}
