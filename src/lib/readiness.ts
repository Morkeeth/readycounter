import type { MerchantConfig, Product, ReadinessCheck } from '../types/commerce';
import type { SourceId } from '../data/sources';

/**
 * The readiness score is an itemised bill, not a gauge.
 *
 * 100 points are allocated across five checks. Two of those allocations are
 * MEASURED — they are the share of abandoned agent carts that Presenc AI
 * attributes to that exact failure mode. The other three are ALLOCATED by us,
 * because no primary source itemises them, and every surface that prints the
 * score says so rather than passing our judgement off as research.
 *
 *   measured   26  price + stock feed goes stale         presenc_stale_feed
 *   measured   24  checkout path walled off              presenc_captcha
 *   allocated  20  catalog schema an agent can read      schema_offer_gap
 *   allocated  20  structured tool surface               shopify_catalog_2x
 *   allocated  10  availability signals                  presenc_stale_feed
 *   ----------------
 *              100
 *
 * Nothing here is a constant typed into a component. Change the catalog and the
 * arithmetic moves; every line the merchant reads is recomputed from the store.
 */

export const POINT_BUDGET = 100;

export interface WeightRow {
  id: string;
  max: number;
  basis: 'measured' | 'allocated';
  sourceIds: SourceId[];
  /** Why this check is worth this many points, in one sentence. */
  rationale: string;
}

export const WEIGHTS: WeightRow[] = [
  {
    id: 'price_consistency',
    max: 26,
    basis: 'measured',
    sourceIds: ['presenc_stale_feed'],
    rationale:
      'Presenc AI attributes 26% of abandoned agent carts to stale price or stock data at checkout. The weight is that share.',
  },
  {
    id: 'agent_checkout_path',
    max: 24,
    basis: 'measured',
    sourceIds: ['presenc_captcha'],
    rationale:
      'Presenc AI attributes 24% of abandoned agent carts to a CAPTCHA or verification wall. The weight is that share.',
  },
  {
    id: 'catalog_schema',
    max: 20,
    basis: 'allocated',
    sourceIds: ['schema_offer_gap', 'shopify_catalog_2x'],
    rationale:
      'No source itemises schema gaps as an abandonment cause. We allocate 20 because agents that cannot read price and availability never reach a cart at all.',
  },
  {
    id: 'webmcp_tools',
    max: 20,
    basis: 'allocated',
    sourceIds: ['shopify_catalog_2x'],
    rationale:
      'Allocated, not measured. Shopify reports catalog-powered AI search converts 2× scraped search; a structured tool surface is the same bet made explicit.',
  },
  {
    id: 'stock_signals',
    max: 10,
    basis: 'allocated',
    sourceIds: ['presenc_stale_feed'],
    rationale:
      'Presenc groups stock with price in one 26% figure. We split off 10 points for explicit availability flags rather than double-count the measured share.',
  },
];

const WEIGHT_BY_ID = new Map(WEIGHTS.map((w) => [w.id, w]));

export const MEASURED_POINTS = WEIGHTS.filter((w) => w.basis === 'measured').reduce(
  (n, w) => n + w.max,
  0,
);

export const ALLOCATED_POINTS = POINT_BUDGET - MEASURED_POINTS;

/** Tools the WebMCP Challenge brief treats as a credible surface. */
export const TOOL_FLOOR = 6;

function statusFor(earned: number, max: number): ReadinessCheck['status'] {
  if (earned >= max) return 'pass';
  if (earned >= max * 0.6) return 'warn';
  return 'fail';
}

function line(
  id: string,
  label: string,
  earned: number,
  detail: string,
  stat: string,
  fix: string,
): ReadinessCheck {
  const w = WEIGHT_BY_ID.get(id)!;
  const points = Math.max(0, Math.min(w.max, Math.round(earned)));
  return {
    id,
    label,
    status: statusFor(points, w.max),
    detail,
    stat,
    points,
    maxPoints: w.max,
    basis: w.basis,
    sourceIds: w.sourceIds,
    rationale: w.rationale,
    fix,
  };
}

export function computeReadinessChecks(
  config: MerchantConfig,
  registeredToolCount: number,
  products: Product[],
): ReadinessCheck[] {
  const total = Math.max(1, products.length);

  const withGtin = products.filter((p) => p.gtin).length;
  const gtinPct = Math.round((withGtin / total) * 100);

  const mismatched = products.filter(
    (p) => p.feedPrice !== undefined && p.feedPrice !== p.price,
  );
  const cleanFeed = total - mismatched.length;

  const outOfStock = products.filter((p) => !p.inStock).length;
  const inStock = total - outOfStock;

  const walled = config.checkoutRequiresCaptcha || config.checkoutRequiresAccount;
  const wallKind = config.checkoutRequiresCaptcha
    ? 'CAPTCHA'
    : config.checkoutRequiresAccount
      ? 'account wall'
      : null;

  return [
    line(
      'price_consistency',
      'Price feed agrees with the shelf',
      26 * (cleanFeed / total),
      mismatched.length === 0
        ? `All ${total} SKUs quote the same price in the feed and on the page.`
        : `${mismatched.length} of ${total} SKUs quote a feed price that is not the shelf price: ${mismatched
            .map((p) => p.name)
            .join(', ')}. An agent that quotes the feed and pays the shelf gets a mismatch at checkout.`,
      `${cleanFeed}/${total} SKUs agree`,
      mismatched.length === 0
        ? 'Nothing to fix — keep the feed job running.'
        : 'Re-sync the product feed so feedPrice equals the live price.',
    ),
    line(
      'agent_checkout_path',
      'Checkout path an agent can finish',
      walled ? 0 : 24,
      walled
        ? `${wallKind} stands between a prepared order and payment. Presenc AI attributes 24% of abandoned agent carts to a verification wall; an account wall closes the same door and has no separate published figure, so it is scored the same.`
        : 'No CAPTCHA and no forced account. An agent can carry an order all the way to human payment.',
      walled ? `${wallKind} ON` : 'CLEAR',
      walled
        ? 'Turn the wall off for prepared-order traffic, or move it after payment intent.'
        : 'Nothing to fix.',
    ),
    line(
      'catalog_schema',
      'Catalog an agent can read',
      20 * (withGtin / total),
      `${withGtin} of ${total} SKUs carry a GTIN, so ${gtinPct}% of this catalog can be matched to a product an agent already knows. In a 5,000-site audit only 19% of Product schemas carried the Offer object at all.`,
      `${gtinPct}% identified`,
      withGtin === total
        ? 'Nothing to fix.'
        : `Add GTIN identifiers to the ${total - withGtin} SKU(s) without one.`,
    ),
    line(
      'webmcp_tools',
      'Structured tool surface',
      20 * (Math.min(registeredToolCount, TOOL_FLOOR) / TOOL_FLOOR),
      `${registeredToolCount} WebMCP tools registered against a floor of ${TOOL_FLOOR}. Tools are the catalog-vs-scrape bet made explicit: the agent asks a typed question instead of reading the page.`,
      `${registeredToolCount} tools`,
      registeredToolCount >= TOOL_FLOOR
        ? 'Nothing to fix.'
        : `Register ${TOOL_FLOOR - registeredToolCount} more tool(s) in src/webmcp/registerTools.ts.`,
    ),
    line(
      'stock_signals',
      'Availability stated, not implied',
      10 * (inStock / total),
      outOfStock === 0
        ? `All ${total} SKUs carry an explicit in-stock flag.`
        : `${outOfStock} of ${total} SKUs are out of stock and say so explicitly, which is correct — but every hidden one is a cart an agent builds and cannot fill.`,
      `${inStock}/${total} sellable`,
      outOfStock === 0 ? 'Nothing to fix.' : 'Restock or delist, so the sellable catalog is the whole catalog.',
    ),
  ];
}

/**
 * Sum of the itemised lines. Returns the printed total, out of POINT_BUDGET.
 * Falls back to the old equal-weight average only if a caller hands us checks
 * that carry no point fields.
 */
export function readinessScore(checks: ReadinessCheck[]): number {
  const itemised = checks.filter((c) => typeof c.points === 'number' && typeof c.maxPoints === 'number');
  if (itemised.length === checks.length && checks.length > 0) {
    const earned = itemised.reduce((n, c) => n + (c.points ?? 0), 0);
    const possible = itemised.reduce((n, c) => n + (c.maxPoints ?? 0), 0);
    return possible === 0 ? 0 : Math.round((earned / possible) * 100);
  }
  const weights = { pass: 1, warn: 0.5, fail: 0 };
  const total = checks.reduce((sum, c) => sum + weights[c.status], 0);
  return checks.length === 0 ? 0 : Math.round((total / checks.length) * 100);
}

/** Points lost, itemised — what the merchant is actually paying for. */
export function pointsLost(checks: ReadinessCheck[]): number {
  return checks.reduce((n, c) => n + ((c.maxPoints ?? 0) - (c.points ?? 0)), 0);
}
