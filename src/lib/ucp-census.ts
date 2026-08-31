import ucpCensus from '../data/ucp-census.json' with { type: 'json' };

export interface UcpCensusRow {
  url: string;
  available: boolean;
  gtinPct: number;
  productCount: number;
}

export interface UcpJoinFields {
  ucpAvailable: boolean | null;
  ucpGtinPct: number | null;
  ucpProducts: number | null;
  /** Protocol has identifiers while public crawl shows 0% (or failed before GTIN). */
  ucpGtinWhereCrawlZero: boolean;
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

const byHost = new Map<string, UcpCensusRow>();
for (const row of ucpCensus.rows as UcpCensusRow[]) {
  byHost.set(hostOf(row.url), row);
}

export function ucpCensusMeta(): { at: string; ucpAvailable: number; ucpWithGtin: number } {
  return {
    at: ucpCensus.at,
    ucpAvailable: ucpCensus.ucpAvailable,
    ucpWithGtin: ucpCensus.ucpWithGtin,
  };
}

export function ucpForUrl(
  url: string,
  crawl: { gtinPct?: number; error?: string } | null,
): UcpJoinFields {
  const row = byHost.get(hostOf(url));
  if (!row) {
    return {
      ucpAvailable: null,
      ucpGtinPct: null,
      ucpProducts: null,
      ucpGtinWhereCrawlZero: false,
    };
  }
  const crawlZero =
    !crawl?.error && typeof crawl?.gtinPct === 'number' ? crawl.gtinPct === 0 : false;
  return {
    ucpAvailable: row.available,
    ucpGtinPct: row.available ? row.gtinPct : null,
    ucpProducts: row.available ? row.productCount : null,
    ucpGtinWhereCrawlZero: Boolean(row.available && row.gtinPct > 0 && crawlZero),
  };
}
