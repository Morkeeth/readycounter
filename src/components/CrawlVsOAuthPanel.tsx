import { useEffect, useState } from 'react';
import { apiAuditCompare, type AuditCompareResponse } from '../api/client';
import { useShopStore } from '../store/shopStore';
import { getStore } from '../data/stores';

function isFilmMode(): boolean {
  return new URLSearchParams(window.location.search).get('film') === '1';
}

export function CrawlVsOAuthPanel() {
  const storeId = useShopStore((s) => s.storeId);
  const store = getStore(storeId);
  const audit = store.audit;
  const [shop, setShop] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditCompareResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const storefrontUrl = audit?.url ?? '';
  const canCompare =
    audit &&
    audit.source !== 'builtin' &&
    audit.source !== 'import' &&
    (audit.source === 'url-crawl' || audit.source === 'shopify-admin') &&
    !!storefrontUrl;

  const runCompare = async () => {
    if (!storefrontUrl) return;
    setLoading(true);
    setError(null);
    const data = await apiAuditCompare(storefrontUrl, shop.trim() || undefined);
    setLoading(false);
    if (!data) {
      setError('Compare request failed.');
      return;
    }
    setResult(data);
  };

  useEffect(() => {
    if (!canCompare || !isFilmMode() || result) return;
    void runCompare();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- film auto-run once
  }, [canCompare, storefrontUrl]);

  if (!canCompare) {
    return null;
  }

  return (
    <article className="integrations__card integrations__card--wide crawl-oauth" style={{ marginBottom: '1rem' }}>
      <h3>Three discovery paths</h3>
      <p className="integrations__muted">
        Public <code>products.json</code> (what scrapers read) · Shopify{' '}
        <code>/api/ucp/mcp</code> (agent protocol) · Admin API (OAuth). Same bill, three
        ingestion modes.
      </p>
      <div className="crawl-oauth__row">
        <label>
          Storefront URL
          <input type="url" value={storefrontUrl} readOnly />
        </label>
        <label>
          Shopify shop (optional)
          <input
            type="text"
            placeholder="your-store.myshopify.com"
            value={shop}
            onChange={(e) => setShop(e.target.value)}
          />
        </label>
        <button type="button" className="btn btn--primary" disabled={loading} onClick={() => void runCompare()}>
          {loading ? 'Comparing…' : 'Compare all paths'}
        </button>
      </div>
      {error ? <p className="integrations__warn">{error}</p> : null}
      {result ? (
        <div className="crawl-oauth__result">
          <p>
            <strong>{result.headline}</strong>
          </p>
          <table className="rankings-table">
            <thead>
              <tr>
                <th>Mode</th>
                <th>SKUs</th>
                <th>GTIN%</th>
                <th>Catalog</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{result.crawl.label}</td>
                <td>{result.crawl.productCount}</td>
                <td>{result.crawl.gtinPct}%</td>
                <td>
                  {result.crawl.catalogScore}/{result.crawl.catalogBudget}
                </td>
              </tr>
              <tr>
                <td>{result.ucp?.label ?? 'Shopify UCP MCP'}</td>
                <td>{result.ucp?.available ? result.ucp.productCount : '—'}</td>
                <td>{result.ucp?.available ? `${result.ucp.gtinPct}%` : '—'}</td>
                <td className="integrations__muted">
                  {result.ucp?.available
                    ? `${result.ucp.tools.length} tools`
                    : (result.ucp?.error ?? 'not available')}
                </td>
              </tr>
              {result.oauth ? (
                <tr>
                  <td>{result.oauth.label}</td>
                  <td>{result.oauth.productCount}</td>
                  <td>{result.oauth.gtinPct}%</td>
                  <td>
                    {result.oauth.catalogScore}/{result.oauth.catalogBudget}
                  </td>
                </tr>
              ) : (
                <tr>
                  <td>Shopify Admin</td>
                  <td colSpan={3} className="integrations__muted">
                    {result.oauthError ?? 'Connect OAuth to load Admin row.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {result.delta ? (
            <p className="integrations__muted">
              Admin Δ catalog {result.delta.catalogScore >= 0 ? '+' : ''}
              {result.delta.catalogScore} pts · Δ GTIN {result.delta.gtinPct >= 0 ? '+' : ''}
              {result.delta.gtinPct}pp
            </p>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
