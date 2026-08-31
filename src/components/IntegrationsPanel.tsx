import { useEffect, useState } from 'react';
import {
  apiAvailable,
  apiFetchServerStore,
  apiRenderStatus,
  apiShopifyStatus,
  type RenderPartnershipStatus,
  type ShopifyStatus,
} from '../api/client';
import {
  importShopifyFeed,
  toShopifyCatalog,
  validateStoreCatalog,
  type ShopifyCatalogExport,
} from '../integrations/shopify-catalog';
import { registerCustomStore } from '../data/stores';
import { useShopStore } from '../store/shopStore';
import { DevToolPanel } from './DevToolPanel';
import { ConnectLighthouseHero } from './ConnectLighthouseHero';
import { FieldCompanion } from './FieldCompanion';
import { LaunchBrief } from './LaunchBrief';
import { RankingsPanel } from './RankingsPanel';
import { SandboxShowcase } from './SandboxShowcase';
import { StorefrontAuditForm } from './StorefrontAuditForm';
import { WhyWebMCP } from './WhyWebMCP';

interface IntegrationsPanelProps {
  navigateToBill?: boolean;
  onOpenBill?: () => void;
  webmcpLive?: boolean;
  toolCount?: number;
}

export function IntegrationsPanel({
  navigateToBill,
  onOpenBill,
  webmcpLive = false,
  toolCount = 18,
}: IntegrationsPanelProps) {
  const storeId = useShopStore((s) => s.storeId);
  const switchStore = useShopStore((s) => s.switchStore);
  const [apiUp, setApiUp] = useState<boolean | null>(null);
  const [kvRedis, setKvRedis] = useState<boolean | null>(null);
  const [importJson, setImportJson] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [shopDomain, setShopDomain] = useState('');
  const [shopifyStatus, setShopifyStatus] = useState<ShopifyStatus | null>(null);
  const [renderStatus, setRenderStatus] = useState<RenderPartnershipStatus | null>(null);
  const [shopifyMsg, setShopifyMsg] = useState<string | null>(null);
  const [rankingsVertical, setRankingsVertical] = useState<string | undefined>();
  const [rankingsUcpFilter, setRankingsUcpFilter] = useState<
    'all' | 'ucp-on' | 'ucp-gtin-gap' | undefined
  >();
  const [rankingsHost, setRankingsHost] = useState<string | undefined>();
  const feed = validateStoreCatalog(storeId);
  const shopify = toShopifyCatalog(storeId);

  useEffect(() => {
    void apiAvailable().then(setApiUp);
    void apiShopifyStatus().then(setShopifyStatus);
    void apiRenderStatus().then(setRenderStatus);
    void fetch('/api/v1/health')
      .then((r) => r.json())
      .then((h) => setKvRedis(h?.kv?.redisOk === true))
      .catch(() => setKvRedis(false));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('shopify') !== 'connected') return;
    const id = params.get('store');
    if (!id) return;
    void apiFetchServerStore(id).then((store) => {
      if (!store) return;
      registerCustomStore(store);
      switchStore(store.id);
      setShopifyMsg(
        `Connected ${store.name} — ${store.products.length} products on Render KV. Opening bill…`,
      );
      onOpenBill?.();
    });
  }, [switchStore, onOpenBill]);

  const connectShopify = () => {
    const shop = shopDomain.trim();
    if (!shop) return;
    window.location.href = `/api/v1/shopify/auth?shop=${encodeURIComponent(shop)}`;
  };

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

  const openRankingsFromAudit = (filter: {
    vertical: string;
    ucpFilter: 'all' | 'ucp-gtin-gap';
    host: string;
  }) => {
    setRankingsVertical(filter.vertical);
    setRankingsUcpFilter(filter.ucpFilter);
    setRankingsHost(filter.host);
  };

  return (
    <section className="integrations" aria-label="Connect your store">
      <ConnectLighthouseHero />

      <div className="integrations__grid">
        {/* 1 · Measure */}
        <article className="integrations__card integrations__card--wide integrations__card--hero">
          <p className="integrations__section-label">1 · Measure</p>
          <h3>Audit a storefront URL</h3>
          <p>
            Paste a URL — catalog bill, YOU·FIELD strip, handbook flags, Offer% and policy smoke on
            the crawl.
          </p>
          <StorefrontAuditForm
            navigateToBill={navigateToBill}
            onOpenBill={onOpenBill}
            onOpenRankings={openRankingsFromAudit}
          />
        </article>

        <FieldCompanion />

        <RankingsPanel
          initialVertical={rankingsVertical}
          initialUcpFilter={rankingsUcpFilter}
          highlightHost={rankingsHost}
        />

        {/* 3 · Prove with WebMCP */}
        <div id="prove-webmcp" className="integrations__prove">
          <p className="integrations__section-label integrations__section-label--prove">
            3 · Prove with WebMCP
          </p>
          <WhyWebMCP webmcpLive={webmcpLive} toolCount={toolCount} />
          <DevToolPanel />
        </div>

        <article className="integrations__card integrations__card--wide">
          <p className="integrations__section-label">4 · Re-measure</p>
          <h3>Delta receipt · share link</h3>
          <p>
            Re-audit the same URL after a fix — delta prints above the bill. Copy the field receipt
            or share <code>?audit_url=</code> so a stranger can re-run the crawl cold.
          </p>
        </article>

        <article className="integrations__card integrations__card--wide">
          <p className="integrations__section-label">Admin path</p>
          <h3>Connect Shopify OAuth</h3>
          <p>Read-only Admin API — full catalog, barcodes, prices. No payment scopes.</p>
          <p className="integrations__muted">
            {shopifyStatus?.configured
              ? 'OAuth configured on server'
              : 'Set SHOPIFY_CLIENT_ID + secret on Vercel'}
            {kvRedis === true ? ' · Render KV live' : kvRedis === false ? ' · KV memory fallback' : ''}
          </p>
          <label className="integrations__shop-label">
            Shop domain
            <input
              type="text"
              className="integrations__shop-input"
              placeholder="your-store.myshopify.com"
              value={shopDomain}
              onChange={(e) => setShopDomain(e.target.value)}
            />
          </label>
          <div className="share-bar__actions">
            <button
              type="button"
              className="btn btn--primary"
              disabled={!shopDomain.trim() || !shopifyStatus?.configured}
              onClick={connectShopify}
            >
              Install on Shopify
            </button>
          </div>
          {shopifyMsg ? <p className="integrations__ok">{shopifyMsg}</p> : null}
        </article>

        <SandboxShowcase />

        <article className="integrations__card integrations__card--wide">
          <h3>Render partnership</h3>
          <p>
            {renderStatus?.tagline ??
              'Key Value persists stores, rooms, and audit batches across Vercel cold starts.'}
          </p>
          <p className="integrations__muted">
            KV{' '}
            {renderStatus?.kv.connected
              ? `live · ${renderStatus.kv.region ?? 'render'}`
              : kvRedis === false
                ? 'offline — set REDIS_URL'
                : 'checking…'}
            {renderStatus?.lastAuditBatch
              ? ` · batch ${renderStatus.lastAuditBatch.succeeded}/${renderStatus.lastAuditBatch.shopCount} shops · avg catalog ${renderStatus.lastAuditBatch.avgCatalogScore}`
              : ''}
          </p>
        </article>

        <article className="integrations__card">
          <h3>API</h3>
          <p>
            <code>POST /audit/url</code> · <code>/companion</code> · <code>/tools</code>
          </p>
          <p>
            <strong className={apiUp ? 'integrations__ok' : 'integrations__warn'}>
              {apiUp === null ? 'checking…' : apiUp ? 'live' : 'offline'}
            </strong>
          </p>
        </article>

        <article className="integrations__card">
          <h3>Catalog export</h3>
          <p>{feed.ok ? 'Feed valid.' : `${feed.issues.length} issues on current store.`}</p>
          <button type="button" className="btn btn--secondary" onClick={downloadFeed}>
            Download JSON
          </button>
        </article>

        <details className="integrations__card integrations__card--wide integrations__advanced">
          <summary>Import JSON manually</summary>
          <textarea
            className="integrations__import"
            rows={5}
            placeholder='{ "store": "My Shop", "products": [...] }'
            value={importJson}
            onChange={(e) => setImportJson(e.target.value)}
          />
          {importError ? <p className="integrations__warn">{importError}</p> : null}
          <button
            type="button"
            className="btn btn--secondary"
            disabled={!importJson.trim()}
            onClick={importFeed}
          >
            Import catalog
          </button>
        </details>
      </div>

      <details className="launch-brief-details">
        <summary>Launch kit — research, test cases, demo script</summary>
        <LaunchBrief />
      </details>
    </section>
  );
}
