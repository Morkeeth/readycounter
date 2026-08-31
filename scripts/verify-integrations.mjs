#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { writeFileSync, unlinkSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
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
import { validateStoreCatalog, toShopifyCatalog } from './src/integrations/shopify-catalog.ts';
import { createRoomSync, getRoomSync, patchRoomSync } from './src/server/room-store.ts';

const ember = validateStoreCatalog('ember-oak');
const neon = validateStoreCatalog('neon-matcha');
console.log('ember-oak feed issues:', ember.issues.length);
console.log('neon-matcha feed issues:', neon.issues.length);
console.log('shopify export products:', toShopifyCatalog('ember-oak').products.length);

const id = createRoomSync('ember-oak', { storeName: 'T', checkoutRequiresCaptcha: true, checkoutRequiresAccount: false });
const patched = patchRoomSync(id, { order: { lines: [], currency: 'USD' } });
ok('room create+patch', !!getRoomSync(id) && !!patched);
done();
`;

const tmp = path.join(root, '.verify-int.mts');
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
