import { reviewAgainstField } from '../data/field-companion';
import { validateStoreCatalog } from '../integrations/shopify-catalog';
import { computeReadinessChecks, readinessScore } from './readiness';
import { getStore } from '../data/stores';
import { WEBMCP_TOOL_COUNT } from '../webmcp/toolManifest';
import type { PolicySmoke } from '../types/audit';

export interface ToolProbeResult {
  tool: string;
  request: string;
  pass: boolean;
  detail: string;
  notMeasured?: boolean;
}

export interface StrangerProbeInput {
  url: string;
  auditOk: boolean;
  productCount: number;
  catalogScore: number;
  catalogBudget: number;
  gtinPct: number;
  offerPct: number | null;
  policySmoke?: PolicySmoke;
  storeId: string;
  isFieldCrawl: boolean;
  crawlMethod?: string;
  error?: string;
}

/** Eight probes a merchant can hand to their developer — exact request + PASS/FAIL. */
export function runStrangerProbes(input: StrangerProbeInput): ToolProbeResult[] {
  const store = getStore(input.storeId);
  const products = store.products;
  const merchant = store.merchant;
  const probes: ToolProbeResult[] = [];

  probes.push({
    tool: 'audit_url',
    request: `POST /api/v1/audit/url ${JSON.stringify({ url: input.url })}`,
    pass: input.auditOk && input.productCount > 0,
    detail: input.auditOk
      ? `${input.productCount} SKUs via ${input.crawlMethod ?? 'crawl'}`
      : input.error ?? 'crawl failed',
  });

  const feed = validateStoreCatalog(input.storeId);
  probes.push({
    tool: 'validate_catalog_feed',
    request: 'validate_catalog_feed({})',
    pass: feed.ok,
    detail: feed.ok ? 'GTIN · variants · prices OK' : `${feed.issues.length} feed issue(s)`,
  });

  const checks = computeReadinessChecks(merchant, WEBMCP_TOOL_COUNT, products);
  const score = input.isFieldCrawl ? input.catalogScore : readinessScore(checks);
  probes.push({
    tool: 'get_readiness_score',
    request: 'get_readiness_score({})',
    pass: input.isFieldCrawl ? input.catalogScore > 0 : score >= 50,
    detail: input.isFieldCrawl
      ? `${input.catalogScore}/${input.catalogBudget} catalog pts (field — not full /100)`
      : `${score}/100`,
  });

  const review = reviewAgainstField({
    gtinPct: input.gtinPct,
    catalogScore: input.catalogScore,
    productsJsonOk: input.productCount > 0,
    captchaHint: false,
    accountWall: false,
    error: input.auditOk ? undefined : input.error,
  });
  probes.push({
    tool: 'review_against_field',
    request: `review_against_field({ gtinPct: ${input.gtinPct}, catalogScore: ${input.catalogScore} })`,
    pass: review.nextSteps.length > 0 || review.flags.length > 0 || input.auditOk,
    detail:
      review.flags.length > 0
        ? `${review.flags.length} handbook flag(s)`
        : review.nextSteps.length > 0
          ? `${review.nextSteps.length} next step(s)`
          : 'no flags from crawl signals',
  });

  const inStock = products.filter((p) => p.inStock);
  probes.push({
    tool: 'search_catalog',
    request: 'search_catalog({ in_stock_only: true })',
    pass: inStock.length > 0,
    detail: `${inStock.length} in-stock SKU(s)`,
  });

  probes.push({
    tool: 'get_merchant_config',
    request: 'get_merchant_config({})',
    pass: true,
    notMeasured: input.isFieldCrawl,
    detail: input.isFieldCrawl
      ? 'NOT MEASURED — URL crawl cannot see checkout walls'
      : `captcha=${merchant.checkoutRequiresCaptcha} account=${merchant.checkoutRequiresAccount}`,
  });

  probes.push({
    tool: 'prepare_checkout',
    request: 'prepare_checkout({ actor: "agent" })',
    pass: !input.isFieldCrawl && !merchant.checkoutRequiresCaptcha && !merchant.checkoutRequiresAccount,
    notMeasured: input.isFieldCrawl,
    detail: input.isFieldCrawl
      ? 'NOT MEASURED — checkout path needs OAuth or sandbox'
      : merchant.checkoutRequiresCaptcha
        ? 'blocked: CAPTCHA'
        : merchant.checkoutRequiresAccount
          ? 'blocked: account wall'
          : 'agent path clear (no charge)',
  });

  const offerOk = input.offerPct != null && input.offerPct > 0;
  const privacyOk = input.policySmoke?.privacyOk === true;
  const termsOk = input.policySmoke?.termsOk === true;
  probes.push({
    tool: 'get_field_companion',
    request: 'get_field_companion({ topic: "gtin-gap" })',
    pass: input.gtinPct > 0 || offerOk || (privacyOk && termsOk) || input.isFieldCrawl,
    detail:
      input.gtinPct > 0
        ? `scrape GTIN ${input.gtinPct}%`
        : offerOk
          ? `Offer JSON-LD ${input.offerPct}%`
          : `policies privacy=${privacyOk ? 'ok' : '—'} terms=${termsOk ? 'ok' : '—'}`,
  });

  return probes;
}
