import { useCallback, useEffect, useState } from 'react';
import {
  apiAuditUrl,
  apiFetchServerStore,
  apiRankings,
  type FieldReviewPayload,
  type UrlAuditResponse,
} from '../api/client';
import { reviewAgainstField } from '../data/field-companion';
import { registerCustomStore } from '../data/stores';
import { runStrangerProbes, type ToolProbeResult } from '../lib/stranger-probes';
import { useShopStore } from '../store/shopStore';
import { FieldReviewPanel } from './FieldReviewPanel';
import { ToolProbePanel } from './ToolProbePanel';

function normalizeDomain(raw: string): string {
  const t = raw.trim();
  if (!t) return '';
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}

interface AuditSnapshot {
  url: string;
  storeName: string;
  storeId: string;
  catalogScore: number;
  catalogBudget: number;
  gtinPct: number;
  productCount: number;
  offerPct: number | null;
  policySmoke?: NonNullable<UrlAuditResponse['meta']>['policySmoke'];
  crawlMethod?: string;
  isFieldCrawl: boolean;
}

export function StrangerPath() {
  const switchStore = useShopStore((s) => s.switchStore);
  const [domain, setDomain] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const audit = params.get('audit_url');
    if (audit) return audit;
    return '';
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<AuditSnapshot | null>(null);
  const [fieldReview, setFieldReview] = useState<FieldReviewPayload | null>(null);
  const [probes, setProbes] = useState<ToolProbeResult[]>([]);
  const [fieldBatch, setFieldBatch] = useState<{ crawled: number; total: number; gtin: number; ucpGap: number } | null>(null);

  useEffect(() => {
    void apiRankings().then((data) => {
      if (!data?.shopCount) return;
      setFieldBatch({
        crawled: data.succeeded,
        total: data.shopCount,
        gtin: data.avgGtinPct,
        ucpGap: data.ucp?.gtinWhereCrawlZero ?? 0,
      });
    });
  }, []);

  const runAudit = useCallback(async (rawUrl: string) => {
    const target = normalizeDomain(rawUrl);
    if (!target) return;
    setBusy(true);
    setErr(null);
    setSnapshot(null);
    setFieldReview(null);
    setProbes([]);

    const result = await apiAuditUrl(target);
    setBusy(false);

    if (!result.ok) {
      setErr(result.error);
      setFieldReview(
        result.fieldReview ??
          reviewAgainstField({ productsJsonOk: false, error: result.error }),
      );
      setProbes(
        runStrangerProbes({
          url: target,
          auditOk: false,
          productCount: 0,
          catalogScore: 0,
          catalogBudget: 24,
          gtinPct: 0,
          offerPct: null,
          storeId: 'ember-oak',
          isFieldCrawl: true,
          error: result.error,
        }),
      );
      return;
    }

    const data = result.data;
    const store = await apiFetchServerStore(data.storeId);
    if (store) registerCustomStore(store);
    switchStore(data.storeId);

    const catalogBudget = data.summary?.catalogBudget ?? 24;
    const catalogScore = data.summary?.catalogScore ?? data.score;
    const gtinPct = data.meta?.gtinPct ?? 0;
    const offerPct = data.meta?.offerPct ?? null;
    const isFieldCrawl = (data.meta?.source ?? 'url-crawl') !== 'builtin';

    const snap: AuditSnapshot = {
      url: data.meta?.url ?? target,
      storeName: data.name,
      storeId: data.storeId,
      catalogScore,
      catalogBudget,
      gtinPct,
      productCount: data.productCount,
      offerPct,
      policySmoke: data.meta?.policySmoke,
      crawlMethod: data.meta?.method,
      isFieldCrawl,
    };
    setSnapshot(snap);
    setFieldReview(data.fieldReview ?? null);
    setProbes(
      runStrangerProbes({
        url: snap.url,
        auditOk: true,
        productCount: snap.productCount,
        catalogScore: snap.catalogScore,
        catalogBudget: snap.catalogBudget,
        gtinPct: snap.gtinPct,
        offerPct: snap.offerPct,
        policySmoke: snap.policySmoke,
        storeId: snap.storeId,
        isFieldCrawl: snap.isFieldCrawl,
        crawlMethod: snap.crawlMethod,
      }),
    );

    const next = new URL(window.location.href);
    next.searchParams.set('audit_url', snap.url);
    next.searchParams.set('view', 'integrations');
    next.searchParams.delete('store');
    window.history.replaceState({}, '', next.toString());
  }, [switchStore]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const audit = params.get('audit_url');
    if (audit && !snapshot && !busy && !err) {
      void runAudit(audit);
    }
  }, [runAudit, snapshot, busy, err]);

  const topFixes = fieldReview?.flags.slice(0, 3) ?? [];

  return (
    <section className="stranger-path" aria-label="Score your store">
      <header className="stranger-path__hero">
        <p className="stranger-path__kicker">Agent readiness · no login</p>
        <h2 className="stranger-path__title">Paste your store. Get the score and the fix list.</h2>
        <p className="stranger-path__lead">
          {fieldBatch ? (
            <>
              We crawled <strong>{fieldBatch.crawled}/{fieldBatch.total}</strong> DTC brands — scrape
              GTIN <strong>{fieldBatch.gtin}%</strong>
              {fieldBatch.ucpGap ? (
                <>
                  {' '}
                  · <strong>{fieldBatch.ucpGap}</strong> UCP gaps
                </>
              ) : null}
              . Your store joins the same batch in under 60 seconds.
            </>
          ) : (
            <>Measure what agents retrieve from your public catalog — not Admin settings we never opened.</>
          )}
        </p>
      </header>

      <form
        className="stranger-path__form"
        onSubmit={(e) => {
          e.preventDefault();
          void runAudit(domain);
        }}
      >
        <label className="integrations__shop-label">
          Your store domain
          <input
            type="text"
            className="integrations__shop-input stranger-path__input"
            placeholder="your-store.com"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            autoComplete="url"
            spellCheck={false}
            disabled={busy}
          />
        </label>
        <button type="submit" className="btn btn--primary btn--wide" disabled={!domain.trim() || busy}>
          {busy ? 'Scoring…' : 'Score my store'}
        </button>
      </form>

      {err ? <p className="integrations__warn">{err}</p> : null}

      {snapshot ? (
        <div className="stranger-path__result">
          <div className="stranger-path__score" aria-live="polite">
            <span className="stranger-path__score-num">{snapshot.catalogScore}</span>
            <span className="stranger-path__score-denom">/ {snapshot.catalogBudget} catalog pts</span>
            <p className="stranger-path__score-store">
              <strong>{snapshot.storeName}</strong> · {snapshot.productCount} SKUs · scrape GTIN{' '}
              {snapshot.gtinPct}%
            </p>
            <p className="integrations__muted">
              Field crawls score catalog budget only — checkout lines stay NOT MEASURED until Shopify
              OAuth. Sandbox demos (ember-oak <strong>70/100</strong>, neon-matcha{' '}
              <strong>65/100</strong>) show full /100 where checkout is declared.
            </p>
          </div>

          {topFixes.length > 0 ? (
            <div className="stranger-path__fixes">
              <h3>Top fixes this month</h3>
              <ol className="stranger-path__fix-list">
                {topFixes.map((f, i) => (
                  <li key={f.issueId}>
                    <span className="stranger-path__fix-rank">{i + 1}</span>
                    <div>
                      <strong>{f.issue.title}</strong>
                      <p>{f.issue.doThisWeek}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}

          {fieldReview ? (
            <FieldReviewPanel review={fieldReview} storeLabel={snapshot.storeName} compact />
          ) : null}

          <ToolProbePanel probes={probes} />
        </div>
      ) : null}
    </section>
  );
}
