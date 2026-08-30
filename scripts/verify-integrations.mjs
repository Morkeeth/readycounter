#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { writeFileSync, unlinkSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const script = `
import { validateStoreCatalog, toShopifyCatalog } from './src/integrations/shopify-catalog.ts';
import { createRoom, getRoom, patchRoom } from './src/server/room-store.ts';

const ember = validateStoreCatalog('ember-oak');
const neon = validateStoreCatalog('neon-matcha');
console.log('ember-oak feed issues:', ember.issues.length);
console.log('neon-matcha feed issues:', neon.issues.length);
console.log('shopify export products:', toShopifyCatalog('ember-oak').products.length);

const id = createRoom('ember-oak', { storeName: 'T', checkoutRequiresCaptcha: true, checkoutRequiresAccount: false });
const patched = patchRoom(id, { order: { lines: [], currency: 'USD' } });
console.log('room create+patch:', !!getRoom(id) && !!patched);
`;

const tmp = path.join(root, '.verify-int.mts');
writeFileSync(tmp, script);
try {
  execSync(`npx --yes tsx ${tmp}`, { cwd: root, stdio: 'inherit' });
} finally {
  unlinkSync(tmp);
}
