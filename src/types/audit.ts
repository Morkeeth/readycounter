/** How we ingested this store — drives which readiness lines are observable. */
export type AuditSource = 'builtin' | 'import' | 'url-crawl' | 'shopify-admin';

/** Whether a line was measured from live data, inferred, or not observable yet. */
export type AuditConfidence = 'observed' | 'inferred' | 'unknown';

export interface PolicySmokeResult {
  privacyUrl: string | null;
  termsUrl: string | null;
  privacyOk: boolean | null;
  termsOk: boolean | null;
  /** Honest note when URLs missing or crawl blocked policy fetch. */
  note?: string;
}

export interface StoreAuditSignals {
  productsJson: boolean;
  jsonLdBlocks: number;
  gtinCoverage: number;
  captchaHints: boolean;
  accountWallHints: boolean;
  checkoutProbed: boolean;
  /** % Product JSON-LD nodes with Offer+price (+availability when present). Null when no JSON-LD products. */
  offerPct?: number | null;
  offerSampleSize?: number;
  policySmoke?: PolicySmokeResult;
}

export interface StoreAuditMeta {
  source: AuditSource;
  url?: string;
  method?: 'json-ld' | 'shopify-products-json' | 'none';
  fetchedAt: string;
  productCount: number;
  signals: StoreAuditSignals;
}

export interface AuditScoreSummary {
  /** Score over lines we could actually observe. */
  catalogScore: number;
  catalogBudget: number;
  /** Full sandbox score if all lines were measurable (demo stores). */
  fullScore: number;
  fullBudget: number;
  /** Lines waiting on checkout probe / OAuth / merchant attestation. */
  unmeasuredLineIds: string[];
}
