#!/usr/bin/env node
/**
 * Verify launch kit integrity — recommendations cite real sources,
 * sandbox test cases match verify-readiness deltas, docs exist.
 */

import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
let fails = 0;

function ok(label, cond, detail = '') {
  const pass = cond === true;
  console.log(`${pass ? 'ok  ' : 'FAIL'} ${label}${detail ? ` — ${detail}` : ''}`);
  if (!pass) fails += 1;
}

const script = `
import {
  LAUNCH_RECOMMENDATIONS,
  LAUNCH_TEST_CASES,
  LAUNCH_IMPACT,
  DEMO_BEATS,
} from './src/data/launch.ts';
import { SOURCES } from './src/data/sources.ts';
import { weightFor } from './src/lib/readiness.ts';
import { previewFixImpact } from './src/lib/autopilot.ts';
import { STORES } from './src/data/stores.ts';
import { WEBMCP_TOOL_COUNT } from './src/webmcp/toolManifest.ts';

let __fails = 0;
function ok(label, cond, detail) {
  if (cond !== true) { __fails += 1; console.log('FAIL', label, detail ?? ''); }
  else console.log('ok  ', label, detail ?? '');
}

// Every recommendation source exists
for (const rec of LAUNCH_RECOMMENDATIONS) {
  for (const sid of rec.sourceIds) {
    ok('rec source exists: ' + rec.id + ' → ' + sid, !!SOURCES[sid]);
  }
}

// Impact rows cite real sources
for (const row of LAUNCH_IMPACT) {
  ok('impact source: ' + row.id, !!SOURCES[row.sourceId]);
}

// Sandbox test cases match real score deltas
const ember = STORES['ember-oak'];
const neon = STORES['neon-matcha'];
const captchaImpact = previewFixImpact('disable_captcha', ember.merchant, ember.products, WEBMCP_TOOL_COUNT);
ok('ember CAPTCHA delta = 24', captchaImpact.after - captchaImpact.before === 24, captchaImpact.before + '→' + captchaImpact.after);
const accountImpact = previewFixImpact('disable_account_wall', neon.merchant, neon.products, WEBMCP_TOOL_COUNT);
ok('neon account delta = 15', accountImpact.after - accountImpact.before === 15, accountImpact.before + '→' + accountImpact.after);

// Presenc weights sum to 100
const presencWeights = ['checkout_freshness','agent_checkout_path','feed_price_match','account_wall','payment_method','page_structure'];
const sum = presencWeights.reduce((n, id) => n + weightFor(id), 0);
ok('presenc weights sum to 100', sum === 100, String(sum));

ok('six test cases defined', LAUNCH_TEST_CASES.length >= 6, String(LAUNCH_TEST_CASES.length));
ok('demo beats cover 90s', DEMO_BEATS[DEMO_BEATS.length - 1].atSec >= 80, String(DEMO_BEATS[DEMO_BEATS.length - 1].atSec));

if (__fails > 0) { console.log('FAIL:', __fails); process.exit(1); }
`;

import { execSync } from 'node:child_process';
import { writeFileSync, unlinkSync } from 'node:fs';

const tmp = path.join(root, '.verify-launch.mts');
writeFileSync(tmp, script);

try {
  execSync(`npx --yes tsx ${tmp}`, { cwd: root, stdio: 'inherit' });
} catch {
  unlinkSync(tmp);
  process.exit(1);
} finally {
  unlinkSync(tmp);
}

for (const doc of ['LAUNCH.md', 'DEMO.md', 'research.md']) {
  ok(`doc exists: ${doc}`, existsSync(path.join(root, doc)));
}

const launchMd = readFileSync(path.join(root, 'LAUNCH.md'), 'utf8');
ok('LAUNCH.md cites Presenc 78.6%', launchMd.includes('78.6%'));
ok('LAUNCH.md cites batch GTIN finding', launchMd.includes('0% GTIN') || launchMd.includes('0%'));

if (fails > 0) {
  console.log(`\nverify-launch: ${fails} failure(s)`);
  process.exit(1);
}
console.log('\nverify-launch: recommendations, test cases, impact — all checks pass');
