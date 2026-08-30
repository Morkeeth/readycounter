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
import { computeReadinessChecks, readinessScore } from './src/lib/readiness.ts';
import { WEBMCP_TOOL_COUNT } from './src/webmcp/toolManifest.ts';

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
  assert(
    id + ' charges the blocked wall its own published weight',
    lineFor === undefined || checks.find((c) => c.id === lineFor).maxPoints === (blocker === 'captcha' ? 24 : 15),
    blocker + ' costs ' + (lineFor ? checks.find((c) => c.id === lineFor).maxPoints : 0) + ' pts',
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
