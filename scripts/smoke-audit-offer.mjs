#!/usr/bin/env node
/**
 * RC-S2 policy smoke — audit path must return structured offer + ACP policy fields.
 * Cold-clone safe: fixture assertions first; optional live URL when AUDIT_SMOKE_URL set.
 *
 * Usage:
 *   node scripts/smoke-audit-offer.mjs
 *   AUDIT_SMOKE_URL=https://colourpop.com node scripts/smoke-audit-offer.mjs
 */

import { execSync } from 'node:child_process';
import { writeFileSync, unlinkSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const script = `
let __fails = 0;
function ok(label, cond, detail) {
  const line = label + ': ' + (cond === true ? 'true' : cond) + (detail === undefined ? '' : ' ' + detail);
  console.log(line);
  if (cond !== true) { __fails += 1; console.log('  ASSERT FAILED: ' + label); }
}
function done() {
  if (__fails > 0) { console.log('FAIL: ' + __fails + ' assertion(s)'); process.exit(1); }
  console.log('smoke-audit-offer: all checks pass');
}

import { jsonLdOfferCoverage, catalogOfferCoverage } from './src/lib/offer-measure.ts';
import { buildAuditOfferBlock } from './src/lib/audit-measurement.ts';
import { getSource } from './src/data/sources.ts';
import { auditStorefrontUrl } from './src/server/url-audit.ts';

// --- fixture: JSON-LD Offer measurement ---
const nodes = [
  { '@type': 'Product', name: 'A', offers: { price: '10.00', priceCurrency: 'USD', availability: 'InStock' } },
  { '@type': 'Product', name: 'B', offers: { price: '5.00' } },
  { '@type': 'Product', name: 'C' },
];
const jsonLd = jsonLdOfferCoverage(nodes);
ok('json-ld offer pct', jsonLd.offerPct === 67, 'got ' + jsonLd.offerPct);
ok('json-ld complete offer pct', jsonLd.completeOfferPct === 33, 'got ' + jsonLd.completeOfferPct);

const catalog = catalogOfferCoverage([
  { price: 12, currency: 'USD', inStock: true },
  { price: 0, currency: 'USD', inStock: true },
]);
ok('catalog offer pct', catalog.offerPct === 50, 'got ' + catalog.offerPct);

// --- cited benchmark from sources.ts (re-derived, not carried) ---
const bench = getSource('schema_offer_gap');
const block = buildAuditOfferBlock({
  productsJson: true,
  jsonLdBlocks: 0,
  gtinCoverage: 0,
  offerCoverage: 67,
  completeOfferCoverage: 33,
  offerWithCount: 2,
  offerTotal: 3,
  captchaHints: false,
  accountWallHints: false,
  checkoutProbed: false,
});
ok('offer block cites schema_offer_gap', block.sourceId === 'schema_offer_gap');
ok('benchmark figure from source row', block.benchmarkFigure === bench.figure, bench.figure);
ok('delta vs benchmark computed', block.deltaVsBenchmarkPp === 67 - 19, 'delta ' + block.deltaVsBenchmarkPp);
console.log('offer measurement:', JSON.stringify({
  pct: block.pct,
  completePct: block.completePct,
  withOffer: block.withOffer,
  total: block.total,
  sourceId: block.sourceId,
  benchmarkFigure: block.benchmarkFigure,
  deltaVsBenchmarkPp: block.deltaVsBenchmarkPp,
}));

// --- optional live crawl ---
const liveUrl = process.env.AUDIT_SMOKE_URL?.trim();
if (liveUrl) {
  const result = await auditStorefrontUrl(liveUrl);
  ok('live audit ok', result.ok === true, result.ok ? '' : result.error);
  if (result.ok) {
    const sig = result.meta.signals;
    ok('live offerCoverage is number', typeof sig.offerCoverage === 'number');
    ok('live offerWithCount <= offerTotal', sig.offerWithCount <= sig.offerTotal);
    const liveOffer = buildAuditOfferBlock(sig);
    ok('live offer block has sourceId', liveOffer.sourceId === 'schema_offer_gap');
    console.log('live offer:', JSON.stringify({
      url: liveUrl,
      method: result.meta.method,
      offerPct: sig.offerCoverage,
      completeOfferPct: sig.completeOfferCoverage,
      withOffer: sig.offerWithCount,
      total: sig.offerTotal,
      sourceId: liveOffer.sourceId,
      benchmarkFigure: liveOffer.benchmarkFigure,
    }));
  }
} else {
  console.log('live crawl skipped (set AUDIT_SMOKE_URL to enable)');
}

done();
`;

const tmp = path.join(root, '.smoke-audit-offer.mts');
writeFileSync(tmp, script);
try {
  execSync(`npx --yes tsx ${tmp}`, { cwd: root, stdio: 'inherit', env: process.env });
} catch {
  unlinkSync(tmp);
  process.exit(1);
} finally {
  try {
    unlinkSync(tmp);
  } catch {
    /* already removed */
  }
}
