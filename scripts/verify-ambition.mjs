#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { writeFileSync, unlinkSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const script = `
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
console.log('sync feed mismatches after fix:', mismatches);

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
console.log('journey blocked:', journey.checkoutBlocked);

const roomId = createRoom('ember-oak', STORES['ember-oak'].merchant);
let events = 0;
const unsub = subscribeRoom(roomId, () => { events += 1; });
publishRoom(roomId, getRoom(roomId));
unsub();
console.log('room sse pub:', events === 1);

const score = readinessScore(
  computeReadinessChecks(STORES['ember-oak'].merchant, WEBMCP_TOOL_COUNT, STORES['ember-oak'].products),
);
console.log('ember score with 16 tools:', score);
`;

const tmp = path.join(root, '.verify-ambition.mts');
writeFileSync(tmp, script);
try {
  execSync(`npx --yes tsx ${tmp}`, { cwd: root, stdio: 'inherit' });
} finally {
  unlinkSync(tmp);
}
