/** How we ingested this store — drives which readiness lines are observable. */
export type AuditSource = 'builtin' | 'import' | 'url-crawl' | 'shopify-admin';

/** Whether a line was measured from live data, inferred, or not observable yet. */
export type AuditConfidence = 'observed' | 'inferred' | 'unknown';

export interface PolicySmokeResult {
  privacyOk: boolean | null;
  termsOk: boolean | null;
  measured: boolean;
  urls: { privacy?: string; terms?: string };
}

export interface StoreAuditSignals {
  productsJson: boolean;
  jsonLdBlocks: number;
  gtinCoverage: number;
  /** % of sampled Product JSON-LD nodes or feed rows with Offer + price + availability. */
  offerCoverage: number;
  captchaHints: boolean;
  accountWallHints: boolean;
  checkoutProbed: boolean;
}

export interface StoreAuditMeta {
  source: AuditSource;
  url?: string;
  method?: 'json-ld' | 'shopify-products-json' | 'none';
  fetchedAt: string;
  productCount: number;
  signals: StoreAuditSignals;
  policySmoke?: PolicySmokeResult;
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
