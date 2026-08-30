#!/usr/bin/env node
/**
 * Cold verification of the merchant readiness score (no browser).
 *
 * This file used to print `CAPTCHA ON < 70: false` and exit 0. A check that
 * prints its own failure and still passes is worse than no check, because the
 * green run is the thing anybody actually reads. Every line below is now an
 * assertion that ends the process.
 *
 * The headline assertion is deliberately source-anchored: clearing the CAPTCHA
 * must move the score by exactly 24 points, because 24% is the share of
 * abandoned agent carts Presenc AI attributes to a verification wall. If anyone
 * re-tunes the weight without re-reading the source, this goes red.
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

const withCaptcha = computeReadinessChecks({ ...MERCHANT_DEFAULTS, checkoutRequiresCaptcha: true }, 10, PRODUCTS);
const withoutCaptcha = computeReadinessChecks({ ...MERCHANT_DEFAULTS, checkoutRequiresCaptcha: false }, 10, PRODUCTS);
const scoreOn = readinessScore(withCaptcha);
const scoreOff = readinessScore(withoutCaptcha);
const delta = scoreOff - scoreOn;

const captchaPct = Number(SOURCES.presenc_captcha.figure.replace('%', ''));

assert('catalog has SKUs to score', PRODUCTS.length > 0, PRODUCTS.length + ' SKUs');
assert('score is inside the budget', scoreOn >= 0 && scoreOff <= POINT_BUDGET, scoreOn + ' / ' + scoreOff + ' of ' + POINT_BUDGET);
assert('CAPTCHA costs the store points', scoreOn < scoreOff, scoreOn + ' -> ' + scoreOff);
assert(
  'the CAPTCHA delta equals the published figure',
  delta === captchaPct,
  delta + ' pts vs ' + SOURCES.presenc_captcha.publisher + ' ' + SOURCES.presenc_captcha.figure,
);

const blocked = withCaptcha.find((c) => c.id === 'agent_checkout_path');
assert('the blocked line scores zero and names its source', blocked.points === 0 && blocked.sourceIds.includes('presenc_captcha'), blocked.points + '/' + blocked.maxPoints);
assert('every line carries points, a basis and a source', withCaptcha.every((c) => typeof c.points === 'number' && c.basis && c.sourceIds.length > 0), withCaptcha.length + ' lines');
assert(
  'the lines sum to the printed total',
  Math.round((withCaptcha.reduce((n, c) => n + c.points, 0) / POINT_BUDGET) * 100) === scoreOn,
  'sum ' + withCaptcha.reduce((n, c) => n + c.points, 0) + ' vs printed ' + scoreOn,
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
  ? '\\nverify-readiness: score ' + scoreOn + ' with the wall, ' + scoreOff + ' without, delta ' + delta + ' — all checks pass'
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
