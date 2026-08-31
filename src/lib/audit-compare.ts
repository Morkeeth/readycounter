import type { MerchantConfig, Product } from '../types/commerce';
import type { AuditScoreSummary, StoreAuditMeta } from '../types/audit';
import type { UcpProbeSnapshot } from '../server/ucp-probe';
import { computeAuditFindings } from './audit-findings';
import { WEBMCP_TOOL_COUNT } from '../webmcp/toolManifest';

export interface AuditModeSnapshot {
  source: StoreAuditMeta['source'] | 'ucp-mcp';
  label: string;
  productCount: number;
  gtinPct: number;
  catalogScore: number;
  catalogBudget: number;
  fullScore: number;
  unmeasuredLineIds: string[];
  method?: string;
  error?: string;
  tools?: string[];
  offerPct?: number | null;
}

export interface UcpCompareSnapshot {
  label: string;
  available: boolean;
  productCount: number;
  gtinPct: number;
  tools: string[];
  endpoint?: string;
  error?: string;
}

export interface AuditCompareDelta {
  catalogScore: number;
  gtinPct: number;
  productCount: number;
}

export interface AuditCompareResult {
  ok: true;
  url: string;
  shop?: string;
  crawl: AuditModeSnapshot;
  ucp?: UcpCompareSnapshot;
  oauth?: AuditModeSnapshot;
  delta?: AuditCompareDelta;
  headline: string;
}

export function ucpToCompareSnapshot(probe: UcpProbeSnapshot): UcpCompareSnapshot {
  return {
    label: 'Shopify UCP MCP',
    available: probe.available,
    productCount: probe.productCount,
    gtinPct: probe.gtinPct,
    tools: probe.tools,
    endpoint: probe.endpoint,
    error: probe.error,
  };
}

function snapshot(
  label: string,
  _merchant: MerchantConfig,
  products: Product[],
  audit: StoreAuditMeta,
  summary: AuditScoreSummary,
): AuditModeSnapshot {
  return {
    source: audit.source,
    label,
    productCount: products.length,
    gtinPct: audit.signals.gtinCoverage,
    catalogScore: summary.catalogScore,
    catalogBudget: summary.catalogBudget,
    fullScore: summary.fullScore,
    unmeasuredLineIds: summary.unmeasuredLineIds,
    method: audit.method,
    offerPct: audit.signals.offerPct,
  };
}

export function buildAuditCompare(
  url: string,
  crawl: {
    merchant: MerchantConfig;
    products: Product[];
    audit: StoreAuditMeta;
  },
  oauth?: {
    shop: string;
    merchant: MerchantConfig;
    products: Product[];
    audit: StoreAuditMeta;
  } | null,
  ucp?: UcpProbeSnapshot | null,
): AuditCompareResult {
  const crawlFindings = computeAuditFindings(
    crawl.merchant,
    crawl.products,
    crawl.audit,
    WEBMCP_TOOL_COUNT,
  );
  const crawlSnap = snapshot(
    'Public crawl',
    crawl.merchant,
    crawl.products,
    crawl.audit,
    crawlFindings.summary,
  );

  let oauthSnap: AuditModeSnapshot | undefined;
  let delta: AuditCompareDelta | undefined;
  let headline: string;

  if (oauth) {
    const oauthFindings = computeAuditFindings(
      oauth.merchant,
      oauth.products,
      oauth.audit,
      WEBMCP_TOOL_COUNT,
    );
    oauthSnap = snapshot(
      'Shopify Admin',
      oauth.merchant,
      oauth.products,
      oauth.audit,
      oauthFindings.summary,
    );
    delta = {
      catalogScore: oauthSnap.catalogScore - crawlSnap.catalogScore,
      gtinPct: oauthSnap.gtinPct - crawlSnap.gtinPct,
      productCount: oauthSnap.productCount - crawlSnap.productCount,
    };
    if (delta.gtinPct > 0 || delta.catalogScore > 0) {
      headline = `Admin API exposes ${delta.gtinPct >= 0 ? '+' : ''}${delta.gtinPct}pp GTIN and ${delta.catalogScore >= 0 ? '+' : ''}${delta.catalogScore} catalog pts vs public crawl.`;
    } else if (delta.gtinPct === 0 && delta.catalogScore === 0) {
      headline = 'Public feed matches Admin on sampled catalog legibility — gap is elsewhere (checkout, discovery).';
    } else {
      headline = 'Public crawl scored higher than Admin sample — check SKU cap or store mismatch.';
    }
  } else if (ucp?.available && ucp.gtinPct > crawlSnap.gtinPct) {
    headline = `UCP MCP: ${ucp.gtinPct}% identifier coverage vs ${crawlSnap.gtinPct}% on public crawl — agents should negotiate UCP, not scrape HTML.`;
  } else if (crawlSnap.offerPct != null && crawlSnap.offerPct < 20) {
    headline = `Offer JSON-LD on ${crawlSnap.offerPct}% of Product nodes (field ~19%) — ACP needs Offer + price + availability on PDPs.`;
  } else if (ucp && !ucp.available) {
    headline =
      crawlSnap.gtinPct === 0
        ? `Public crawl: 0% GTIN. UCP not on this store (${ucp.error ?? 'no endpoint'}). Connect OAuth for Admin catalog.`
        : `Public crawl: ${crawlSnap.gtinPct}% GTIN. UCP endpoint not live yet.`;
  } else {
    headline =
      crawlSnap.gtinPct === 0
        ? 'Public feed has 0% GTIN — connect Shopify OAuth to compare Admin catalog.'
        : `Public crawl: ${crawlSnap.gtinPct}% GTIN, ${crawlSnap.catalogScore}/${crawlSnap.catalogBudget} catalog pts.`;
  }

  return {
    ok: true,
    url,
    shop: oauth?.shop,
    crawl: crawlSnap,
    ucp: ucp ? ucpToCompareSnapshot(ucp) : undefined,
    oauth: oauthSnap,
    delta,
    headline,
  };
}
