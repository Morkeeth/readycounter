import { useState } from 'react';
import { apiAuditUrl, apiFetchServerStore, type FieldReviewPayload } from '../api/client';
import { reviewAgainstField } from '../data/field-companion';
import { registerCustomStore } from '../data/stores';
import { useShopStore } from '../store/shopStore';
import { FieldReviewPanel } from './FieldReviewPanel';

interface StorefrontAuditFormProps {
  onSuccess?: (storeId: string) => void;
  /** After audit, jump to Readiness tab. */
  navigateToBill?: boolean;
  onOpenBill?: () => void;
}

export function StorefrontAuditForm({
  onSuccess,
  navigateToBill,
  onOpenBill,
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

  const audit = async () => {
    const target = url.trim();
    if (!target) return;
    setBusy(true);
    setErr(null);
    setMsg(null);
    setFieldReview(null);
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
    const catalogBudget = data.summary?.catalogBudget ?? 100;
    setMsg(
      `${data.name}: ${data.productCount} SKUs · catalog ${data.score}/${catalogBudget} (${data.meta?.method ?? 'audit'})`,
    );
    setFieldReview(data.fieldReview ?? null);
    onSuccess?.(data.storeId);
    if (navigateToBill) onOpenBill?.();
  };

  const openBill = () => {
    if (!lastStoreId) return;
    onOpenBill?.();
  };

  return (
    <div className="audit-form">
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
          {busy ? 'Crawling catalog…' : 'Audit storefront'}
        </button>
        {lastStoreId && !navigateToBill ? (
          <button type="button" className="btn btn--secondary" onClick={openBill}>
            Open bill
          </button>
        ) : null}
      </div>
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
        Public <code>products.json</code> or JSON-LD — checkout lines marked NOT MEASURED until
        OAuth. Saved to Render KV; return via <code>?store=…</code>.
      </p>
    </div>
  );
}
