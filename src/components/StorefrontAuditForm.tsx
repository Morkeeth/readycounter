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
      `${data.name}: ${data.productCount} SKUs · catalog ${catalogScore}/${catalogBudget} pts · Offer ${data.meta?.offerPct ?? '—'}%${
        data.meta?.policySmoke?.measured
          ? ` · policy smoke ${data.meta.policySmoke.privacyOk === true && data.meta.policySmoke.termsOk === true ? 'ok' : 'gap'}`
          : ' · policy not measurable'
      }`,
    );
    setFieldReview(data.fieldReview ?? null);
    onSuccess?.(data.storeId);
    if (navigateToBill) onOpenBill?.();
  };

  const openBill = () => {
    if (!lastStoreId) return;
    onOpenBill?.();
  };

  const openRankings = () => {
    if (!fieldCompare) return;
    onOpenRankings?.({
      ...fieldCompare.rankingsFilter,
      host: fieldCompare.host,
    });
    document.getElementById('rankings-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

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

      {fieldCompare && youSnapshot ? (
        <FieldCompareStrip compare={fieldCompare} you={youSnapshot} delta={delta} />
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
