#!/usr/bin/env node
/** Assert stranger probe module exports exactly 8 checks. */

import { execSync } from 'node:child_process';
import { writeFileSync, unlinkSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const script = `
import { runStrangerProbes } from './src/lib/stranger-probes.ts';

const probes = runStrangerProbes({
  url: 'https://colourpop.com',
  auditOk: true,
  productCount: 12,
  catalogScore: 8,
  catalogBudget: 24,
  gtinPct: 0,
  offerPct: 50,
  storeId: 'ember-oak',
  isFieldCrawl: true,
  crawlMethod: 'shopify-products-json',
});

if (probes.length !== 8) {
  console.error('FAIL stranger probes count — want 8 got', probes.length);
  process.exit(1);
}

console.log('ok   stranger probes = 8 —', probes.map((p) => p.tool).join(', '));
console.log('verify-stranger-probes: all checks pass');
`;

const tmp = path.join(root, '.verify-stranger-probes-tmp.mjs');
writeFileSync(tmp, script);
try {
  execSync(`npx tsx ${tmp}`, { cwd: root, stdio: 'inherit' });
} finally {
  unlinkSync(tmp);
}
