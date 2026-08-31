import type { MerchantConfig, PaymentMethod, Product, ReadinessCheck } from '../types/commerce';
import { getSource } from '../data/sources';
import type { SourceId } from '../data/sources';
import { catalogLegibility } from './catalogSchema';
import { probeCheckoutSurvival } from './orderMath';

/**
 * The readiness score is an itemised bill, not a gauge.
 *
 * 100 points across six charged lines, and since 2026-08-31 the six lines ARE
 * the six rows of Presenc AI's "Causes of Agent Cart Abandonment" table, each
 * at the share that table publishes. Nothing on the bill is a weight we picked:
 *
 *   26  Stale price or stock data at checkout   checkout_freshness
 *   24  Captcha or verification wall            agent_checkout_path
 *   18  Price mismatch vs listed feed           feed_price_match
 *   15  Required account or login               account_wall
 *   11  Unsupported payment method              payment_method
 *    6  Ambiguous page structure                page_structure
 *   ---
 *   100        every point traceable to a published row
 *
 * THE CLAIM THIS LICENSES, AND THE ONE IT DOES NOT. Every WEIGHT is published.
 * The TESTS are ours. The table names six causes and defines none of them — the
 * page was fetched again, raw, on 2026-08-31 and the only prose about any row
 * is one FAQ sentence about the 26. So each line below states its own test in
 * `rationale`, and the tape prints "published weight · our stated test" rather
 * than letting an all-measured bill imply the tests are published too. Claiming
 * more than the source carries is exactly the mistake that charged an account
 * wall the CAPTCHA's 24 points for a day.
 *
 * WHAT LEFT THE BILL, 2026-08-31. Three lines used to carry weights we
 * allocated ourselves: catalog schema 14, tool surface 14, availability 7.
 *   - Availability folded into the 26 row, where the source itself puts stock
 *     ("stale price OR STOCK data at checkout").
 *   - Catalog schema folded into the 6 row as an emitted-markup test.
 *   - The tool surface is not a cause of abandonment on anybody's table. It is
 *     the INSTRUMENT every line above is measured through, so it is reported
 *     and not charged — `reportedLines()` below — with a floor that says when
 *     the store is measurable at all.
 * The allocated block is now 0. It used to be 35, and the coincidence that the
 * three then-unscored rows also totalled 35% was arithmetic, never a mapping;
 * this build makes the question moot by scoring the rows themselves.
 */

export const POINT_BUDGET = 100;

export interface WeightRow {
  id: string;
  max: number;
  basis: 'measured' | 'reported';
  sourceIds: SourceId[];
  /** Why this check is worth this many points, and what the check actually is. */
  rationale: string;
}

export const WEIGHTS: WeightRow[] = [
  {
    id: 'checkout_freshness',
    max: 26,
    basis: 'measured',
    sourceIds: ['presenc_stale_feed'],
    rationale:
      'Published weight: Presenc AI attributes 26% of abandoned agent carts to stale price or stock data at checkout — the largest row on the table. Our test: every SKU the catalog surfaces is run through the real order path, and it survives only if the store still accepts it and bills exactly the price the catalog handed the agent. The source’s one sentence about this row is "when the price or availability the agent saw differs from checkout, the agent halts rather than guessing", so both halves are asserted. Honest limit: in these two demo stores the price half cannot fail, because the catalog record and the order path read the same field — the half that discriminates here is availability. The price assertion still goes red the moment checkout bills anything else, and an imported real catalog is where it earns its keep.',
  },
  {
    id: 'agent_checkout_path',
    max: 24,
    basis: 'measured',
    sourceIds: ['presenc_captcha'],
    rationale:
      'Published weight: Presenc AI attributes 24% of abandoned agent carts to a CAPTCHA or verification wall. Our test: the merchant config declares whether a CAPTCHA stands on the checkout path. All of it, or none of it.',
  },
  {
    id: 'feed_price_match',
    max: 18,
    basis: 'measured',
    sourceIds: ['presenc_price_mismatch'],
    rationale:
      'Published weight: "Price mismatch vs listed feed — 18%" is its own row, three lines below the 26% stale-data row. Our test: for every SKU, the price in the catalog feed equals the price on the shelf. This line used to carry the 26 instead, which billed one defect at another row’s price; it now takes the row that names the defect it detects, and never adds the 26 on top.',
  },
  {
    id: 'account_wall',
    max: 15,
    basis: 'measured',
    sourceIds: ['presenc_account_wall'],
    rationale:
      'Published weight: Presenc AI gives a required account or login its own row — 15% of abandoned agent carts, not the CAPTCHA’s 24%. Our test: the merchant config declares whether an account is forced before payment.',
  },
  {
    id: 'payment_method',
    max: 11,
    basis: 'measured',
    sourceIds: ['presenc_payment_method'],
    rationale:
      'Published weight: an unsupported payment method causes 11% of abandoned agent carts. Our test, and this one is a classification we own: a prepared agent order must be completable on at least one method the store accepts, with no step only a human at the device can take. A stored credential passes. A per-transaction 3-D Secure step-up, a device biometric, a redirect to another site’s login, and a manual invoice approval do not. The source prices the cause and never says which methods qualify, so the line is scored all-or-nothing on our definition and prints it.',
  },
  {
    id: 'page_structure',
    max: 6,
    basis: 'measured',
    sourceIds: ['presenc_page_structure', 'schema_offer_gap'],
    rationale:
      'Published weight: "Ambiguous page structure — 6%", the smallest row and the only one with no prose anywhere on the source page. Our test, stated because the source states nothing: we read back the JSON-LD this page actually emits and require each product record to carry name, sku, a resolvable gtin13, and an Offer with price, priceCurrency and availability. A store-local SKU identifies a product inside this store and resolves to nothing outside it, which is why the GTIN is on the list. Digital Applied’s 5,000-site audit found only 19% of Product schemas carry an Offer object at all.',
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
    `ReadyCounter charges exactly ${weightFor('account_wall')} points. Every weight on ` +
    `this tape is the share its own published row states — none of the 100 is a number we picked.`
  );
}

/** The header sentence, in one place, so no surface can widen the claim. */
export function billClaim(): string {
  return (
    `All ${POINT_BUDGET} points are published weights: one line per row of Presenc AI’s ` +
    `causes-of-abandonment table, each at the share that table states. The tests behind the ` +
    `lines are ReadyCounter’s, and every line prints its own.`
  );
}

export const MEASURED_POINTS = WEIGHTS.filter((w) => w.basis === 'measured').reduce(
  (n, w) => n + w.max,
  0,
);

/** Zero since 2026-08-31, and exported so a surface can assert it rather than assume it. */
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

/** Methods a store declares. A session persisted before 2026-08-31 carries none. */
export function paymentMethodsOf(config: MerchantConfig): PaymentMethod[] {
  return config.paymentMethods ?? [];
}

/** The methods a prepared agent order can actually complete on. */
export function agentPayableMethods(config: MerchantConfig): PaymentMethod[] {
  return paymentMethodsOf(config).filter((m) => m.agentCompletable);
}

export function computeReadinessChecks(
  config: MerchantConfig,
  registeredToolCount: number,
  products: Product[],
): ReadinessCheck[] {
  void registeredToolCount;
  const total = Math.max(1, products.length);

  const mismatched = products.filter(
    (p) => p.feedPrice !== undefined && p.feedPrice !== p.price,
  );
  const cleanFeed = total - mismatched.length;

  const probes = probeCheckoutSurvival(products);
  const survived = probes.filter((p) => p.survives);
  const refused = probes.filter((p) => p.refusal !== null);
  const repriced = probes.filter((p) => p.refusal === null && p.charged !== p.shown);

  const legibility = catalogLegibility(config.storeName, products);

  const methods = paymentMethodsOf(config);
  const payable = agentPayableMethods(config);

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
      'checkout_freshness',
      'What the agent was shown survives to checkout',
      survived.length / total,
      survived.length === total
        ? `All ${total} SKUs run the order path unchanged: the store accepts every one, and bills the price its catalog record quoted.`
        : `${total - survived.length} of ${total} SKUs do not survive the order path. ` +
          (refused.length > 0
            ? `${refused.length} the store refuses outright (${refused
                .map((p) => p.refusal)
                .join('; ')}) — an agent that searched the catalog builds a cart it cannot fill. `
            : '') +
          (repriced.length > 0
            ? `${repriced.length} are billed at a price the catalog did not quote. `
            : '') +
          'Presenc AI: when the price or availability the agent saw differs at checkout, the agent halts rather than guessing.',
      `${survived.length}/${total} survive`,
      survived.length === total
        ? 'Nothing to fix — keep the feed job running.'
        : 'Delist or restock what the order path refuses, so the searchable catalog is the fillable catalog.',
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
      'feed_price_match',
      'Price feed agrees with the shelf',
      cleanFeed / total,
      mismatched.length === 0
        ? `All ${total} SKUs quote the same price in the feed and on the page.`
        : `${mismatched.length} of ${total} SKUs quote a feed price that is not the shelf price: ${mismatched
            .map((p) => p.name)
            .join(', ')}. An agent that quotes the feed and pays the shelf gets a mismatch at checkout — Presenc AI's own row, ${weightFor('feed_price_match')}%.`,
      `${cleanFeed}/${total} SKUs agree`,
      mismatched.length === 0
        ? 'Nothing to fix — keep the feed job running.'
        : 'Re-sync the product feed so feedPrice equals the live price.',
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
      'payment_method',
      'A payment method an agent can complete',
      payable.length > 0 ? 1 : 0,
      methods.length === 0
        ? `This store declares no payment methods, so nothing here can complete a prepared order. Presenc AI prices an unsupported payment method at ${weightFor('payment_method')}% of abandoned agent carts.`
        : payable.length > 0
          ? `${payable.length} of ${methods.length} accepted methods complete without a human-only step: ${payable
              .map((m) => m.label)
              .join(', ')}. The agent can hand the order over and it goes through.`
          : `${methods.length} methods accepted, none of which a prepared agent order can complete: ${methods
              .map((m) => `${m.label} (${m.humanStep ?? 'human-only step'})`)
              .join('; ')}. Presenc AI prices this at ${weightFor('payment_method')}% of abandoned agent carts, and this line is all-or-nothing because the agent only needs one route that works.`,
      payable.length > 0 ? `${payable.length}/${methods.length} agent-payable` : 'NO AGENT ROUTE',
      payable.length > 0
        ? 'Nothing to fix.'
        : 'Accept one method that completes on a stored credential, so a prepared order does not need a human at the device.',
    ),
    line(
      'page_structure',
      'Product records an agent can read',
      legibility.legible / Math.max(1, legibility.total),
      legibility.legible === legibility.total
        ? `All ${legibility.total} emitted product records carry every field an agent needs to price, check and match the item.`
        : `${legibility.total - legibility.legible} of ${legibility.total} emitted product records are missing a required field (${legibility.gaps
            .map((g) => `${g.field} × ${g.missing}`)
            .join(', ')}). Read back out of the JSON-LD this page publishes, not out of the fixture.`,
      `${legibility.legible}/${legibility.total} complete records`,
      legibility.legible === legibility.total
        ? 'Nothing to fix.'
        : `Emit the missing fields: ${legibility.gaps.map((g) => g.field).join(', ')}.`,
    ),
  ];
}

/**
 * Lines ReadyCounter checks and prints but does NOT charge for, because no
 * published row prices them.
 *
 * The tool surface used to be a 14-point allocated line. It is not a cause of
 * cart abandonment on anybody's table — it is the instrument the six charged
 * lines are measured through, which is a different kind of claim. So it is
 * reported at zero, with the floor that decides whether the store is measurable
 * at all. Reporting something at zero is the honest home for a check with no
 * published price; inventing a weight for it was not.
 */
export function reportedLines(registeredToolCount: number): ReadinessCheck[] {
  const met = registeredToolCount >= TOOL_FLOOR;
  return [
    {
      id: 'webmcp_tools',
      label: 'Tools the score is measured through',
      status: met ? 'pass' : 'fail',
      detail: met
        ? `${registeredToolCount} typed tools registered, against a floor of ${TOOL_FLOOR}. Every charged line above is read through this surface — the order path the freshness probe runs, the catalog the feed and record checks read. No published row prices a tool surface, so ReadyCounter charges nothing for it and says so here instead of inventing a weight.`
        : `${registeredToolCount} typed tools registered, below the floor of ${TOOL_FLOOR}. Under the floor the six charged lines are being read through a surface too thin to trust, so treat the total as unmeasured rather than earned.`,
      stat: `${registeredToolCount} tools · floor ${TOOL_FLOOR}`,
      points: 0,
      maxPoints: 0,
      basis: 'reported',
      sourceIds: ['shopify_catalog_2x'],
      rationale:
        'Shopify reports catalog-powered AI search converts 2× scraped search, which is the case for a typed tool surface — but it is not a row on any abandonment table, so it earns no points here. Reported, not charged.',
      fix: met
        ? 'Nothing to fix.'
        : `Register ${TOOL_FLOOR - registeredToolCount} more tool(s) in src/webmcp/registerTools.ts.`,
    },
  ];
}

/** True when the tool surface is thick enough for the charged lines to mean anything. */
export function measurementFloorMet(registeredToolCount: number): boolean {
  return registeredToolCount >= TOOL_FLOOR;
}

/**
 * Sum of the itemised lines. Returns the printed total, out of POINT_BUDGET.
 * Reported lines carry maxPoints 0 and cannot move it. Falls back to the old
 * equal-weight average only if a caller hands us checks with no point fields.
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
