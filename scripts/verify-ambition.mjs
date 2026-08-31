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
import { importShopifyFeed, toShopifyCatalog } from './src/integrations/shopify-catalog.ts';
import { applyAutopilotFix, suggestFixes } from './src/lib/autopilot.ts';
import { simulateAgentJourney } from './src/lib/agent-journey.ts';
import { WEBMCP_TOOL_COUNT, WEBMCP_TOOL_NAMES } from './src/webmcp/toolManifest.ts';
import { STORES } from './src/data/stores.ts';
import { computeReadinessChecks, readinessScore } from './src/lib/readiness.ts';
import { subscribeRoom, publishRoom } from './src/server/room-events.ts';
import { createRoom, getRoom } from './src/server/room-store.ts';

console.log('tool count:', WEBMCP_TOOL_COUNT);
console.log('tool names:', WEBMCP_TOOL_NAMES.length);

const feed = toShopifyCatalog('neon-matcha');
const imported = importShopifyFeed(feed, { storeId: 'test-import' });
console.log('import products:', imported.products.length);

const neon = STORES['neon-matcha'];
const suggestions = suggestFixes([], neon.merchant, neon.products);
console.log('neon suggestions:', suggestions.map(s => s.id).join(','));

const synced = applyAutopilotFix('sync_feed_prices', neon.merchant, neon.products);
const mismatches = synced.products.filter(p => p.feedPrice !== p.price).length;
ok('sync feed mismatches after fix is 0', mismatches === 0, mismatches);

const mockStore = {
  storeId: 'ember-oak',
  merchant: { ...STORES['ember-oak'].merchant, checkoutRequiresCaptcha: true },
  feedPricePatches: {},
  getCatalogProducts: () => STORES['ember-oak'].products,
  searchCatalog: ({ in_stock_only }) =>
    STORES['ember-oak'].products.filter(p => !in_stock_only || p.inStock),
  getProduct: (id) => STORES['ember-oak'].products.find(p => p.id === id) ?? null,
  addToOrder: () => ({ ok: true, lineId: 'x' }),
  getOrder: () => ({ lines: [{ lineId: 'x', productId: 'sku-espresso', quantity: 1 }], currency: 'USD', subtotal: 18, lineCount: 1 }),
  prepareCheckout: () => ({ ok: false, blocked: true, reason: 'captcha' }),
};
const journey = simulateAgentJourney(mockStore, WEBMCP_TOOL_COUNT);
console.log('journey steps:', journey.steps.length);
ok('journey blocked', journey.checkoutBlocked === true);

const roomId = createRoom('ember-oak', STORES['ember-oak'].merchant);
let events = 0;
const unsub = subscribeRoom(roomId, () => { events += 1; });
publishRoom(roomId, getRoom(roomId));
unsub();
ok('room sse pub', events === 1);

const score = readinessScore(
  computeReadinessChecks(STORES['ember-oak'].merchant, WEBMCP_TOOL_COUNT, STORES['ember-oak'].products),
);
console.log('ember score with 16 tools:', score);
done();
`;

const tmp = path.join(root, '.verify-ambition.mts');
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
