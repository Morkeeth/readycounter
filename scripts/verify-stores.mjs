#!/usr/bin/env node
/**
 * Multi-store verification — the demo's whole argument is that two stores fail
 * for DIFFERENT reasons, and the film cuts between them. So that contrast is
 * asserted, not printed.
 *
 * This file previously printed:
 *   'failure modes differ': ember.checkoutRequiresCaptcha !== neon.checkoutRequiresAccount || ...
 * which compares a CAPTCHA flag on one store to an account flag on another —
 * two correct booleans asserting a relationship nobody checked. It returned
 * true by accident. The check below names each store's blocker instead.
 *
 * Run: node scripts/verify-stores.mjs
 */
import { execSync } from 'node:child_process';
import { writeFileSync, unlinkSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const script = `
import { STORES, STORE_IDS } from './src/data/stores.ts';
import { computeReadinessChecks, readinessScore, reportedLines, TOOL_FLOOR } from './src/lib/readiness.ts';
import { catalogJsonLd } from './src/lib/catalogSchema.ts';
import { SOURCES } from './src/data/sources.ts';
import { WEBMCP_TOOL_COUNT } from './src/webmcp/toolManifest.ts';

/** '24%' -> 24. A wall's price is pinned to its SOURCE ROW, never to a literal
 *  retyped in this file — retyping the table is the bug this repo just fixed. */
const pubPct = (id) => Number(SOURCES[id].figure.replace('%', ''));

// Read from the manifest, not typed here. This literal said 13 while the
// product registered 16 — harmless only because both clear the floor of 6,
// which is exactly how a stale constant survives.
const TOOL_COUNT = WEBMCP_TOOL_COUNT;
const MIN_SKUS = 6;

let failed = 0;
function assert(label, ok, got) {
  console.log((ok ? 'ok   ' : 'FAIL ') + label + (got === undefined ? '' : ' — ' + got));
  if (!ok) failed++;
}

function blockerOf(store) {
  if (store.merchant.checkoutRequiresCaptcha) return 'captcha';
  if (store.merchant.checkoutRequiresAccount) return 'account';
  return 'none';
}

assert('the platform ships more than one store', STORE_IDS.length >= 2, STORE_IDS.join(', '));

const rows = STORE_IDS.map((id) => {
  const store = STORES[id];
  const checks = computeReadinessChecks(store.merchant, TOOL_COUNT, store.products);
  const score = readinessScore(checks);
  const blocker = blockerOf(store);
  assert(id + ' has a catalog worth scoring', store.products.length >= MIN_SKUS, store.products.length + ' SKUs');
  assert(id + ' scores in range', score > 0 && score <= 100, 'score ' + score + ', blocker ' + blocker);
  /*
   * Each wall has its OWN line and its OWN published price since 2026-08-31.
   * Asserting one line against both flags would repeat the bug this repo just
   * fixed, so the blocker names the line it is supposed to have zeroed.
   */
  const lineFor = { captcha: 'agent_checkout_path', account: 'account_wall' }[blocker];
  const captchaLine = checks.find((c) => c.id === 'agent_checkout_path');
  const accountLine = checks.find((c) => c.id === 'account_wall');
  assert(
    id + ' zeroes exactly the line its blocker names',
    lineFor === undefined
      ? captchaLine.points === captchaLine.maxPoints && accountLine.points === accountLine.maxPoints
      : checks.find((c) => c.id === lineFor).points === 0,
    'blocker ' + blocker + ' · captcha ' + captchaLine.points + '/' + captchaLine.maxPoints + ' · account ' + accountLine.points + '/' + accountLine.maxPoints,
  );
  const wallSource = { captcha: 'presenc_captcha', account: 'presenc_account_wall' }[blocker];
  assert(
    id + ' charges the blocked wall its own published weight',
    lineFor === undefined || checks.find((c) => c.id === lineFor).maxPoints === pubPct(wallSource),
    blocker + ' costs ' + (lineFor ? checks.find((c) => c.id === lineFor).maxPoints : 0) + ' pts vs ' + SOURCES[wallSource].publisher + ' ' + SOURCES[wallSource].figure,
  );

  /*
   * THE CLAMP CHECK, run per store.
   *
   * On 2026-08-31 the weights moved to 14/14/7 while the call sites still
   * multiplied by 20/20/10, and Math.min(w.max, ...) turned 17.5 into a PERFECT
   * 14/14 on a catalog only 88% identified. Nothing went red: a wrong number
   * wearing a right number's clothes.
   *
   * A replay of that state shows why one store is not enough. ember-oak's
   * catalog line overshot (17.5 -> clamped to 14/14) but neon-matcha's did not
   * (20 x 2/8 = 5, under the 14-point weight, printed 5/14 and looked correct).
   * The clamp only lies where the stale literal overshoots the new weight, so a
   * check that runs on the default store alone catches it BY LUCK.
   *
   * Below, each line's expected points are recomputed here from the fixture --
   * ratio x weight, arithmetic this file owns -- and compared to what the
   * product printed. Any weight applied anywhere but line() fails it, on
   * every store, whether or not the drift happens to overshoot.
   */
  const t = store.products.length;

  /*
   * The verifier's OWN model of each line, typed here on purpose.
   *
   * 'unitCharge' and 'shownPrice' look like the same expression, and that is the
   * assertion: the order path must bill exactly the price the catalog record
   * quoted. Tamper 'chargeForLine' in src/lib/orderMath.ts to bill 'feedPrice'
   * and the product's probe stops counting those SKUs as surviving while this
   * file still expects them to — red, on both stores.
   *
   * The JSON-LD field list is typed here too. It IS the definition of "a record
   * an agent can read", so quietly dropping 'gtin13' from REQUIRED_JSONLD_FIELDS
   * would raise every score with nothing to stop it. Here it costs points.
   */
  const unitCharge = (p) => p.price;
  const shownPrice = (p) => p.price;
  const REQUIRED = ['name', 'sku', 'gtin13', 'offers.price', 'offers.priceCurrency', 'offers.availability'];
  const emitted = (catalogJsonLd(store.merchant.storeName, store.products).itemListElement ?? []).map((e) => e.item);
  const walk = (rec, path) => path.split('.').reduce((n, k) => (n && typeof n === 'object' ? n[k] : undefined), rec);
  const legibleCount = emitted.filter((rec) => REQUIRED.every((f) => {
    const v = walk(rec, f);
    return v !== undefined && v !== null && v !== '';
  })).length;
  const methods = store.merchant.paymentMethods ?? [];

  const ratios = {
    checkout_freshness:
      store.products.filter((p) => p.inStock && unitCharge(p) === shownPrice(p)).length / t,
    agent_checkout_path: store.merchant.checkoutRequiresCaptcha ? 0 : 1,
    feed_price_match:
      store.products.filter((p) => p.feedPrice === undefined || p.feedPrice === p.price).length / t,
    account_wall: store.merchant.checkoutRequiresAccount ? 0 : 1,
    payment_method: methods.some((m) => m.agentCompletable) ? 1 : 0,
    page_structure: legibleCount / Math.max(1, emitted.length),
  };

  assert(
    id + ' emits one JSON-LD product record per SKU',
    emitted.length === t,
    emitted.length + ' records for ' + t + ' SKUs',
  );

  const reported = reportedLines(TOOL_COUNT);
  assert(
    id + ' reports the tool surface and charges nothing for it',
    reported.length === 1 && reported[0].maxPoints === 0 && TOOL_COUNT >= TOOL_FLOOR,
    reported[0].stat,
  );
  assert(
    id + ' charges nothing that has no published row',
    checks.every((c) => c.basis === 'measured'),
    checks.map((c) => c.basis).join(','),
  );

  const drift = checks.filter((c) => c.points !== Math.round(c.maxPoints * ratios[c.id]));
  assert(
    id + ' — every line equals ratio x weight, recomputed outside the product',
    drift.length === 0,
    drift.length
      ? drift.map((c) => c.id + ' printed ' + c.points + ' want ' + Math.round(c.maxPoints * ratios[c.id])).join(' · ')
      : checks.map((c) => c.id.slice(0, 5) + ' ' + c.points + '/' + c.maxPoints).join(' · '),
  );
  const falselyPerfect = checks.filter((c) => ratios[c.id] < 1 && c.points >= c.maxPoints);
  assert(
    id + ' — no partial ratio prints a perfect line',
    falselyPerfect.length === 0,
    falselyPerfect.length
      ? falselyPerfect.map((c) => c.id + ' ' + c.points + '/' + c.maxPoints).join(' · ')
      : checks.filter((c) => ratios[c.id] < 1).map((c) => c.id + ' ' + c.points + '/' + c.maxPoints).join(' · ') || 'no partial lines',
  );

  return { id, score, blocker };
});

const scores = new Set(rows.map((r) => r.score));
assert('the two stores do not score the same', scores.size === rows.length, rows.map((r) => r.id + ' ' + r.score).join(' · '));

const blockers = rows.map((r) => r.blocker);
assert(
  'each store is blocked by a DIFFERENT mechanism',
  new Set(blockers).size === blockers.length && !blockers.includes('none'),
  rows.map((r) => r.id + ' ' + r.blocker).join(' · '),
);

console.log(failed === 0
  ? '\\nverify-stores: ' + rows.map((r) => r.id + ' ' + r.score + '/100 (' + r.blocker + ')').join(' · ') + ' — all checks pass'
  : '\\nverify-stores: ' + failed + ' check(s) failed');
process.exit(failed === 0 ? 0 : 1);
`;

const tmp = path.join(root, '.verify-stores-tmp.mts');
writeFileSync(tmp, script);
try {
  execSync(`npx --yes tsx ${tmp}`, { cwd: root, stdio: 'inherit' });
} finally {
  unlinkSync(tmp);
}
