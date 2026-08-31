import { useEffect, useMemo, useState } from 'react';
import { apiRankings } from '../api/client';
import { FIELD_RECEIPT } from '../data/field-companion';
import { CRAWL_OUTCOME_LABEL } from '../lib/crawl-failure';
import {
  buildCompareRows,
  deriveFieldBatchStats,
  type StoreCompareRow,
} from '../lib/field-compare';
import type { Product, ReadinessCheck } from '../types/commerce';

interface LandingFieldCompareProps {
  score: number;
  checks: ReadinessCheck[];
  products: Product[];
  storeName: string;
}

function UrgencyStrip({
  field,
  headline,
}: {
  field: ReturnType<typeof deriveFieldBatchStats>;
  headline: string;
}) {
  const blocked = field.attempted - field.crawled;
  const segments = [
    {
      key: 'crawled',
      label: `${field.crawled} crawled`,
      pct: field.crawlRatePct,
      tone: 'ok' as const,
    },
    {
      key: 'blocked',
      label: `${blocked} blocked`,
      pct: field.attempted === 0 ? 0 : Math.round((blocked / field.attempted) * 100),
      tone: 'warn' as const,
    },
    {
      key: 'gtin',
      label: `${field.avgGtinPct}% scrape GTIN`,
      pct: Math.max(field.avgGtinPct, 4),
      tone: field.avgGtinPct === 0 ? ('urgent' as const) : ('ok' as const),
    },
    {
      key: 'ucp-gap',
      label: `${field.ucpGtinGaps} UCP GTIN gaps`,
      pct: field.attempted === 0 ? 0 : Math.round((field.ucpGtinGaps / field.attempted) * 100),
      tone: field.ucpGtinGaps > 0 ? ('gap' as const) : ('ok' as const),
    },
  ];

  return (
    <div className="field-compare__urgency" aria-label="Field batch urgency">
      <p className="field-compare__headline">{headline}</p>
      <div className="field-compare__strip" role="img" aria-label={`${field.attempted} curated DTC stores`}>
        {segments.map((seg) => (
          <div
            key={seg.key}
            className={`field-compare__seg field-compare__seg--${seg.tone}`}
            style={{ flexGrow: Math.max(seg.pct, 1) }}
            title={seg.label}
          >
            <span>{seg.label}</span>
          </div>
        ))}
      </div>
      <p className="field-compare__meta">
        {field.crawled}/{field.attempted} crawled · UCP {field.ucpAvailable}/{field.attempted} live
        {field.asOf ? ` · as of ${field.live ? new Date(field.asOf).toLocaleDateString() : field.asOf}` : ''}
        {field.live ? ' · live from KV' : ' · FIELD_RECEIPT fallback'}
      </p>
    </div>
  );
}

function WidthTable({ rows }: { rows: StoreCompareRow[] }) {
  return (
    <table className="field-compare__table">
      <thead>
        <tr>
          <th scope="col">Metric</th>
          <th scope="col">You (demo)</th>
          <th scope="col">Field ({FIELD_RECEIPT.attempted} brands)</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr
            key={row.id}
            className={row.urgent ? 'field-compare__row--urgent' : row.youAhead ? 'field-compare__row--ahead' : undefined}
          >
            <th scope="row">{row.label}</th>
            <td>{row.yours}</td>
            <td>{row.field}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function OutcomeWidths({ field }: { field: ReturnType<typeof deriveFieldBatchStats> }) {
  if (field.outcomeWidths.length === 0) return null;
  return (
    <div className="field-compare__outcomes">
      <p className="field-compare__outcomes-label">Crawl width — {field.attempted} curated DTC URLs</p>
      <div className="field-compare__outcome-bar">
        {field.outcomeWidths.map((w) => (
          <div
            key={w.outcome}
            className={`field-compare__outcome field-compare__outcome--${w.outcome}`}
            style={{ flexGrow: Math.max(w.pct, 1) }}
            title={`${CRAWL_OUTCOME_LABEL[w.outcome]}: ${w.count}`}
          >
            <span>{CRAWL_OUTCOME_LABEL[w.outcome]}</span>
            <b>{w.count}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LandingFieldCompare({ score, checks, products, storeName }: LandingFieldCompareProps) {
  const [rankings, setRankings] = useState<Awaited<ReturnType<typeof apiRankings>>>(null);

  useEffect(() => {
    void apiRankings().then(setRankings);
  }, []);

  const pageLine = checks.find((c) => c.id === 'page_structure');
  const pageStructureEarned = pageLine?.points ?? 0;
  const pageStructureMax = pageLine?.maxPoints ?? 6;

  const field = useMemo(() => deriveFieldBatchStats(rankings), [rankings]);
  const rows = useMemo(
    () =>
      buildCompareRows({
        score,
        pageStructureEarned,
        pageStructureMax,
        products,
        storeName,
        field,
      }),
    [score, pageStructureEarned, pageStructureMax, products, storeName, field],
  );

  const headline = FIELD_RECEIPT.headline;

  return (
    <aside className="field-compare" aria-label="148-brand field comparison">
      <p className="field-compare__kicker">Lighthouse · you vs the field</p>
      <UrgencyStrip field={field} headline={headline} />
      <WidthTable rows={rows} />
      <OutcomeWidths field={field} />
      <p className="field-compare__honesty">
        Checkout walls (CAPTCHA, account, payment) are scored on sandbox — field batch measures public
        catalog only. Paste your URL on Connect for a crawl receipt against the same {field.attempted}
        -store panel.
      </p>
    </aside>
  );
}
