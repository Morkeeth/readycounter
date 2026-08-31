import type { MerchantConfig, Product, ReadinessCheck } from '../types/commerce';
import { getSource } from '../data/sources';
import type { SourceId } from '../data/sources';

/**
 * The readiness score is an itemised bill, not a gauge.
 *
 * 100 points across six checks. THREE are MEASURED — the weight is literally a
 * row in Presenc AI's published causes-of-abandonment table, reproduced in full
 * in `research.md`. The other three are ALLOCATED by us, because no published
 * row prices them on its own, and every surface that prints the score says
 * which is which. That is the narrow claim, and it is narrow deliberately: the
 * table DOES carry rows adjacent to two of our allocated lines — "Ambiguous
 * page structure, 6%" sits near the catalog line, and stock is named inside the
 * 26% price row — and the rationales below name both rather than claim the
 * table is silent. Claiming a source is silent is the exact mistake that put an
 * account wall on the CAPTCHA's price for a day.
 *
 *   measured   26  price + stock feed goes stale         presenc_stale_feed
 *   measured   24  CAPTCHA or verification wall          presenc_captcha
 *   measured   15  required account or login             presenc_account_wall
 *   allocated  14  catalog schema an agent can read      schema_offer_gap
 *   allocated  14  structured tool surface               shopify_catalog_2x
 *   allocated   7  availability signals                  presenc_stale_feed
 *   ----------------
 *              100      65 measured · 35 allocated
 *
 * CORRECTION, 2026-08-31. Until today an account wall was charged the CAPTCHA's
 * 24 points, and four surfaces printed the reason: "no published figure prices
 * an account wall separately." That sentence was false about our OWN citation.
 * The Presenc table has six rows, and "Required account or login — 15%" is one
 * of them, sitting three lines below the 24% we had already lifted. Each wall
 * now costs the share its own published row states. Nothing about a checkout
 * wall is priced by us any more.
 *
 * The allocated block shrank 50 -> 35 to make room, keeping its old 2:2:1 shape
 * (20/20/10 -> 14/14/7). A published figure takes its full share first; our
 * judgement gets what is left.
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
      'Presenc AI attributes 26% of abandoned agent carts to stale price or stock data at checkout. The weight is that share. The same table also carries "Price mismatch vs listed feed — 18%", which names the defect this line actually detects; ReadyCounter charges the 26 row only and never adds the 18, so one mismatch is never billed twice.',
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
    id: 'account_wall',
    max: 15,
    basis: 'measured',
    sourceIds: ['presenc_account_wall'],
    rationale:
      'Presenc AI gives a required account or login its own row: 15% of abandoned agent carts. The weight is that share, not the CAPTCHA\'s.',
  },
  {
    id: 'catalog_schema',
    max: 14,
    basis: 'allocated',
    sourceIds: ['schema_offer_gap', 'shopify_catalog_2x'],
    rationale:
      'No published row prices a schema gap on its own. The nearest row on the same Presenc table is "Ambiguous page structure — 6%", and we do not take it: this line scores product identifiers (GTIN), not page markup, and adopting that row would be us choosing which cause fits. So the 14 is ours, and labelled ours. We allocate it because agents that cannot read price and availability never reach a cart at all.',
  },
  {
    id: 'webmcp_tools',
    max: 14,
    basis: 'allocated',
    sourceIds: ['shopify_catalog_2x'],
    rationale:
      'Allocated, not measured. Shopify reports catalog-powered AI search converts 2× scraped search; a structured tool surface is the same bet made explicit.',
  },
  {
    id: 'stock_signals',
    max: 7,
    basis: 'allocated',
    sourceIds: ['presenc_stale_feed'],
    rationale:
      'Presenc groups stock with price in one 26% figure. We split off 7 points for explicit availability flags rather than double-count the measured share.',
  },
];

const WEIGHT_BY_ID = new Map(WEIGHTS.map((w) => [w.id, w]));

/**
 * The one way any surface may print a weight. Every "worth 24 pts" string in a
 * component used to be a literal copied out of the table above — the same
 * mechanism as the clamp bug, one layer up: re-tune a weight and the copy drifts
 * with nothing red. `scripts/verify-score.mjs` fails the build if a component
 * hardcodes a point value again.
 */
export function weightFor(id: string): number {
  const w = WEIGHT_BY_ID.get(id);
  if (!w) throw new Error(`no weight row for ${id}`);
  return w.max;
}

/**
 * The sentence the VOID stamp prints when a forced account is the blocker.
 *
 * It used to exist TWICE, hardcoded, in `ReadinessDashboard` and `LandingHero`,
 * with the 15 typed in as a literal both times — while the CAPTCHA branch two
 * lines above read its sentence off the source row. That asymmetry is how the
 * old "no published figure prices an account wall separately" claim survived on
 * four surfaces at once: nobody edits four copies. Composed here, from the
 * source row and the weight table, and written nowhere else.
 */
export function accountWallBecause(): string {
  return (
    `${getSource('presenc_account_wall').claim} ` +
    `ReadyCounter charges exactly ${weightFor('account_wall')} points. Every checkout wall on ` +
    `this tape costs the share its own published row states — none of it is a number we picked.`
  );
}

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

/**
 * `earnedShare` is a FRACTION of the line's weight, 0..1 — never a point total.
 *
 * It used to be a point total, and every call site multiplied by the weight it
 * had copied out of the table above: `20 * (withGtin / total)`. When the weights
 * were rebalanced on 2026-08-31 those literals stayed at 20 and 10 while the
 * table moved to 14 and 7, and `Math.min(w.max, …)` quietly clamped the result
 * to a perfect score instead of failing.
 *
 * The first write-up of this bug said "two stores printed 14/14 and 7/7 on
 * catalogs that were 88% and 25% identified." That sentence is false, so the
 * pre-fix state was restored and re-run on 2026-08-31 against both shipped
 * fixtures. `node scripts/verify-stores.mjs` (exit 1) printed:
 *
 *   ember-oak    score 73 · catalog_schema printed 14 want 12 · stock 7 want 6
 *   neon-matcha  score 73 · catalog_schema printed  5 want  4 · stock 7 want 6
 *
 * What is true: ember-oak's catalog line was the falsely PERFECT one — 20 × 7/8
 * = 17.5 clamped down to 14/14 on a catalog only 88% identified. Neon's catalog
 * line was never clamped: 20 × 2/8 = 5 sits under the 14-point weight, so it
 * printed 5/14 and looked correct while still being one point wrong. The clamp
 * only lies where the stale literal OVERSHOOTS the new weight, which is why a
 * check that runs on the default store alone would have caught this by luck.
 * Availability was wrong on both (7/7, true value 6/7), and both stores landed
 * on the same 73 — the two-stores-differ beat would have died with it.
 *
 * A fraction cannot drift from the weight, because the weight is applied here
 * and stated in exactly one place.
 */
function line(
  id: string,
  label: string,
  earnedShare: number,
  detail: string,
  stat: string,
  fix: string,
): ReadinessCheck {
  const w = WEIGHT_BY_ID.get(id)!;
  const clamped = Math.max(0, Math.min(1, earnedShare));
  const points = Math.round(w.max * clamped);
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

  /*
   * Two walls, two published prices. They are scored on separate lines because
   * Presenc AI prices them on separate rows — 24% for a CAPTCHA, 15% for a
   * required account. A store carrying both pays both, which is the honest
   * result and used to be impossible to express when one line covered both.
   */
  const captchaOn = config.checkoutRequiresCaptcha;
  const accountOn = config.checkoutRequiresAccount;

  return [
    line(
      'price_consistency',
      'Price feed agrees with the shelf',
      cleanFeed / total,
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
      'No CAPTCHA on the checkout path',
      captchaOn ? 0 : 1,
      captchaOn
        ? `A CAPTCHA stands between a prepared order and payment. Presenc AI attributes ${weightFor('agent_checkout_path')}% of abandoned agent carts to a CAPTCHA or verification wall, so this line costs ${weightFor('agent_checkout_path')}.`
        : 'No CAPTCHA. An agent can carry a prepared order to the point a human pays.',
      captchaOn ? 'CAPTCHA ON' : 'CLEAR',
      captchaOn
        ? 'Turn the CAPTCHA off for prepared-order traffic, or move it after payment intent.'
        : 'Nothing to fix.',
    ),
    line(
      'account_wall',
      'No forced account on the checkout path',
      accountOn ? 0 : 1,
      accountOn
        ? `A forced account or login stands between a prepared order and payment. Presenc AI gives that its own row — ${weightFor('account_wall')}% of abandoned agent carts — so this line costs ${weightFor('account_wall')}, not the CAPTCHA's ${weightFor('agent_checkout_path')}. Both walls are priced by the same published table; neither price is ours.`
        : 'No forced account. An agent can reach checkout without creating a login first.',
      accountOn ? 'ACCOUNT WALL ON' : 'CLEAR',
      accountOn
        ? 'Allow guest checkout, or defer account creation until after the order is placed.'
        : 'Nothing to fix.',
    ),
    line(
      'catalog_schema',
      'Catalog an agent can read',
      withGtin / total,
      `${withGtin} of ${total} SKUs carry a GTIN, so ${gtinPct}% of this catalog can be matched to a product an agent already knows. In a 5,000-site audit only 19% of Product schemas carried the Offer object at all.`,
      `${gtinPct}% identified`,
      withGtin === total
        ? 'Nothing to fix.'
        : `Add GTIN identifiers to the ${total - withGtin} SKU(s) without one.`,
    ),
    line(
      'webmcp_tools',
      'Structured tools an assistant can call',
      Math.min(registeredToolCount, TOOL_FLOOR) / TOOL_FLOOR,
      `${registeredToolCount} structured tools connected, against a floor of ${TOOL_FLOOR}. Tools are the catalog-vs-scrape bet made explicit: the assistant asks a typed question instead of reading the page.`,
      `${registeredToolCount} tools`,
      registeredToolCount >= TOOL_FLOOR
        ? 'Nothing to fix.'
        : `Register ${TOOL_FLOOR - registeredToolCount} more tool(s) in src/webmcp/registerTools.ts.`,
    ),
    line(
      'stock_signals',
      'Availability stated, not implied',
      inStock / total,
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
