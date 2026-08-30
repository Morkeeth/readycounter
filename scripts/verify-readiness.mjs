#!/usr/bin/env node
/**
 * Cold verification of the merchant readiness score (no browser).
 *
 * This file used to print `CAPTCHA ON < 70: false` and exit 0. A check that
 * prints its own failure and still passes is worse than no check, because the
 * green run is the thing anybody actually reads. Every line below is now an
 * assertion that ends the process.
 *
 * The headline assertions are deliberately source-anchored: clearing the CAPTCHA
 * must move the score by exactly 24 points, and clearing a forced account by
 * exactly 15, because those are the two separate rows Presenc AI publishes for
 * those two walls. If anyone re-tunes either weight without re-reading the
 * source, this goes red.
 *
 * The 15 is here because it was wrong until 2026-08-31: an account wall was
 * charged the CAPTCHA's 24 on the claim that no published figure priced it, and
 * the figure was on the same table, four rows down. The check that would have
 * caught it is this one, so it exists now.
 *
 * Run: node scripts/verify-readiness.mjs
 */
import { execSync } from 'node:child_process';
import { writeFileSync, unlinkSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const script = `
import { computeReadinessChecks, readinessScore, POINT_BUDGET } from './src/lib/readiness.ts';
import { SOURCES } from './src/data/sources.ts';
import { MERCHANT_DEFAULTS, PRODUCTS } from './src/data/catalog.ts';
import { useShopStore } from './src/store/shopStore.ts';

let failed = 0;
function assert(label, ok, got) {
  console.log((ok ? 'ok   ' : 'FAIL ') + label + (got === undefined ? '' : ' — ' + got));
  if (!ok) failed++;
}

const base = { ...MERCHANT_DEFAULTS, checkoutRequiresCaptcha: false, checkoutRequiresAccount: false };
const withCaptcha = computeReadinessChecks({ ...base, checkoutRequiresCaptcha: true }, 10, PRODUCTS);
const withoutCaptcha = computeReadinessChecks(base, 10, PRODUCTS);
const withAccount = computeReadinessChecks({ ...base, checkoutRequiresAccount: true }, 10, PRODUCTS);
const withBoth = computeReadinessChecks({ ...base, checkoutRequiresCaptcha: true, checkoutRequiresAccount: true }, 10, PRODUCTS);
const scoreOn = readinessScore(withCaptcha);
const scoreOff = readinessScore(withoutCaptcha);
const delta = scoreOff - scoreOn;

const gtinRatio = PRODUCTS.filter((p) => p.gtin).length / PRODUCTS.length;
const stockRatio = PRODUCTS.filter((p) => p.inStock).length / PRODUCTS.length;
const feedRatio = PRODUCTS.filter((p) => p.feedPrice === undefined || p.feedPrice === p.price).length / PRODUCTS.length;

const captchaPct = Number(SOURCES.presenc_captcha.figure.replace('%', ''));
const accountPct = Number(SOURCES.presenc_account_wall.figure.replace('%', ''));
const scoreAccount = readinessScore(withAccount);
const scoreBoth = readinessScore(withBoth);
const accountDelta = scoreOff - scoreAccount;

assert('catalog has SKUs to score', PRODUCTS.length > 0, PRODUCTS.length + ' SKUs');
assert('score is inside the budget', scoreOn >= 0 && scoreOff <= POINT_BUDGET, scoreOn + ' / ' + scoreOff + ' of ' + POINT_BUDGET);
assert('CAPTCHA costs the store points', scoreOn < scoreOff, scoreOn + ' -> ' + scoreOff);
assert(
  'the CAPTCHA delta equals the published figure',
  delta === captchaPct,
  delta + ' pts vs ' + SOURCES.presenc_captcha.publisher + ' ' + SOURCES.presenc_captcha.figure,
);

assert(
  'the account-wall delta equals its OWN published figure, not the CAPTCHA figure',
  accountDelta === accountPct,
  accountDelta + ' pts vs ' + SOURCES.presenc_account_wall.publisher + ' ' + SOURCES.presenc_account_wall.figure,
);
assert(
  'the two walls are priced differently, as the source prices them',
  accountPct !== captchaPct && accountDelta !== delta,
  'captcha ' + delta + ' vs account ' + accountDelta,
);
assert(
  'a store carrying both walls pays both, not one',
  scoreOff - scoreBoth === captchaPct + accountPct,
  scoreOff + ' -> ' + scoreBoth + ' = ' + (scoreOff - scoreBoth) + ' pts',
);

const blocked = withCaptcha.find((c) => c.id === 'agent_checkout_path');
assert('the blocked line scores zero and names its source', blocked.points === 0 && blocked.sourceIds.includes('presenc_captcha'), blocked.points + '/' + blocked.maxPoints);
const acctLine = withAccount.find((c) => c.id === 'account_wall');
assert(
  'the account line scores zero and cites the account row, not the CAPTCHA row',
  acctLine.points === 0 && acctLine.maxPoints === accountPct && acctLine.sourceIds.includes('presenc_account_wall') && !acctLine.sourceIds.includes('presenc_captcha'),
  acctLine.points + '/' + acctLine.maxPoints + ' via ' + acctLine.sourceIds.join(','),
);
assert('every line carries points, a basis and a source', withCaptcha.every((c) => typeof c.points === 'number' && c.basis && c.sourceIds.length > 0), withCaptcha.length + ' lines');
assert(
  'the lines sum to the printed total',
  Math.round((withCaptcha.reduce((n, c) => n + c.points, 0) / POINT_BUDGET) * 100) === scoreOn,
  'sum ' + withCaptcha.reduce((n, c) => n + c.points, 0) + ' vs printed ' + scoreOn,
);

/*
 * A partial catalog must never print a full line. The weights were rebalanced
 * on 2026-08-31 while the call sites still multiplied by the OLD point values;
 * Math.min clamped 17.5 down to 14 and a 7-of-8 catalog printed 14/14. The
 * clamp made a wrong number look like a right one, so it is asserted now.
 */
const partial = withCaptcha.filter((c) => {
  const ratio = { catalog_schema: gtinRatio, stock_signals: stockRatio, price_consistency: feedRatio }[c.id];
  return ratio !== undefined && ratio < 1;
});
assert(
  'a line scored on a partial ratio prints less than its full weight',
  partial.length > 0 && partial.every((c) => c.points < c.maxPoints),
  partial.map((c) => c.id + ' ' + c.points + '/' + c.maxPoints).join(' · '),
);

const gtinCount = PRODUCTS.filter((p) => p.gtin).length;
assert('GTIN coverage is real, not assumed', gtinCount > 0 && gtinCount <= PRODUCTS.length, gtinCount + '/' + PRODUCTS.length);

useShopStore.setState({ funnel: [], order: { lines: [], currency: 'USD' } });
const store = useShopStore.getState();
store.recordFunnel('catalog_search', 'agent');
store.addToOrder('sku-espresso', 1, 'agent');
store.prepareCheckout('agent');
const counts = useShopStore.getState().funnel.reduce((acc, e) => {
  acc[e.step] = (acc[e.step] ?? 0) + 1;
  return acc;
}, {});

assert('funnel records catalog_search', (counts.catalog_search ?? 0) >= 1, JSON.stringify(counts));
assert('funnel records add_to_order', (counts.add_to_order ?? 0) >= 1);
assert('funnel records checkout_prepare', (counts.checkout_prepare ?? 0) >= 1);
assert('funnel records checkout_blocked under the default CAPTCHA', (counts.checkout_blocked ?? 0) >= 1);

console.log(failed === 0
  ? '\\nverify-readiness: clear ' + scoreOff + ' · CAPTCHA ' + scoreOn + ' (-' + delta + ') · account wall ' + scoreAccount + ' (-' + accountDelta + ') · both ' + scoreBoth + ' — all checks pass'
  : '\\nverify-readiness: ' + failed + ' check(s) failed');
process.exit(failed === 0 ? 0 : 1);
`;

const tmp = path.join(root, '.verify-tmp.mts');
writeFileSync(tmp, script);
try {
  execSync(`npx --yes tsx ${tmp}`, { cwd: root, stdio: 'inherit' });
} finally {
  unlinkSync(tmp);
}
