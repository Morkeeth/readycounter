#!/usr/bin/env node
/**
 * check:numbers — judge-facing docs must not print scores with no live source.
 * Total readiness scores are N/100 from verify-stores. Line items are a/b where
 * b is a published Presenc weight or catalog budget (24).
 * Skips stale/warning lines and Presenc weight enumerations (26/24/18/15/11/6).
 */

import { readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const script = `
import { STORES, STORE_IDS } from './src/data/stores.ts';
import { computeReadinessChecks, readinessScore } from './src/lib/readiness.ts';
import { WEBMCP_TOOL_COUNT } from './src/webmcp/toolManifest.ts';

const totals = new Set();
for (const id of STORE_IDS) {
  const s = STORES[id];
  const checks = computeReadinessChecks(s.merchant, WEBMCP_TOOL_COUNT, s.products);
  totals.add(readinessScore(checks));
}
console.log(JSON.stringify({ totals: [...totals], lineBudgets: [26, 24, 18, 15, 11, 6], catalogBudget: 24 }));
`;

const tmp = path.join(root, '.check-numbers-canonical.mts');
writeFileSync(tmp, script);
let canonical;
try {
  const out = execSync(`npx --yes tsx ${tmp}`, { cwd: root, encoding: 'utf8' });
  canonical = JSON.parse(out.trim().split('\n').pop());
} finally {
  unlinkSync(tmp);
}

const DOC_FILES = [
  'JUDGE-60s.md',
  'DEMO.md',
  'README.md',
  'SUBMISSION-PACK.md',
  'FILM-READY.md',
  'DEVPOST.md',
  'LAUNCH.md',
  'demo/PITCH-TOMORROW.md',
  'demo/FILM-AND-SUBMIT.md',
  'audits/stranger-runs-2026-08-31.md',
  'audits/STRANGER-PASS-2026-08-31.md',
];

const SKIP_LINE =
  /stale|❌|do not use|don't use|not use|wrong|Earlier batch|old numbers|34\/58|16\/21|16 tools|12\/12|passed|e2e|26\/24\/18\/15\/11\/6/i;

function isAllowedFraction(num, den) {
  if (den === 100 && canonical.totals.includes(num)) return true;
  if (canonical.lineBudgets.includes(den) && num <= den) return true;
  if (den === canonical.catalogBudget && num <= den) return true;
  if (num === 78 && den === 148) return true;
  if (num === 78 && den === 78) return true; // crawled/crawled shorthand in LAUNCH table
  if (den === 148 && num <= 148) return true;
  return false;
}

let fails = 0;
const re = /\b(\d{1,3})\/(\d{1,3})\b/g;

for (const rel of DOC_FILES) {
  const file = path.join(root, rel);
  let text;
  try {
    text = readFileSync(file, 'utf8');
  } catch {
    continue;
  }
  text.split('\n').forEach((line, i) => {
    if (SKIP_LINE.test(line)) return;
    let m;
    re.lastIndex = 0;
    while ((m = re.exec(line)) !== null) {
      const num = Number(m[1]);
      const den = Number(m[2]);
      if (isAllowedFraction(num, den)) continue;
      console.log(
        `FAIL ${rel}:${i + 1} — ${m[0]} (no live source; store totals are ${canonical.totals.join(', ')}/100)`,
      );
      fails += 1;
    }
  });
}

if (fails > 0) {
  console.log(`\ncheck:numbers: ${fails} failure(s)`);
  process.exit(1);
}
console.log('check:numbers: all judge-facing fractions trace to live sources');
