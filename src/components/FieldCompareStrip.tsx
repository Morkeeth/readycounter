import type { AuditDelta } from '../lib/audit-delta';
import type { FieldCompareResult } from '../lib/field-compare';

interface FieldCompareStripProps {
  compare: FieldCompareResult;
  you: {
    catalogScore: number;
    catalogBudget: number;
    gtinPct: number;
    productCount: number;
  };
  delta?: AuditDelta | null;
}

function fmtDelta(n: number, unit: string): string {
  return n > 0 ? `+${n}${unit}` : `${n}${unit}`;
}

function pctLabel(p: number | null, metric: string): string {
  if (p == null) return `${metric} — no peers`;
  if (p >= 50) return `top ${100 - p}% ${metric}`;
  return `bottom ${p === 0 ? 1 : p}% ${metric}`;
}

export function FieldCompareStrip({ compare, you, delta }: FieldCompareStripProps) {
  const fieldCatalog =
    compare.verticalPeerCount >= 5 && compare.verticalAvgCatalog != null
      ? compare.verticalAvgCatalog
      : compare.fieldAvgCatalog;
  const fieldGtin =
    compare.verticalPeerCount >= 5 && compare.verticalAvgGtin != null
      ? compare.verticalAvgGtin
      : compare.fieldAvgGtin;
  const fieldLabel =
    compare.verticalPeerCount >= 5 ? `${compare.vertical} avg` : 'field avg';

  return (
    <aside className="field-compare" aria-label="You vs field comparison">
      <p className="field-compare__kicker">You · field · delta</p>
      <div className="field-compare__cols">
        <div className="field-compare__col field-compare__col--you">
          <h4>You</h4>
          <dl>
            <div>
              <dt>Catalog</dt>
              <dd>
                <strong>
                  {you.catalogScore}/{you.catalogBudget}
                </strong>
              </dd>
            </div>
            <div>
              <dt>Scrape GTIN</dt>
              <dd>
                <strong>{you.gtinPct}%</strong>
              </dd>
            </div>
            <div>
              <dt>SKUs</dt>
              <dd>{you.productCount}</dd>
            </div>
          </dl>
          {compare.catalogRank != null ? (
            <p className="field-compare__rank">
              #{compare.catalogRank} of {compare.catalogPeerCount} ·{' '}
              {pctLabel(compare.catalogPercentile, 'catalog')}
            </p>
          ) : null}
        </div>

        <div className="field-compare__col field-compare__col--field">
          <h4>Field</h4>
          <dl>
            <div>
              <dt>{fieldLabel} catalog</dt>
              <dd>
                <strong>{fieldCatalog}</strong>
                <span className="field-compare__vs"> ({fmtDelta(compare.vsFieldCatalog, ' pts')})</span>
              </dd>
            </div>
            <div>
              <dt>{fieldLabel} GTIN</dt>
              <dd>
                <strong>{fieldGtin}%</strong>
                <span className="field-compare__vs"> ({fmtDelta(compare.vsFieldGtin, 'pp')})</span>
              </dd>
            </div>
            <div>
              <dt>Batch</dt>
              <dd>
                {compare.fieldCrawled}/{compare.fieldAttempted} crawled
              </dd>
            </div>
          </dl>
          {compare.ucpGtinWhereCrawlZero ? (
            <p className="field-compare__ucp-gap">
              UCP GTIN {compare.ucpGtinPct}% where scrape is {you.gtinPct}%
            </p>
          ) : compare.ucpAvailable ? (
            <p className="field-compare__ucp">UCP GTIN {compare.ucpGtinPct ?? 0}%</p>
          ) : null}
        </div>

        <div
          className={
            delta
              ? delta.improved
                ? 'field-compare__col field-compare__col--delta field-compare__col--up'
                : delta.unchanged
                  ? 'field-compare__col field-compare__col--delta'
                  : 'field-compare__col field-compare__col--delta field-compare__col--down'
              : 'field-compare__col field-compare__col--delta field-compare__col--first'
          }
        >
          <h4>Delta</h4>
          {delta ? (
            <>
              <p className="field-compare__delta-summary">{delta.summary}</p>
              <dl>
                <div>
                  <dt>Catalog</dt>
                  <dd>
                    {delta.prior.catalogScore} → <strong>{delta.current.catalogScore}</strong>
                    <span className="field-compare__vs"> ({fmtDelta(delta.catalogScore, ' pts')})</span>
                  </dd>
                </div>
                <div>
                  <dt>Scrape GTIN</dt>
                  <dd>
                    {delta.prior.gtinPct}% → <strong>{delta.current.gtinPct}%</strong>
                    <span className="field-compare__vs"> ({fmtDelta(delta.gtinPct, 'pp')})</span>
                  </dd>
                </div>
                <div>
                  <dt>SKUs</dt>
                  <dd>
                    {delta.prior.productCount} → <strong>{delta.current.productCount}</strong>
                  </dd>
                </div>
              </dl>
            </>
          ) : (
            <p className="field-compare__first">
              First audit on this host. Fix identifiers or feed reach, then re-audit for a before/after
              receipt.
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}
