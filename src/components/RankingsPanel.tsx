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
type UcpFilter = 'all' | 'ucp-on' | 'ucp-gtin-gap';

export interface RankingsPanelProps {
  initialVertical?: string;
  initialUcpFilter?: UcpFilter;
  highlightHost?: string;
}

export function RankingsPanel({
  initialVertical,
  initialUcpFilter,
  highlightHost,
}: RankingsPanelProps = {}) {
  const [data, setData] = useState<RankingsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [vertical, setVertical] = useState<VerticalFilter>(initialVertical ?? 'all');
  const [outcome, setOutcome] = useState<OutcomeFilter>('all');
  const [ucpFilter, setUcpFilter] = useState<UcpFilter>(initialUcpFilter ?? 'all');

  useEffect(() => {
    if (initialVertical) setVertical(initialVertical);
  }, [initialVertical]);

  useEffect(() => {
    if (initialUcpFilter) setUcpFilter(initialUcpFilter);
  }, [initialUcpFilter]);

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

  const ucpOnCount = useMemo(() => rows.filter((r) => r.ucpAvailable).length, [rows]);
  const ucpGapCount = useMemo(
    () => rows.filter((r) => r.ucpGtinWhereCrawlZero).length,
    [rows],
  );

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (vertical !== 'all' && r.vertical !== vertical) return false;
      if (outcome !== 'all' && r.outcome !== outcome) return false;
      if (ucpFilter === 'ucp-on' && !r.ucpAvailable) return false;
      if (ucpFilter === 'ucp-gtin-gap' && !r.ucpGtinWhereCrawlZero) return false;
      return true;
    });
  }, [rows, vertical, outcome, ucpFilter]);

  const filterStats = useMemo(() => {
    const crawled = filtered.filter((r) => !r.error);
    const avgGtin =
      crawled.length === 0
        ? 0
        : Math.round(crawled.reduce((a, r) => a + (r.gtinPct ?? 0), 0) / crawled.length);
    const withUcp = filtered.filter((r) => r.ucpAvailable);
    const avgUcp =
      withUcp.length === 0
        ? null
        : Math.round(
            withUcp.reduce((a, r) => a + (r.ucpGtinPct ?? 0), 0) / withUcp.length,
          );
    return {
      n: filtered.length,
      crawled: crawled.length,
      avgGtin,
      ucpOn: withUcp.length,
      avgUcp,
      gap: filtered.filter((r) => r.ucpGtinWhereCrawlZero).length,
    };
  }, [filtered]);

  const filtersActive = vertical !== 'all' || outcome !== 'all' || ucpFilter !== 'all';

  return (
    <article
      id="rankings-panel"
      className="rankings integrations__card integrations__card--wide"
    >
      <header className="rankings__header">
        <h3>DTC rankings — field batch</h3>
        <p className="integrations__muted">
          {loading
            ? 'Loading from Render KV…'
            : data?.at
              ? `Batch ${data.succeeded}/${data.shopCount} shops · avg catalog ${data.avgCatalogScore} · scrape GTIN ${data.avgGtinPct}% · UCP ${data.ucp?.available ?? '—'} live${
                  data.ucp?.gtinWhereCrawlZero
                    ? ` · ${data.ucp.gtinWhereCrawlZero} with UCP GTIN where scrape is empty`
                    : ''
                } · ${new Date(data.at).toLocaleDateString()}`
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

          <p className="rankings__filter-label">UCP (Catalog MCP)</p>
          <div className="rankings__filters" role="tablist" aria-label="Filter by UCP">
            <button
              type="button"
              role="tab"
              aria-selected={ucpFilter === 'all'}
              className={ucpFilter === 'all' ? 'rankings__chip rankings__chip--on' : 'rankings__chip'}
              onClick={() => setUcpFilter('all')}
            >
              all · {rows.length}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={ucpFilter === 'ucp-on'}
              className={
                ucpFilter === 'ucp-on' ? 'rankings__chip rankings__chip--on' : 'rankings__chip'
              }
              onClick={() => setUcpFilter('ucp-on')}
            >
              UCP live · {ucpOnCount}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={ucpFilter === 'ucp-gtin-gap'}
              className={
                ucpFilter === 'ucp-gtin-gap' ? 'rankings__chip rankings__chip--on' : 'rankings__chip'
              }
              onClick={() => setUcpFilter('ucp-gtin-gap')}
            >
              UCP GTIN · scrape empty · {ucpGapCount}
            </button>
          </div>
        </>
      ) : null}

      {!loading && filtersActive ? (
        <p className="rankings__filter-stat">
          {[
            vertical !== 'all' ? vertical : null,
            outcome !== 'all' ? CRAWL_OUTCOME_LABEL[outcome] : null,
            ucpFilter === 'ucp-on' ? 'UCP live' : null,
            ucpFilter === 'ucp-gtin-gap' ? 'UCP GTIN · scrape empty' : null,
          ]
            .filter(Boolean)
            .join(' · ')}
          : {filterStats.crawled}/{filterStats.n} crawled · scrape GTIN {filterStats.avgGtin}%
          {filterStats.avgUcp != null ? ` · UCP GTIN ${filterStats.avgUcp}%` : ''}
          {filterStats.gap ? ` · ${filterStats.gap} protocol-vs-scrape gaps` : ''}
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
                <th>Scrape GTIN</th>
                <th>Offer</th>
                <th>UCP GTIN</th>
                <th>Signals</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => {
                const ucpCell =
                  row.ucpAvailable == null
                    ? '—'
                    : row.ucpAvailable
                      ? `${row.ucpGtinPct ?? 0}%`
                      : 'off';
                const signals = [
                  row.captchaHint ? 'captcha?' : '',
                  !row.error && (row.gtinPct ?? 0) < 50 ? 'low-scrape-gtin' : '',
                  !row.error && (row.offerPct ?? 100) < 50 ? 'low-offer' : '',
                  row.policySmoke?.measurable === false ? 'policy-unmeasured' : '',
                  row.policySmoke?.measurable &&
                  (row.policySmoke.privacyOk === false || row.policySmoke.termsOk === false)
                    ? 'policy-fail'
                    : '',
                  row.ucpGtinWhereCrawlZero ? 'ucp-gtin-gap' : '',
                  row.ucpAvailable && !row.ucpGtinWhereCrawlZero && (row.ucpGtinPct ?? 0) > 0
                    ? 'ucp-gtin'
                    : '',
                ]
                  .filter(Boolean)
                  .join(' · ');

                if (row.error) {
                  return (
                    <tr key={row.url} className="rankings__row--fail">
                      <td>{i + 1}</td>
                      <td>{hostname(row.url)}</td>
                      <td className="rankings__vert">{row.vertical}</td>
                      <td className="rankings__vert">{CRAWL_OUTCOME_LABEL[row.outcome]}</td>
                      <td colSpan={3} className="rankings__err">
                        {row.error.slice(0, 72)}
                      </td>
                      <td className={row.ucpAvailable ? 'rankings__ucp' : 'rankings__err'}>
                        {ucpCell}
                      </td>
                      <td className="rankings__sig">{signals || '—'}</td>
                    </tr>
                  );
                }
                const rowHost = hostname(row.url);
                const highlighted = highlightHost && rowHost === highlightHost;
                return (
                  <tr
                    key={row.url}
                    className={[
                      row.ucpGtinWhereCrawlZero ? 'rankings__row--ucp-gap' : '',
                      highlighted ? 'rankings__row--you' : '',
                    ]
                      .filter(Boolean)
                      .join(' ') || undefined}
                  >
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
                    <td className={!row.error && (row.offerPct ?? 100) < 50 ? 'rankings__offer rankings__offer--low' : 'rankings__offer'}>
                      {row.offerPct ?? '—'}%
                    </td>
                    <td className={row.ucpGtinWhereCrawlZero ? 'rankings__ucp rankings__ucp--gap' : 'rankings__ucp'}>
                      {ucpCell}
                      {row.ucpProducts != null && row.ucpAvailable ? (
                        <span className="rankings__ucp-n"> · {row.ucpProducts}</span>
                      ) : null}
                    </td>
                    <td className="rankings__sig">{signals || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="integrations__muted">
        <code>GET /api/v1/rankings</code> joins crawl batch × committed UCP census · filter “UCP
        GTIN · scrape empty” for the protocol-vs-scrape gap · compare one store via{' '}
        <code>POST /api/v1/audit/compare</code>
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
