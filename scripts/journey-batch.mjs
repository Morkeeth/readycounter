#!/usr/bin/env node
/**
 * R4 — agent journey pass rate across audited stores in KV batch.
 * Usage: npx tsx scripts/journey-batch.mjs
 */

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

function loadLatestBatch() {
  const auditsDir = path.join(root, 'audits');
  const files = readdirSync(auditsDir)
    .filter((name) => name.startsWith('batch-') && name.endsWith('.json'))
    .sort()
    .reverse();
  if (files.length === 0) throw new Error('No batch-*.json in audits/');
  return JSON.parse(readFileSync(path.join(auditsDir, files[0]), 'utf8'));
}

async function main() {
  const { simulateAgentJourney } = await import('../src/lib/agent-journey.ts');
  const { getStore } = await import('../src/data/stores.ts');
  const { WEBMCP_TOOL_COUNT } = await import('../src/webmcp/toolManifest.ts');

  const batch = loadLatestBatch();
  const rows = [];

  for (const entry of batch) {
    if (entry.error || !entry.storeId) {
      rows.push({ url: entry.url, skipped: true, reason: entry.error ?? 'no storeId' });
      continue;
    }
    if (entry.storeId.startsWith('audit-')) {
      rows.push({
        url: entry.url,
        storeId: entry.storeId,
        skipped: true,
        reason: 'KV-only audit store — journey runs in UI after import',
        captchaHint: entry.captchaHint,
      });
      continue;
    }
    const store = getStore(entry.storeId);
    const journey = simulateAgentJourney(
      {
        storeId: store.id,
        merchant: store.merchant,
        searchCatalog: (q) =>
          store.products
            .filter((p) => !q?.in_stock_only || p.inStock)
            .map((p) => ({ id: p.id, name: p.name, price: p.price })),
        getProduct: (id) => store.products.find((p) => p.id === id) ?? null,
        addToOrder: () => ({ ok: true }),
        getOrder: () => ({ lines: [], subtotal: 0, currency: 'USD' }),
        prepareCheckout: () => ({
          ok: !store.merchant.checkoutRequiresCaptcha && !store.merchant.checkoutRequiresAccount,
          blocked: store.merchant.checkoutRequiresCaptcha
            ? 'captcha'
            : store.merchant.checkoutRequiresAccount
              ? 'account'
              : undefined,
        }),
        getCatalogProducts: () => store.products,
      },
      WEBMCP_TOOL_COUNT,
    );
    const failedStep = journey.steps.find((s) => !s.ok)?.tool ?? null;
    rows.push({
      url: entry.url,
      storeId: entry.storeId,
      captchaHint: entry.captchaHint,
      checkoutBlocked: journey.checkoutBlocked,
      failedStep,
      readinessScore: journey.readinessScore,
    });
  }

  const ran = rows.filter((r) => !r.skipped);
  const blocked = ran.filter((r) => r.checkoutBlocked);
  const captchaHints = ran.filter((r) => r.captchaHint);

  console.log(JSON.stringify({ ran: ran.length, blocked: blocked.length, captchaHints: captchaHints.length, rows }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
