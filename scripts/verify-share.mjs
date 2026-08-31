#!/usr/bin/env node
/** Share link roundtrip — no browser. Run: node scripts/verify-share.mjs */
import { execSync } from 'node:child_process';
import { writeFileSync, unlinkSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const script = `
let __fails = 0;
function ok(label, cond, detail) {
  // L10 gate sweep 2026-08-31 07:1x: these lines used to be console.log(label, <boolean>), so the
  // script printed "false" and still exited 0. Three siblings were fixed in wave 5 for exactly
  // this; these were not. A check that cannot exit non-zero is not a check.
  console.log(label + ':', cond === true ? 'true' : cond, detail === undefined ? '' : detail);
  if (cond !== true) { __fails += 1; console.log('  ASSERT FAILED: ' + label); }
}
function done() {
  if (__fails > 0) { console.log('FAIL: ' + __fails + ' assertion(s)'); process.exit(1); }
}
import { buildSharePayload, encodeSharePayload, decodeSharePayload } from './src/lib/shareSession.ts';
import { importShopifyFeed, toShopifyCatalog } from './src/integrations/shopify-catalog.ts';
import { isBuiltinStore } from './src/data/stores.ts';

const payload = {
  storeId: 'ember-oak',
  order: { lines: [{ lineId: 'l1', productId: 'sku-espresso', quantity: 2, addedBy: 'human', updatedAt: 1 }], currency: 'USD' },
  merchant: { storeName: 'Test', checkoutRequiresCaptcha: true, checkoutRequiresAccount: false },
  funnel: [{ step: 'add_to_order', actor: 'agent', timestamp: 1 }],
};

const built = buildSharePayload(payload);
const enc = encodeSharePayload(built);
const dec = decodeSharePayload(enc);
console.log('encode length:', enc.length);
ok('roundtrip storeId', dec?.storeId === payload.storeId);
ok('roundtrip line count', dec?.order.lines.length === 1);
ok('roundtrip qty', dec?.order.lines[0]?.quantity === 2);
ok('builtin omits store', !built.store);
ok('under 16kb', enc.length < 16384, enc.length);

const imported = importShopifyFeed(toShopifyCatalog('neon-matcha'), { storeId: 'share-test-import' });
const importPayload = buildSharePayload({
  storeId: imported.id,
  order: { lines: [], currency: 'USD' },
  merchant: imported.merchant,
  funnel: [],
});
const importEnc = encodeSharePayload(importPayload);
const importDec = decodeSharePayload(importEnc);
ok('import embeds store', !!importPayload.store);
ok('import roundtrip catalog', importDec?.store?.products.length === imported.products.length);
ok('import not builtin', !isBuiltinStore(imported.id));
ok('import encoded under 32kb', importEnc.length < 32768, importEnc.length);
done();
`;

const tmp = path.join(root, '.verify-share-tmp.mts');
writeFileSync(tmp, script);
try {
  execSync(`npx --yes tsx ${tmp}`, { cwd: root, stdio: 'inherit' });
} catch {
  // the child already printed which assertion failed; exit red without a Node stack dump
  unlinkSync(tmp);
  process.exit(1);
} finally {
  unlinkSync(tmp);
}
