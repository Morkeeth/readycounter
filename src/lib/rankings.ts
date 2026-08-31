import { listCuratedVerticals, verticalForUrl } from '../data/curated-verticals';
import type { AuditBatchSummary } from '../server/render-partnership';

export type RankingsSort = 'catalogScore' | 'gtinPct' | 'url';

export type RankingsRow = AuditBatchSummary['rows'][number] & { vertical?: string };

export interface RankingsResponse {
  ok: true;
  at: string | null;
  shopCount: number;
  succeeded: number;
  avgCatalogScore: number;
  avgGtinPct: number;
  note: string;
  verticals: string[];
  rows: RankingsRow[];
}

export function sortRankingRows(rows: RankingsRow[], sort: RankingsSort = 'catalogScore'): RankingsRow[] {
  return [...rows].sort((a, b) => {
    if (a.error && !b.error) return 1;
    if (!a.error && b.error) return -1;
    if (a.error && b.error) return a.url.localeCompare(b.url);
    if (sort === 'gtinPct') return (b.gtinPct ?? 0) - (a.gtinPct ?? 0);
    if (sort === 'url') return a.url.localeCompare(b.url);
    return (b.catalogScore ?? 0) - (a.catalogScore ?? 0);
  });
}

export function enrichRowsWithVerticals(rows: AuditBatchSummary['rows']): RankingsRow[] {
  return rows.map((row) => ({ ...row, vertical: verticalForUrl(row.url) }));
}

export function buildRankingsResponse(batch: AuditBatchSummary | null): RankingsResponse {
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
      rows: [],
    };
  }
  return {
    ok: true,
    at: batch.at,
    shopCount: batch.shopCount,
    succeeded: batch.succeeded,
    avgCatalogScore: batch.avgCatalogScore,
    avgGtinPct: batch.avgGtinPct,
    note: 'Catalog crawl scores only — checkout lines NOT MEASURED until OAuth or agent journey.',
    verticals: listCuratedVerticals(),
    rows: sortRankingRows(enrichRowsWithVerticals(batch.rows)),
  };
}
