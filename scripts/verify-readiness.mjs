#!/usr/bin/env node
/**
 * Cold verification of merchant readiness score (no browser).
 * Run: node scripts/verify-readiness.mjs
 */
import { execSync } from 'node:child_process';
import { writeFileSync, unlinkSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const script = `
import { computeReadinessChecks, readinessScore } from './src/lib/readiness.ts';
import { MERCHANT_DEFAULTS, PRODUCTS } from './src/data/catalog.ts';
import { useShopStore } from './src/store/shopStore.ts';

const withCaptcha = computeReadinessChecks({ ...MERCHANT_DEFAULTS, checkoutRequiresCaptcha: true }, 10, PRODUCTS);
const withoutCaptcha = computeReadinessChecks({ ...MERCHANT_DEFAULTS, checkoutRequiresCaptcha: false }, 10, PRODUCTS);
const scoreOn = readinessScore(withCaptcha);
const scoreOff = readinessScore(withoutCaptcha);

console.log('SKU count:', PRODUCTS.length);
console.log('Score CAPTCHA ON:', scoreOn);
console.log('Score CAPTCHA OFF:', scoreOff);
console.log('Score delta:', scoreOff - scoreOn);
console.log('CAPTCHA ON < 70:', scoreOn < 70);
console.log('CAPTCHA OFF >= 70:', scoreOff >= 70);

const gtinCount = PRODUCTS.filter(p => p.gtin).length;
console.log('GTIN coverage:', gtinCount + '/' + PRODUCTS.length);

useShopStore.setState({ funnel: [], order: { lines: [], currency: 'USD' } });
const store = useShopStore.getState();
store.recordFunnel('catalog_search', 'agent');
store.addToOrder('sku-espresso', 1, 'agent');
store.prepareCheckout('agent');
const counts = useShopStore.getState().funnel.reduce((acc, e) => {
  acc[e.step] = (acc[e.step] ?? 0) + 1;
  return acc;
}, {});
console.log('Funnel after harness sequence:', JSON.stringify(counts));
console.log('catalog_search >= 1:', (counts.catalog_search ?? 0) >= 1);
console.log('add_to_order >= 1:', (counts.add_to_order ?? 0) >= 1);
console.log('checkout_prepare >= 1:', (counts.checkout_prepare ?? 0) >= 1);
console.log('checkout_blocked >= 1 (CAPTCHA default):', (counts.checkout_blocked ?? 0) >= 1);
`;

const tmp = path.join(root, '.verify-tmp.mts');
writeFileSync(tmp, script);
try {
  execSync(`npx --yes tsx ${tmp}`, { cwd: root, stdio: 'inherit' });
} finally {
  unlinkSync(tmp);
}
