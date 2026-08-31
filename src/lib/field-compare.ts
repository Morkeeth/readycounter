import { verticalForUrl } from '../data/curated-verticals';
import { hostOfUrl } from './audit-delta';
import { ucpForUrl } from './ucp-census';
import type { RankingsRow } from './rankings';

export interface FieldCompareInput {
  url: string;
  catalogScore: number;
  catalogBudget: number;
  gtinPct: number;
  productCount: number;
}

export interface FieldBatchMeta {
  shopCount: number;
  succeeded: number;
  avgCatalogScore: number;
  avgGtinPct: number;
}

export interface FieldCompareResult {
  host: string;
  vertical: string;
  inBatch: boolean;
  /** 1 = best catalog in peer set */
  catalogRank: number | null;
  catalogPeerCount: number;
  catalogPercentile: number | null;
  gtinPercentile: number | null;
  fieldAvgCatalog: number;
  fieldAvgGtin: number;
  fieldCrawled: number;
  fieldAttempted: number;
  verticalAvgCatalog: number | null;
  verticalAvgGtin: number | null;
  verticalPeerCount: number;
  ucpAvailable: boolean | null;
  ucpGtinPct: number | null;
  ucpGtinWhereCrawlZero: boolean;
  vsFieldCatalog: number;
  vsFieldGtin: number;
  rankingsFilter: { vertical: string; ucpFilter: 'all' | 'ucp-gtin-gap' };
  receiptLine: string;
  deepLink: string;
}

function crawledRows(rows: RankingsRow[]): RankingsRow[] {
  return rows.filter((r) => !r.error);
}

function percentileBelow(values: number[], value: number): number | null {
  if (values.length === 0) return null;
  const below = values.filter((v) => v < value).length;
  return Math.round((below / values.length) * 100);
}

function rankDesc(values: { score: number; host: string }[], host: string, score: number): number {
  const sorted = [...values].sort((a, b) => b.score - a.score || a.host.localeCompare(b.host));
  const idx = sorted.findIndex((v) => v.host === host);
  if (idx >= 0) return idx + 1;
  let rank = 1;
  for (const v of sorted) {
    if (v.score > score || (v.score === score && v.host < host)) rank += 1;
  }
  return rank;
}

function avg(nums: number[]): number {
  if (!nums.length) return 0;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

export function buildAuditDeepLink(url: string): string {
  const base = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';
  const params = new URLSearchParams();
  params.set('view', 'integrations');
  params.set('audit_url', url.trim());
  return `${base}?${params.toString()}`;
}

export function compareToField(
  input: FieldCompareInput,
  rows: RankingsRow[],
  meta: FieldBatchMeta,
): FieldCompareResult {
  const host = hostOfUrl(input.url);
  const vertical = verticalForUrl(input.url);
  const crawled = crawledRows(rows);
  const verticalPeers = crawled.filter((r) => (r.vertical ?? verticalForUrl(r.url)) === vertical);
  const peerSet = verticalPeers.length >= 5 ? verticalPeers : crawled;
  const batchRow = rows.find((r) => hostOfUrl(r.url) === host);
  const ucp = ucpForUrl(input.url, batchRow ?? { gtinPct: input.gtinPct });

  const catalogScores = peerSet.map((r) => r.catalogScore ?? 0);
  const gtinPcts = peerSet.map((r) => r.gtinPct ?? 0);
  const peerHosts = peerSet.map((r) => ({
    host: hostOfUrl(r.url),
    score: r.catalogScore ?? 0,
  }));

  const catalogPercentile = percentileBelow(catalogScores, input.catalogScore);
  const gtinPercentile = percentileBelow(gtinPcts, input.gtinPct);
  const catalogRank = peerSet.length ? rankDesc(peerHosts, host, input.catalogScore) : null;

  const fieldAvgCatalog = meta.avgCatalogScore;
  const fieldAvgGtin = meta.avgGtinPct;
  const verticalAvgCatalog = verticalPeers.length ? avg(verticalPeers.map((r) => r.catalogScore ?? 0)) : null;
  const verticalAvgGtin = verticalPeers.length ? avg(verticalPeers.map((r) => r.gtinPct ?? 0)) : null;

  const ucpFilter: 'all' | 'ucp-gtin-gap' = ucp.ucpGtinWhereCrawlZero ? 'ucp-gtin-gap' : 'all';

  const peerLabel =
    peerSet === verticalPeers && verticalPeers.length >= 5 ? `${vertical} vertical` : 'full field';
  const pctLabel =
    catalogPercentile != null
      ? catalogPercentile >= 50
        ? `top ${100 - catalogPercentile}% catalog vs ${peerLabel}`
        : `bottom ${catalogPercentile === 0 ? 1 : catalogPercentile}% catalog vs ${peerLabel}`
      : 'no field peers yet';

  const receiptLine = [
    host,
    `catalog ${input.catalogScore}/${input.catalogBudget}`,
    `scrape GTIN ${input.gtinPct}%`,
    pctLabel,
    `field ${fieldAvgGtin}% GTIN · ${meta.succeeded}/${meta.shopCount} crawled`,
    ucp.ucpGtinWhereCrawlZero ? 'UCP GTIN gap' : null,
    'ReadyCounter',
  ]
    .filter(Boolean)
    .join(' · ');

  return {
    host,
    vertical,
    inBatch: Boolean(batchRow && !batchRow.error),
    catalogRank,
    catalogPeerCount: peerSet.length,
    catalogPercentile,
    gtinPercentile,
    fieldAvgCatalog,
    fieldAvgGtin,
    fieldCrawled: meta.succeeded,
    fieldAttempted: meta.shopCount,
    verticalAvgCatalog,
    verticalAvgGtin,
    verticalPeerCount: verticalPeers.length,
    ucpAvailable: ucp.ucpAvailable,
    ucpGtinPct: ucp.ucpGtinPct,
    ucpGtinWhereCrawlZero: ucp.ucpGtinWhereCrawlZero,
    vsFieldCatalog: input.catalogScore - fieldAvgCatalog,
    vsFieldGtin: input.gtinPct - fieldAvgGtin,
    rankingsFilter: { vertical, ucpFilter },
    receiptLine,
    deepLink: buildAuditDeepLink(input.url),
  };
}
