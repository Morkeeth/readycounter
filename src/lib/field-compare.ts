import type { RankingsResponse } from '../api/client';
import { FIELD_RECEIPT } from '../data/field-companion';
import { ucpCensusMeta } from './ucp-census';
import {
  CRAWL_OUTCOME_ORDER,
  crawlOutcome,
  type CrawlOutcome,
} from './crawl-failure';
import type { Product } from '../types/commerce';
import { catalogLegibility } from './catalogSchema';

export interface FieldBatchStats {
  attempted: number;
  crawled: number;
  crawlRatePct: number;
  avgGtinPct: number;
  avgCatalogScore: number;
  catalogBudget: number;
  ucpAvailable: number;
  ucpGtinGaps: number;
  asOf: string | null;
  live: boolean;
  outcomeWidths: Array<{ outcome: CrawlOutcome; count: number; pct: number }>;
}

export interface StoreCompareRow {
  id: string;
  label: string;
  yours: string;
  field: string;
  /** When true, your value beats the field on this axis. */
  youAhead?: boolean;
  /** When true, field is worse — urgency signal. */
  urgent?: boolean;
}

export function scrapeGtinPct(products: Product[]): number {
  if (products.length === 0) return 0;
  return Math.round((products.filter((p) => p.gtin).length / products.length) * 100);
}

export function deriveFieldBatchStats(rankings: RankingsResponse | null): FieldBatchStats {
  const attempted = rankings?.shopCount ?? FIELD_RECEIPT.attempted;
  const crawled = rankings?.succeeded ?? FIELD_RECEIPT.crawled;
  const crawlRatePct = attempted === 0 ? 0 : Math.round((crawled / attempted) * 100);
  const avgGtinPct = rankings?.avgGtinPct ?? FIELD_RECEIPT.gtinPctOnCrawled;
  const avgCatalogScore = rankings?.avgCatalogScore ?? 0;
  const catalogBudget = 24;
  const ucpMeta = ucpCensusMeta();
  const ucpAvailable = rankings?.ucp?.available ?? ucpMeta.ucpAvailable;
  const ucpGtinGaps =
    rankings?.ucp?.gtinWhereCrawlZero ?? FIELD_RECEIPT.ucpGtinWhereCrawlZero;

  const rows = rankings?.rows ?? [];
  const outcomeCounts = new Map<CrawlOutcome, number>();
  for (const key of CRAWL_OUTCOME_ORDER) outcomeCounts.set(key, 0);
  for (const row of rows) {
    const key = crawlOutcome(row.error);
    outcomeCounts.set(key, (outcomeCounts.get(key) ?? 0) + 1);
  }
  const totalForWidths = rows.length || attempted;
  const outcomeWidths = CRAWL_OUTCOME_ORDER.map((outcome) => {
    const count = outcomeCounts.get(outcome) ?? 0;
    return {
      outcome,
      count,
      pct: totalForWidths === 0 ? 0 : Math.round((count / totalForWidths) * 100),
    };
  }).filter((w) => w.count > 0);

  return {
    attempted,
    crawled,
    crawlRatePct,
    avgGtinPct,
    avgCatalogScore,
    catalogBudget,
    ucpAvailable,
    ucpGtinGaps,
    asOf: rankings?.at ?? FIELD_RECEIPT.updated,
    live: !!rankings?.shopCount,
    outcomeWidths,
  };
}

export function buildCompareRows(input: {
  score: number;
  pageStructureEarned: number;
  pageStructureMax: number;
  products: Product[];
  storeName: string;
  field: FieldBatchStats;
}): StoreCompareRow[] {
  const leg = catalogLegibility(input.storeName, input.products);
  const yoursGtin = scrapeGtinPct(input.products);
  const yoursCatalog = `${input.pageStructureEarned}/${input.pageStructureMax}`;
  const fieldCatalog = `${input.field.avgCatalogScore}/${input.field.catalogBudget}`;

  return [
    {
      id: 'readiness',
      label: 'Agent readiness',
      yours: `${input.score}/100`,
      field: `catalog avg ${fieldCatalog} on crawled`,
      youAhead: input.score > input.field.avgCatalogScore,
    },
    {
      id: 'catalog',
      label: 'Catalog legibility',
      yours: `${leg.legible}/${leg.total} SKUs · ${yoursCatalog} pts`,
      field: `${fieldCatalog} avg · ${input.field.avgGtinPct}% scrape GTIN`,
      youAhead: leg.legible > 0 && input.field.avgCatalogScore === 0,
    },
    {
      id: 'gtin',
      label: 'Scrape GTIN',
      yours: `${yoursGtin}%`,
      field: `${input.field.avgGtinPct}%`,
      youAhead: yoursGtin > input.field.avgGtinPct,
      urgent: input.field.avgGtinPct === 0,
    },
    {
      id: 'crawl',
      label: 'Crawl reach',
      yours: 'sandbox (always reachable)',
      field: `${input.field.crawled}/${input.field.attempted} (${input.field.crawlRatePct}%)`,
      urgent: input.field.crawlRatePct < 60,
    },
    {
      id: 'ucp',
      label: 'UCP Catalog MCP',
      yours: 'not measured on sandbox',
      field: `${input.field.ucpAvailable}/${input.field.attempted} live · ${input.field.ucpGtinGaps} GTIN where scrape empty`,
      urgent: input.field.ucpGtinGaps > 0,
    },
  ];
}
