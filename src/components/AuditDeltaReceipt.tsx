import type { AuditDelta } from '../lib/audit-delta';

interface AuditDeltaReceiptProps {
  delta: AuditDelta;
}

export function AuditDeltaReceipt({ delta }: AuditDeltaReceiptProps) {
  const priorDate = (() => {
    try {
      return new Date(delta.prior.at).toLocaleString();
    } catch {
      return delta.prior.at;
    }
  })();

  return (
    <aside
      className={
        delta.improved
          ? 'audit-delta audit-delta--up'
          : delta.unchanged
            ? 'audit-delta'
            : 'audit-delta audit-delta--down'
      }
      aria-label="Re-audit delta receipt"
    >
      <p className="audit-delta__kicker">Re-measure receipt</p>
      <p className="audit-delta__summary">{delta.summary}</p>
      <dl className="audit-delta__grid">
        <div>
          <dt>Catalog</dt>
          <dd>
            {delta.prior.catalogScore} → <strong>{delta.current.catalogScore}</strong>/
            {delta.current.catalogBudget}
            <span className="audit-delta__pp">
              {' '}
              ({fmt(delta.catalogScore)} pts)
            </span>
          </dd>
        </div>
        <div>
          <dt>Scrape GTIN</dt>
          <dd>
            {delta.prior.gtinPct}% → <strong>{delta.current.gtinPct}%</strong>
            <span className="audit-delta__pp"> ({fmt(delta.gtinPct)}pp)</span>
          </dd>
        </div>
        <div>
          <dt>SKUs sampled</dt>
          <dd>
            {delta.prior.productCount} → <strong>{delta.current.productCount}</strong>
            <span className="audit-delta__pp"> ({fmt(delta.productCount)})</span>
          </dd>
        </div>
      </dl>
      <p className="audit-delta__prior">Prior audit · {priorDate}</p>
      <p className="audit-delta__note">
        Catalog budget only — never /100 for public crawls. Checkout walls stay unmeasured until
        OAuth or a journey. For UCP vs scrape, use Compare on the same URL.
      </p>
    </aside>
  );
}

function fmt(n: number): string {
  return n > 0 ? `+${n}` : String(n);
}
