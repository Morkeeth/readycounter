import { useEffect, useState } from 'react';
import { apiAvailable } from '../api/client';
import { toShopifyCatalog, validateStoreCatalog } from '../integrations/shopify-catalog';
import { useShopStore } from '../store/shopStore';

export function IntegrationsPanel() {
  const storeId = useShopStore((s) => s.storeId);
  const [apiUp, setApiUp] = useState<boolean | null>(null);
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

  return (
    <section className="integrations" aria-label="Integrations">
      <h2>Integrations</h2>
      <p className="integrations__lead">
        API-first catalog + readiness — the same surface WebMCP tools and Shopify feeds share.
      </p>

      <div className="integrations__grid">
        <article className="integrations__card">
          <h3>REST API</h3>
          <p>
            <code>GET /api/v1/health</code> · <code>/catalog</code> · <code>/readiness</code>
          </p>
          <p>
            Status:{' '}
            <strong className={apiUp ? 'integrations__ok' : 'integrations__warn'}>
              {apiUp === null ? 'checking…' : apiUp ? 'live (deployed)' : 'local dev — use share link'}
            </strong>
          </p>
        </article>

        <article className="integrations__card">
          <h3>Shopify Catalog export</h3>
          <p>
            {feed.ok ? 'Feed validates for agent discovery.' : `${feed.issues.length} feed issues.`}
          </p>
          <ul className="integrations__issues">
            {feed.issues.slice(0, 4).map((issue) => (
              <li key={`${issue.productId}-${issue.field}`}>
                <code>{issue.productId}</code> — {issue.message}
              </li>
            ))}
          </ul>
          <button type="button" className="btn btn--secondary" onClick={downloadFeed}>
            Download Shopify JSON
          </button>
        </article>

        <article className="integrations__card">
          <h3>Live co-shop rooms</h3>
          <p>
            On Vercel: <code>POST /api/v1/rooms</code> then share{' '}
            <code>?room=…&store=…</code> — human + agent sync via API polling.
          </p>
          <p className="integrations__muted">See INTEGRATIONS.md for curl examples.</p>
        </article>
      </div>
    </section>
  );
}
