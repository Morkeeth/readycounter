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

const withCaptcha = computeReadinessChecks({ ...MERCHANT_DEFAULTS, checkoutRequiresCaptcha: true }, 8);
const withoutCaptcha = computeReadinessChecks({ ...MERCHANT_DEFAULTS, checkoutRequiresCaptcha: false }, 8);
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
`;

const tmp = path.join(root, '.verify-tmp.mts');
writeFileSync(tmp, script);
try {
  execSync(`npx --yes tsx ${tmp}`, { cwd: root, stdio: 'inherit' });
} finally {
  unlinkSync(tmp);
}
