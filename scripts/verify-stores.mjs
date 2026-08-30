#!/usr/bin/env node
/**
 * Multi-store verification — SKU count + readiness differs CAPTCHA vs account.
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

const TOOL_COUNT = 16;
const MIN_SKUS = 6;

for (const id of STORE_IDS) {
  const store = STORES[id];
  const skuCount = store.products.length;
  console.log(\`\${id} SKU count:\`, skuCount);
  console.log(\`\${id} SKU count >= \${MIN_SKUS}:\`, skuCount >= MIN_SKUS);

  const checks = computeReadinessChecks(store.merchant, TOOL_COUNT, store.products);
  const score = readinessScore(checks);
  const checkoutCheck = checks.find((c) => c.id === 'agent_checkout_path');
  console.log(\`\${id} readiness score:\`, score);
  console.log(\`\${id} checkout blocker:\`, checkoutCheck?.stat ?? 'missing');
  console.log(\`\${id} CAPTCHA:\`, store.merchant.checkoutRequiresCaptcha);
  console.log(\`\${id} account wall:\`, store.merchant.checkoutRequiresAccount);
}

const ember = STORES['ember-oak'];
const neon = STORES['neon-matcha'];

const emberScore = readinessScore(
  computeReadinessChecks(ember.merchant, TOOL_COUNT, ember.products),
);
const neonScore = readinessScore(
  computeReadinessChecks(neon.merchant, TOOL_COUNT, neon.products),
);

console.log('ember-oak score:', emberScore);
console.log('neon-matcha score:', neonScore);
console.log('scores differ:', emberScore !== neonScore);
console.log('ember CAPTCHA blocks:', ember.merchant.checkoutRequiresCaptcha === true);
console.log('neon account blocks:', neon.merchant.checkoutRequiresAccount === true);
console.log('failure modes differ (CAPTCHA vs account):',
  ember.merchant.checkoutRequiresCaptcha !== neon.merchant.checkoutRequiresAccount ||
  ember.merchant.checkoutRequiresAccount !== neon.merchant.checkoutRequiresAccount
);
console.log('store count >= 2:', STORE_IDS.length >= 2);
`;

const tmp = path.join(root, '.verify-stores-tmp.mts');
writeFileSync(tmp, script);
try {
  execSync(`npx --yes tsx ${tmp}`, { cwd: root, stdio: 'inherit' });
} finally {
  unlinkSync(tmp);
}
