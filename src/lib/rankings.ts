import { listCuratedVerticals, verticalForUrl } from '../data/curated-verticals';
import type { AuditBatchSummary } from '../server/render-partnership';
import { ucpCensusMeta, ucpForUrl } from './ucp-census';

export type RankingsSort = 'catalogScore' | 'gtinPct' | 'ucpGtinPct' | 'url';

export type RankingsRow = AuditBatchSummary['rows'][number] & {
  vertical?: string;
  ucpAvailable?: boolean | null;
  ucpGtinPct?: number | null;
  ucpProducts?: number | null;
  ucpGtinWhereCrawlZero?: boolean;
};

export interface RankingsResponse {
  ok: true;
  at: string | null;
  shopCount: number;
  succeeded: number;
  avgCatalogScore: number;
  avgGtinPct: number;
  avgOfferPct?: number | null;
  note: string;
  verticals: string[];
  ucp: {
    at: string;
    available: number;
    withGtin: number;
    gtinWhereCrawlZero: number;
  };
  rows: RankingsRow[];
}

export function sortRankingRows(rows: RankingsRow[], sort: RankingsSort = 'catalogScore'): RankingsRow[] {
  return [...rows].sort((a, b) => {
    if (a.error && !b.error) return 1;
    if (!a.error && b.error) return -1;
    if (a.error && b.error) return a.url.localeCompare(b.url);
    if (sort === 'gtinPct') return (b.gtinPct ?? 0) - (a.gtinPct ?? 0);
    if (sort === 'ucpGtinPct') return (b.ucpGtinPct ?? 0) - (a.ucpGtinPct ?? 0);
    if (sort === 'url') return a.url.localeCompare(b.url);
    return (b.catalogScore ?? 0) - (a.catalogScore ?? 0);
  });
}

export function enrichRowsWithVerticalsAndUcp(rows: AuditBatchSummary['rows']): RankingsRow[] {
  return rows.map((row) => {
    const ucp = ucpForUrl(row.url, row);
    return {
      ...row,
      vertical: verticalForUrl(row.url),
      ucpAvailable: ucp.ucpAvailable,
      ucpGtinPct: ucp.ucpGtinPct,
      ucpProducts: ucp.ucpProducts,
      ucpGtinWhereCrawlZero: ucp.ucpGtinWhereCrawlZero,
    };
  });
}

export function buildRankingsResponse(batch: AuditBatchSummary | null): RankingsResponse {
  const meta = ucpCensusMeta();
  if (!batch) {
    return {
      ok: true,
      at: null,
      shopCount: 0,
      succeeded: 0,
      avgCatalogScore: 0,
      avgGtinPct: 0,
      note: 'No batch on Render KV yet. Run npm run audit:batch -- --publish.',
      verticals: listCuratedVerticals(),
      ucp: { at: meta.at, available: meta.ucpAvailable, withGtin: meta.ucpWithGtin, gtinWhereCrawlZero: 0 },
      rows: [],
    };
  }
  const rows = sortRankingRows(enrichRowsWithVerticalsAndUcp(batch.rows));
  const gtinWhereCrawlZero = rows.filter((r) => r.ucpGtinWhereCrawlZero).length;
  const withOffer = rows.filter((r) => !r.error && r.offerPct != null);
  const avgOffer =
    withOffer.length === 0
      ? null
      : Math.round(withOffer.reduce((n, r) => n + (r.offerPct ?? 0), 0) / withOffer.length);
  return {
    ok: true,
    at: batch.at,
    shopCount: batch.shopCount,
    succeeded: batch.succeeded,
    avgCatalogScore: batch.avgCatalogScore,
    avgGtinPct: batch.avgGtinPct,
    avgOfferPct: batch.avgOfferPct ?? avgOffer,
    note: 'Crawl + UCP census joined — public scrape GTIN ≠ Catalog MCP GTIN. Checkout lines still NOT MEASURED.',
    verticals: listCuratedVerticals(),
    ucp: {
      at: meta.at,
      available: meta.ucpAvailable,
      withGtin: meta.ucpWithGtin,
      gtinWhereCrawlZero,
    },
    rows,
  };
}
