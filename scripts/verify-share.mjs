#!/usr/bin/env node
/** Share link roundtrip — no browser. Run: node scripts/verify-share.mjs */
import { execSync } from 'node:child_process';
import { writeFileSync, unlinkSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const script = `
import { encodeSharePayload, decodeSharePayload } from './src/lib/shareSession.ts';

const payload = {
  v: 1,
  storeId: 'ember-oak',
  order: { lines: [{ lineId: 'l1', productId: 'sku-espresso', quantity: 2, addedBy: 'human', updatedAt: 1 }], currency: 'USD' },
  merchant: { storeName: 'Test', checkoutRequiresCaptcha: true, checkoutRequiresAccount: false },
  funnel: [{ step: 'add_to_order', actor: 'agent', timestamp: 1 }],
};

const enc = encodeSharePayload(payload);
const dec = decodeSharePayload(enc);
console.log('encode length:', enc.length);
console.log('roundtrip storeId:', dec?.storeId === payload.storeId);
console.log('roundtrip line count:', dec?.order.lines.length === 1);
console.log('roundtrip qty:', dec?.order.lines[0]?.quantity === 2);
console.log('under 8kb:', enc.length < 8192);
`;

const tmp = path.join(root, '.verify-share-tmp.mts');
writeFileSync(tmp, script);
try {
  execSync(`npx --yes tsx ${tmp}`, { cwd: root, stdio: 'inherit' });
} finally {
  unlinkSync(tmp);
}
