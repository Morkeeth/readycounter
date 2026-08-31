/** Prior URL-audit snapshot for merchant re-measure delta receipts. */

export interface AuditSnapshot {
  url: string;
  host: string;
  at: string;
  catalogScore: number;
  catalogBudget: number;
  gtinPct: number;
  productCount: number;
  method?: string;
}

export interface AuditDelta {
  prior: AuditSnapshot;
  current: AuditSnapshot;
  catalogScore: number;
  gtinPct: number;
  productCount: number;
  improved: boolean;
  unchanged: boolean;
  summary: string;
}

const STORAGE_PREFIX = 'rc:audit-prior:';

export function hostOfUrl(url: string): string {
  try {
    return new URL(url.includes('://') ? url : `https://${url}`).hostname.replace(/^www\./, '');
  } catch {
    return url.trim().toLowerCase();
  }
}

export function storageKeyForUrl(url: string): string {
  return `${STORAGE_PREFIX}${hostOfUrl(url)}`;
}

export function loadPriorAudit(url: string): AuditSnapshot | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(storageKeyForUrl(url));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuditSnapshot;
    if (!parsed?.at || typeof parsed.catalogScore !== 'number') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function savePriorAudit(snap: AuditSnapshot): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(storageKeyForUrl(snap.url), JSON.stringify(snap));
  } catch {
    /* quota / private mode — delta is best-effort */
  }
}

export function snapshotFromAudit(input: {
  url: string;
  catalogScore: number;
  catalogBudget: number;
  gtinPct?: number;
  productCount: number;
  method?: string;
  at?: string;
}): AuditSnapshot {
  return {
    url: input.url,
    host: hostOfUrl(input.url),
    at: input.at ?? new Date().toISOString(),
    catalogScore: input.catalogScore,
    catalogBudget: input.catalogBudget,
    gtinPct: input.gtinPct ?? 0,
    productCount: input.productCount,
    method: input.method,
  };
}

function fmtDelta(n: number, unit: string): string {
  const sign = n > 0 ? '+' : '';
  return `${sign}${n}${unit}`;
}

export function computeAuditDelta(prior: AuditSnapshot, current: AuditSnapshot): AuditDelta {
  const catalogScore = current.catalogScore - prior.catalogScore;
  const gtinPct = current.gtinPct - prior.gtinPct;
  const productCount = current.productCount - prior.productCount;
  const improved = catalogScore > 0 || gtinPct > 0;
  const unchanged = catalogScore === 0 && gtinPct === 0 && productCount === 0;

  let summary: string;
  if (unchanged) {
    summary =
      'No change vs last audit on this host — catalog score, scrape GTIN%, and SKU count match.';
  } else if (improved) {
    summary = `Improved vs last audit: catalog ${fmtDelta(catalogScore, ' pts')}, scrape GTIN ${fmtDelta(gtinPct, 'pp')}, SKUs ${fmtDelta(productCount, '')}.`;
  } else {
    summary = `Changed vs last audit: catalog ${fmtDelta(catalogScore, ' pts')}, scrape GTIN ${fmtDelta(gtinPct, 'pp')}, SKUs ${fmtDelta(productCount, '')}.`;
  }

  return {
    prior,
    current,
    catalogScore,
    gtinPct,
    productCount,
    improved,
    unchanged,
    summary,
  };
}
