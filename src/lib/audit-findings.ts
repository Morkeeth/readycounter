import type { MerchantConfig, Product, ReadinessCheck } from '../types/commerce';
import type { AuditConfidence, AuditScoreSummary, AuditSource, StoreAuditMeta } from '../types/audit';
import {
  computeReadinessChecks,
  POINT_BUDGET,
  readinessScore,
  reportedLines,
  weightFor,
} from './readiness';
import { missingJsonLdFields, type JsonRecord } from './catalogSchema';
import { WEBMCP_TOOL_COUNT } from '../webmcp/toolManifest';

export interface AuditFinding extends ReadinessCheck {
  confidence: AuditConfidence;
  /** What we actually looked at. */
  evidence: string[];
}

function unknownLine(
  id: string,
  label: string,
  detail: string,
  fix: string,
  evidence: string[],
): AuditFinding {
  return {
    id,
    label,
    status: 'warn',
    detail,
    stat: 'NOT MEASURED',
    points: 0,
    maxPoints: 0,
    basis: 'reported',
    sourceIds: [],
    rationale:
      'This line prices a checkout behaviour Presenc AI names, but a URL crawl cannot see the checkout path. ReadyCounter does not invent a pass.',
    fix,
    confidence: 'unknown',
    evidence,
  };
}

/** Legibility of scraped catalog fields (products.json / JSON-LD), not our emitted ItemList. */
export function scrapedCatalogLegibility(products: Product[]): {
  total: number;
  legible: number;
  gaps: { field: string; missing: number }[];
} {
  const gapCount = new Map<string, number>();
  let legible = 0;
  for (const p of products) {
    const record: JsonRecord = {
      name: p.name,
      sku: p.id,
      ...(p.gtin ? { gtin13: p.gtin } : {}),
      offers: {
        price: p.price,
        priceCurrency: p.currency,
        availability: p.inStock ? 'InStock' : 'OutOfStock',
      },
    };
    const missing = missingJsonLdFields(record);
    if (missing.length === 0) legible += 1;
    for (const field of missing) gapCount.set(field, (gapCount.get(field) ?? 0) + 1);
  }
  return {
    total: products.length,
    legible,
    gaps: [...gapCount.entries()]
      .map(([field, missing]) => ({ field, missing }))
      .sort((a, b) => b.missing - a.missing),
  };
}

function lineFromCheck(check: ReadinessCheck, confidence: AuditConfidence, evidence: string[]): AuditFinding {
  return { ...check, confidence, evidence };
}

/**
 * Context-aware readiness: URL crawls only charge lines we observed.
 * Sandbox demo stores and Shopify Admin imports use the full model.
 */
export function computeAuditFindings(
  config: MerchantConfig,
  products: Product[],
  audit: StoreAuditMeta | undefined,
  toolCount = WEBMCP_TOOL_COUNT,
): { findings: AuditFinding[]; summary: AuditScoreSummary } {
  const source: AuditSource = audit?.source ?? 'builtin';
  const sandboxChecks = computeReadinessChecks(config, toolCount, products);
  const reported = reportedLines(toolCount);

  if (source === 'builtin' || source === 'import') {
    const findings = sandboxChecks.map((c) =>
      lineFromCheck(c, source === 'builtin' ? 'inferred' : 'observed', ['sandbox fixture or import']),
    );
    return {
      findings: [...findings, ...reported.map((c) => lineFromCheck(c, 'observed', ['tool manifest']))],
      summary: {
        catalogScore: readinessScore(sandboxChecks),
        catalogBudget: POINT_BUDGET,
        fullScore: readinessScore(sandboxChecks),
        fullBudget: POINT_BUDGET,
        unmeasuredLineIds: [],
      },
    };
  }

  const total = Math.max(1, products.length);
  const scraped = scrapedCatalogLegibility(products);
  const mismatched = products.filter((p) => p.feedPrice !== undefined && p.feedPrice !== p.price);
  const singlePriceSource =
    audit?.method === 'shopify-products-json' || source === 'shopify-admin';

  const catalogLines: AuditFinding[] = [];

  // feed_price_match — observable only if two price sources exist
  if (singlePriceSource) {
    catalogLines.push({
      id: 'feed_price_match',
      label: 'Price feed agrees with the shelf',
      status: 'warn',
      detail: `Only one public price source (${audit?.method}). Mismatch between feed and shelf cannot be detected from a crawl — connect Shopify Admin or run an agent journey.`,
      stat: `${total}/${total} single source`,
      points: 0,
      maxPoints: weightFor('feed_price_match'),
      basis: 'measured',
      sourceIds: ['presenc_price_mismatch'],
      rationale: sandboxChecks.find((c) => c.id === 'feed_price_match')?.rationale ?? '',
      fix: 'OAuth sync or export a separate agent feed and re-import.',
      confidence: 'unknown',
      evidence: ['products.json only — no independent feed'],
    });
  } else {
    const check = sandboxChecks.find((c) => c.id === 'feed_price_match')!;
    catalogLines.push(
      lineFromCheck(check, mismatched.length === 0 ? 'observed' : 'observed', [
        `${total - mismatched.length}/${total} SKUs agree`,
      ]),
    );
  }

  // page_structure — grade scraped fields
  const pageEarned = scraped.legible / Math.max(1, scraped.total);
  const pageMax = weightFor('page_structure');
  const pagePoints = Math.round(pageMax * Math.max(0, Math.min(1, pageEarned)));
  catalogLines.push({
    id: 'page_structure',
    label: 'Product records an agent can read',
    status: pagePoints >= pageMax ? 'pass' : pagePoints >= pageMax * 0.6 ? 'warn' : 'fail',
    detail:
      scraped.legible === scraped.total
        ? `All ${scraped.total} scraped SKUs carry name, sku, gtin, and Offer fields.`
        : `${scraped.total - scraped.legible} of ${scraped.total} scraped SKUs miss required fields (${scraped.gaps
            .map((g) => `${g.field} × ${g.missing}`)
            .join(', ')}). Graded from crawl data, not ReadyCounter's emitted JSON-LD.`,
    stat: `${scraped.legible}/${scraped.total} complete`,
    points: pagePoints,
    maxPoints: pageMax,
    basis: 'measured',
    sourceIds: ['presenc_page_structure', 'schema_offer_gap'],
    rationale: sandboxChecks.find((c) => c.id === 'page_structure')?.rationale ?? '',
    fix: 'Add barcodes/GTINs and complete Offer objects in Shopify or theme JSON-LD.',
    confidence: 'observed',
    evidence: [`method: ${audit?.method}`, `gtin coverage ${audit?.signals.gtinCoverage ?? 0}%`, `offer coverage ${audit?.signals.offerCoverage ?? 0}%`],
  });

  const unmeasured: AuditFinding[] = [
    unknownLine(
      'checkout_freshness',
      'What the agent was shown survives to checkout',
      'A URL crawl does not run the checkout path. The 26% stale-data row needs a live order probe or Shopify OAuth sync plus agent journey.',
      'Run agent journey after OAuth, or use sandbox autopilot on a connected store.',
      ['checkout not probed'],
    ),
    unknownLine(
      'agent_checkout_path',
      'No CAPTCHA on the checkout path',
      audit?.signals.captchaHints
        ? 'HTML hints suggest bot protection (reCAPTCHA/hCaptcha). Not confirmed at checkout — treat as high risk.'
        : 'No CAPTCHA detected in crawled HTML. Checkout may still gate agents — not observable from catalog crawl alone.',
      audit?.signals.captchaHints
        ? 'Remove or bypass CAPTCHA for agent checkout traffic.'
        : 'Connect Shopify and run prepare_checkout in agent journey to confirm.',
      audit?.signals.captchaHints ? ['captcha keyword in HTML'] : ['no captcha keywords in HTML'],
    ),
    unknownLine(
      'account_wall',
      'No forced account on the checkout path',
      audit?.signals.accountWallHints
        ? 'HTML hints suggest login/account wall language. Not confirmed at checkout.'
        : 'Account wall not detectable from catalog crawl.',
      'Allow guest checkout; confirm with agent journey.',
      audit?.signals.accountWallHints ? ['login/account keywords in HTML'] : ['catalog only'],
    ),
    unknownLine(
      'payment_method',
      'A payment method an agent can complete',
      'Payment methods are declared at checkout, not in products.json. Requires merchant config or agent journey.',
      'Declare agent-completable payment methods after OAuth connect.',
      ['checkout not probed'],
    ),
  ];

  const measurable = catalogLines.filter((c) => (c.maxPoints ?? 0) > 0);
  const catalogBudget = measurable.reduce((n, c) => n + (c.maxPoints ?? 0), 0);
  const catalogEarned = measurable.reduce((n, c) => n + (c.points ?? 0), 0);
  const catalogScore =
    catalogBudget === 0 ? 0 : Math.round((catalogEarned / catalogBudget) * 100);

  const fullScore = readinessScore(sandboxChecks);

  return {
    findings: [...catalogLines, ...unmeasured, ...reported.map((c) => lineFromCheck(c, 'observed', ['tools']))],
    summary: {
      catalogScore,
      catalogBudget,
      fullScore,
      fullBudget: POINT_BUDGET,
      unmeasuredLineIds: unmeasured.map((u) => u.id),
    },
  };
}
