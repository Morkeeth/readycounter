import { useMemo, useState } from 'react';
import { apiAuditUrl, apiFetchServerStore, apiRankings, type FieldReviewPayload } from '../api/client';
import { reviewAgainstField } from '../data/field-companion';
import { registerCustomStore } from '../data/stores';
import {
  computeAuditDelta,
  loadPriorAudit,
  savePriorAudit,
  snapshotFromAudit,
  type AuditDelta,
} from '../lib/audit-delta';
import { compareToField, type FieldCompareResult } from '../lib/field-compare';
import { useShopStore } from '../store/shopStore';
import { FieldCompareStrip } from './FieldCompareStrip';
import { FieldReviewPanel } from './FieldReviewPanel';

interface StorefrontAuditFormProps {
  onSuccess?: (storeId: string) => void;
  /** After audit, jump to Readiness tab. */
  navigateToBill?: boolean;
  onOpenBill?: () => void;
  onOpenRankings?: (filter: {
    vertical: string;
    ucpFilter: 'all' | 'ucp-gtin-gap';
    host: string;
  }) => void;
}

export function StorefrontAuditForm({
  onSuccess,
  navigateToBill,
  onOpenBill,
  onOpenRankings,
}: StorefrontAuditFormProps) {
  const switchStore = useShopStore((s) => s.switchStore);
  const [url, setUrl] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('audit_url') ?? (params.get('demo') === '1' ? 'https://colourpop.com' : '');
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [lastStoreId, setLastStoreId] = useState<string | null>(null);
  const [fieldReview, setFieldReview] = useState<FieldReviewPayload | null>(null);
  const [delta, setDelta] = useState<AuditDelta | null>(null);
  const [fieldCompare, setFieldCompare] = useState<FieldCompareResult | null>(null);
  const [youSnapshot, setYouSnapshot] = useState<{
    catalogScore: number;
    catalogBudget: number;
    gtinPct: number;
    productCount: number;
  } | null>(null);
  const [priorReady, setPriorReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const [auditSignals, setAuditSignals] = useState<{
    offerPct: number | null;
    policySmoke: import('../api/client').PolicySmokePayload | null;
  } | null>(null);

  const hasPrior = useMemo(() => {
    if (priorReady) return true;
    return Boolean(url.trim() && loadPriorAudit(url.trim()));
  }, [url, priorReady]);

  const syncAuditUrlParam = (target: string) => {
    const next = new URL(window.location.href);
    next.searchParams.set('audit_url', target);
    next.searchParams.set('view', 'integrations');
    window.history.replaceState({}, '', next.toString());
  };

  const copyReceipt = async (line: string) => {
    const text = `${line}\n${window.location.origin}${window.location.pathname}?view=integrations&audit_url=${encodeURIComponent(url.trim())}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt('Copy field receipt:', text);
    }
  };

  const audit = async () => {
    const target = url.trim();
    if (!target) return;
    setBusy(true);
    setErr(null);
    setMsg(null);
    setFieldReview(null);
    setDelta(null);
    setFieldCompare(null);
    setYouSnapshot(null);
    setAuditSignals(null);
    const prior = loadPriorAudit(target);
    const result = await apiAuditUrl(target);
    setBusy(false);

    if (!result.ok) {
      setErr(result.error);
      setFieldReview(
        result.fieldReview ??
          reviewAgainstField({ productsJsonOk: false, error: result.error }),
      );
      return;
    }

    const data = result.data;
    const store = await apiFetchServerStore(data.storeId);
    if (store) registerCustomStore(store);
    switchStore(data.storeId);
    setLastStoreId(data.storeId);
    const catalogBudget = data.summary?.catalogBudget ?? 24;
    const catalogScore = data.summary?.catalogScore ?? data.score;
    const gtinPct = data.meta?.gtinPct ?? 0;
    const current = snapshotFromAudit({
      url: data.meta?.url ?? target,
      catalogScore,
      catalogBudget,
      gtinPct,
      productCount: data.productCount,
      method: data.meta?.method,
    });
    if (prior) {
      setDelta(computeAuditDelta(prior, current));
    }
    savePriorAudit(current);
    setPriorReady(true);
    syncAuditUrlParam(target);

    const you = {
      catalogScore,
      catalogBudget,
      gtinPct,
      productCount: data.productCount,
    };
    setYouSnapshot(you);

    const rankings = await apiRankings();
    if (rankings?.rows?.length) {
      setFieldCompare(
        compareToField(
          { url: target, ...you },
          rankings.rows,
          {
            shopCount: rankings.shopCount,
            succeeded: rankings.succeeded,
            avgCatalogScore: rankings.avgCatalogScore,
            avgGtinPct: rankings.avgGtinPct,
          },
        ),
      );
    }

    setMsg(
      `${data.name}: ${data.productCount} SKUs · catalog ${catalogScore}/${catalogBudget} pts (catalog budget — never /100 for field crawls)`,
    );
    setFieldReview(data.fieldReview ?? null);
    setAuditSignals({
      offerPct: data.offerPct ?? data.meta?.offerPct ?? null,
      policySmoke: data.policySmoke ?? data.meta?.policySmoke ?? null,
    });
    onSuccess?.(data.storeId);
    if (navigateToBill) onOpenBill?.();
    document.getElementById('prove-webmcp')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openBill = () => {
    if (!lastStoreId) return;
    onOpenBill?.();
  };

  const openProveCoShop = () => {
    if (!lastStoreId) return;
    const next = new URL(window.location.href);
    next.searchParams.set('view', 'shop');
    next.searchParams.set('store', lastStoreId);
    window.location.href = next.toString();
  };

  const openProveConsole = () => {
    document.getElementById('agent-tool-console')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const details = document.querySelector('#agent-tool-console details') as HTMLDetailsElement | null;
    if (details) details.open = true;
  };

  const policyLabel = (smoke: import('../api/client').PolicySmokePayload | null) => {
    if (!smoke) return 'Policy · not measured';
    if (!smoke.privacyUrl && !smoke.termsUrl) return 'Policy · URLs not found';
    const privacy = smoke.privacyUrl
      ? smoke.privacyOk === true
        ? 'privacy ok'
        : smoke.privacyOk === false
          ? 'privacy fail'
          : 'privacy ?'
      : 'privacy missing';
    const terms = smoke.termsUrl
      ? smoke.termsOk === true
        ? 'terms ok'
        : smoke.termsOk === false
          ? 'terms fail'
          : 'terms ?'
      : 'terms missing';
    const pass =
      (smoke.privacyUrl ? smoke.privacyOk === true : true) &&
      (smoke.termsUrl ? smoke.termsOk === true : true) &&
      Boolean(smoke.privacyUrl || smoke.termsUrl);
    return pass ? `Policy · pass (${privacy}, ${terms})` : `Policy · fail (${privacy}, ${terms})`;
  };

  const openRankings = () => {
    if (!fieldCompare) return;
    onOpenRankings?.({
      ...fieldCompare.rankingsFilter,
      host: fieldCompare.host,
    });
    document.getElementById('rankings-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const policyPass = auditSignals?.policySmoke
    ? (auditSignals.policySmoke.privacyUrl ? auditSignals.policySmoke.privacyOk === true : true) &&
      (auditSignals.policySmoke.termsUrl ? auditSignals.policySmoke.termsOk === true : true) &&
      Boolean(auditSignals.policySmoke.privacyUrl || auditSignals.policySmoke.termsUrl)
    : null;

  return (
    <div className="audit-form" id="audit-storefront">
      <label className="integrations__shop-label">
        Storefront URL
        <input
          type="url"
          className="integrations__shop-input"
          placeholder="https://your-store.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && url.trim() && !busy) void audit();
          }}
        />
      </label>
      <div className="share-bar__actions">
        <button
          type="button"
          className="btn btn--primary"
          disabled={!url.trim() || busy}
          onClick={() => void audit()}
        >
          {busy
            ? 'Crawling catalog…'
            : hasPrior
              ? 'Re-audit & show delta'
              : 'Audit storefront'}
        </button>
        {lastStoreId && !navigateToBill ? (
          <button type="button" className="btn btn--secondary" onClick={openBill}>
            Open bill
          </button>
        ) : null}
        {lastStoreId ? (
          <>
            <button type="button" className="btn btn--secondary" onClick={openProveCoShop}>
              Prove in co-shop
            </button>
            <button type="button" className="btn btn--ghost" onClick={openProveConsole}>
              Tool console
            </button>
          </>
        ) : null}
        {fieldCompare ? (
          <>
            <button type="button" className="btn btn--secondary" onClick={openRankings}>
              Rankings · {fieldCompare.vertical}
              {fieldCompare.ucpGtinWhereCrawlZero ? ' · UCP gap' : ''}
            </button>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => void copyReceipt(fieldCompare.receiptLine)}
            >
              {copied ? 'Receipt copied' : 'Copy field receipt'}
            </button>
          </>
        ) : null}
      </div>

      {auditSignals ? (
        <div className="audit-form__chips" aria-label="Crawl signals">
          <span
            className={
              auditSignals.offerPct == null
                ? 'audit-form__chip audit-form__chip--muted'
                : auditSignals.offerPct >= 50
                  ? 'audit-form__chip audit-form__chip--ok'
                  : 'audit-form__chip audit-form__chip--warn'
            }
          >
            Offer%{' '}
            {auditSignals.offerPct == null ? 'n/a (no JSON-LD products)' : `${auditSignals.offerPct}%`}
          </span>
          <span
            className={
              policyPass === true
                ? 'audit-form__chip audit-form__chip--ok'
                : policyPass === false
                  ? 'audit-form__chip audit-form__chip--warn'
                  : 'audit-form__chip audit-form__chip--muted'
            }
          >
            {policyLabel(auditSignals.policySmoke)}
          </span>
        </div>
      ) : null}

      {fieldCompare && youSnapshot ? (
        <FieldCompareStrip compare={fieldCompare} you={youSnapshot} delta={delta} />
      ) : null}

      {delta ? (
        <p className="integrations__ok audit-form__remeasure">
          4 · Re-measure — delta on catalog, GTIN, and SKU count from your prior audit.
        </p>
      ) : null}

      {msg ? <p className="integrations__ok">{msg}</p> : null}
      {err ? <p className="integrations__warn">{err}</p> : null}
      {fieldReview ? (
        <FieldReviewPanel
          review={fieldReview}
          storeLabel={msg ? undefined : url.trim() || undefined}
          compact
        />
      ) : null}
      <p className="integrations__muted">
        Public <code>products.json</code> or JSON-LD — catalog budget only, never a full /100 for
        field crawls. Re-run the same URL after a fix to get a delta receipt. Share via{' '}
        <code>?audit_url=</code> deep link. Checkout walls stay NOT MEASURED until OAuth. Saved to
        Render KV; return via <code>?store=…</code>.
      </p>
    </div>
  );
}
