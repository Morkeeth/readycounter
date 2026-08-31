import { useEffect, useMemo, useState } from 'react';
import { apiRankings, type RankingsResponse } from '../api/client';
import { listCuratedVerticals, verticalForUrl } from '../data/curated-verticals';
import {
  CRAWL_OUTCOME_LABEL,
  CRAWL_OUTCOME_ORDER,
  crawlOutcome,
  type CrawlOutcome,
} from '../lib/crawl-failure';

type VerticalFilter = 'all' | string;
type OutcomeFilter = 'all' | CrawlOutcome;

export function RankingsPanel() {
  const [data, setData] = useState<RankingsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [vertical, setVertical] = useState<VerticalFilter>('all');
  const [outcome, setOutcome] = useState<OutcomeFilter>('all');

  useEffect(() => {
    void apiRankings()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const rows = useMemo(() => {
    const raw = data?.rows ?? [];
    return raw.map((row) => ({
      ...row,
      vertical: row.vertical ?? verticalForUrl(row.url),
      outcome: crawlOutcome(row.error),
    }));
  }, [data]);

  const verticals = useMemo(() => {
    const fromApi = data?.verticals?.length ? data.verticals : listCuratedVerticals();
    const present = new Set(rows.map((r) => r.vertical));
    return fromApi.filter((v) => present.has(v));
  }, [data, rows]);

  const outcomeCounts = useMemo(() => {
    const counts = new Map<CrawlOutcome, number>();
    for (const r of rows) counts.set(r.outcome, (counts.get(r.outcome) ?? 0) + 1);
    return counts;
  }, [rows]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (vertical !== 'all' && r.vertical !== vertical) return false;
      if (outcome !== 'all' && r.outcome !== outcome) return false;
      return true;
    });
  }, [rows, vertical, outcome]);

  const filterStats = useMemo(() => {
    const crawled = filtered.filter((r) => !r.error);
    const avgGtin =
      crawled.length === 0
        ? 0
        : Math.round(crawled.reduce((a, r) => a + (r.gtinPct ?? 0), 0) / crawled.length);
    return { n: filtered.length, crawled: crawled.length, avgGtin };
  }, [filtered]);

  return (
    <article className="rankings integrations__card integrations__card--wide">
      <header className="rankings__header">
        <h3>DTC rankings — field batch</h3>
        <p className="integrations__muted">
          {loading
            ? 'Loading from Render KV…'
            : data?.at
              ? `Batch ${data.succeeded}/${data.shopCount} shops · avg catalog ${data.avgCatalogScore} · avg GTIN ${data.avgGtinPct}% · ${new Date(data.at).toLocaleDateString()}`
              : 'No batch published yet'}
        </p>
      </header>
      {data?.note ? <p className="rankings__note">{data.note}</p> : null}

      {rows.length > 0 ? (
        <>
          <p className="rankings__filter-label">Vertical</p>
          <div className="rankings__filters" role="tablist" aria-label="Filter by vertical">
            <button
              type="button"
              role="tab"
              aria-selected={vertical === 'all'}
              className={vertical === 'all' ? 'rankings__chip rankings__chip--on' : 'rankings__chip'}
              onClick={() => setVertical('all')}
            >
              all · {rows.length}
            </button>
            {verticals.map((v) => {
              const count = rows.filter((r) => r.vertical === v).length;
              if (!count) return null;
              return (
                <button
                  key={v}
                  type="button"
                  role="tab"
                  aria-selected={vertical === v}
                  className={vertical === v ? 'rankings__chip rankings__chip--on' : 'rankings__chip'}
                  onClick={() => setVertical(v)}
                >
                  {v} · {count}
                </button>
              );
            })}
          </div>

          <p className="rankings__filter-label">Outcome</p>
          <div className="rankings__filters" role="tablist" aria-label="Filter by crawl outcome">
            <button
              type="button"
              role="tab"
              aria-selected={outcome === 'all'}
              className={outcome === 'all' ? 'rankings__chip rankings__chip--on' : 'rankings__chip'}
              onClick={() => setOutcome('all')}
            >
              all · {rows.length}
            </button>
            {CRAWL_OUTCOME_ORDER.map((key) => {
              const count = outcomeCounts.get(key) ?? 0;
              if (!count) return null;
              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={outcome === key}
                  className={outcome === key ? 'rankings__chip rankings__chip--on' : 'rankings__chip'}
                  onClick={() => setOutcome(key)}
                >
                  {CRAWL_OUTCOME_LABEL[key]} · {count}
                </button>
              );
            })}
          </div>
        </>
      ) : null}

      {!loading && (vertical !== 'all' || outcome !== 'all') ? (
        <p className="rankings__filter-stat">
          {[vertical !== 'all' ? vertical : null, outcome !== 'all' ? CRAWL_OUTCOME_LABEL[outcome] : null]
            .filter(Boolean)
            .join(' · ')}
          : {filterStats.crawled}/{filterStats.n} crawled · avg GTIN {filterStats.avgGtin}%
        </p>
      ) : null}

      {rows.length === 0 && !loading ? (
        <p className="integrations__muted">
          Run <code>npm run audit:batch -- --publish</code> to populate rankings.
        </p>
      ) : (
        <div className="rankings__table-wrap">
          <table className="rankings__table">
            <thead>
              <tr>
                <th>#</th>
                <th>Store</th>
                <th>Vertical</th>
                <th>Outcome</th>
                <th>Catalog</th>
                <th>GTIN%</th>
                <th>Signals</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => {
                if (row.error) {
                  return (
                    <tr key={row.url} className="rankings__row--fail">
                      <td>{i + 1}</td>
                      <td>{hostname(row.url)}</td>
                      <td className="rankings__vert">{row.vertical}</td>
                      <td className="rankings__vert">{CRAWL_OUTCOME_LABEL[row.outcome]}</td>
                      <td colSpan={3} className="rankings__err">
                        {row.error.slice(0, 80)}
                      </td>
                    </tr>
                  );
                }
                return (
                  <tr key={row.url}>
                    <td>{i + 1}</td>
                    <td>
                      {row.storeId ? (
                        <a href={`/?store=${encodeURIComponent(row.storeId)}&view=merchant`}>
                          {hostname(row.url)}
                        </a>
                      ) : (
                        hostname(row.url)
                      )}
                    </td>
                    <td className="rankings__vert">{row.vertical}</td>
                    <td className="rankings__vert">{CRAWL_OUTCOME_LABEL[row.outcome]}</td>
                    <td>
                      <strong>{row.catalogScore ?? '—'}</strong>
                      {row.catalogBudget ? `/${row.catalogBudget}` : ''}
                    </td>
                    <td>{row.gtinPct ?? 0}%</td>
                    <td className="rankings__sig">
                      {[row.captchaHint ? 'captcha?' : '', (row.gtinPct ?? 0) < 50 ? 'low-gtin' : '']
                        .filter(Boolean)
                        .join(' · ') || '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="integrations__muted">
        <code>GET /api/v1/rankings</code> · no-feed ≈ headless/empty public catalog · see{' '}
        <code>research/HANDBOOK.md</code>
      </p>
    </article>
  );
}

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
