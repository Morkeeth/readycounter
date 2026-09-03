#!/usr/bin/env node
/**
 * Round-trip gzip encode/decode for the audit batch KV payload.
 * Run: node scripts/verify-audit-batch-kv.mjs
 */
import { execSync } from 'node:child_process';
import { writeFileSync, unlinkSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const script = `
import {
  encodeAuditBatchPayload,
  decodeAuditBatchPayload,
} from './src/server/render-partnership.ts';

const sample = {
  at: '2026-09-02T00:00:00.000Z',
  shopCount: 20,
  succeeded: 12,
  avgCatalogScore: 0,
  avgGtinPct: 0,
  rows: Array.from({ length: 20 }, (_, i) => ({
    url: \`https://store-\${i}.example.com\`,
    storeId: \`audit-\${i}\`,
    catalogScore: i % 3,
    gtinPct: 0,
    method: 'shopify-products-json',
    products: 40 + i,
    ...(i % 4 === 0 ? { error: 'blocked' } : {}),
  })),
};

const encoded = encodeAuditBatchPayload(sample);
if (!encoded.startsWith('gz1:')) {
  console.error('FAIL encode must use gz1: prefix');
  process.exit(1);
}
const plain = JSON.stringify(sample);
if (encoded.length >= plain.length) {
  console.error('FAIL gzip should shrink payload', encoded.length, plain.length);
  process.exit(1);
}
const decoded = decodeAuditBatchPayload(encoded);
if (!decoded || decoded.shopCount !== 20 || decoded.rows.length !== 20) {
  console.error('FAIL decode mismatch', decoded);
  process.exit(1);
}
const legacy = decodeAuditBatchPayload(JSON.stringify({
  at: sample.at,
  shopCount: 2,
  succeeded: 1,
  avgCatalogScore: 0,
  avgGtinPct: 0,
  rows: sample.rows.slice(0, 2),
}));
if (!legacy || legacy.succeeded !== 1) {
  console.error('FAIL legacy plain JSON decode');
  process.exit(1);
}
console.log('ok   audit batch gzip round-trip', encoded.length, 'vs plain', plain.length);
console.log('verify-audit-batch-kv: all checks pass');
`;

const tmp = path.join(root, '.verify-audit-batch-kv-tmp.mjs');
writeFileSync(tmp, script);
try {
  execSync(`npx tsx ${tmp}`, { cwd: root, stdio: 'inherit' });
} finally {
  unlinkSync(tmp);
}
