#!/usr/bin/env node
/**
 * Cross-join UCP census × crawl batch → committed research artifact.
 * Usage: npm run audit:ucp-vs-crawl
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

function host(u) {
  try {
    return new URL(u).hostname.replace(/^www\./, '');
  } catch {
    return u;
  }
}

function loadLatestBatch() {
  const dir = path.join(root, 'audits');
  const files = readdirSync(dir)
    .filter((f) => f.startsWith('batch-') && f.endsWith('.json'))
    .sort()
    .reverse();
  if (!files.length) throw new Error('No batch-*.json');
  return JSON.parse(readFileSync(path.join(dir, files[0]), 'utf8'));
}

const ucpPath = path.join(root, 'audits', 'ucp-census-latest.json');
if (!existsSync(ucpPath)) {
  console.error('Run npm run audit:ucp-census first');
  process.exit(1);
}

const ucp = JSON.parse(readFileSync(ucpPath, 'utf8'));
const batch = loadLatestBatch();
const batchByHost = new Map(batch.map((r) => [host(r.url), r]));

const joined = [];
for (const u of ucp.rows) {
  const b = batchByHost.get(host(u.url));
  joined.push({
    host: host(u.url),
    url: u.url,
    ucpAvailable: u.available,
    ucpGtinPct: u.gtinPct,
    ucpProducts: u.productCount,
    crawlOk: b ? !b.error : null,
    crawlGtinPct: b && !b.error ? b.gtinPct : null,
    crawlError: b?.error ?? null,
  });
}

const crawlOk = joined.filter((r) => r.crawlOk);
const ucpAndCrawl = joined.filter((r) => r.ucpAvailable && r.crawlOk);
const gapStores = joined.filter(
  (r) => r.ucpAvailable && r.crawlOk && r.crawlGtinPct === 0 && r.ucpGtinPct > 0,
);

const summary = {
  at: new Date().toISOString(),
  crawlCrawled: crawlOk.length,
  ucpAvailable: joined.filter((r) => r.ucpAvailable).length,
  ucpAndCrawl: ucpAndCrawl.length,
  /** Public 0% GTIN but UCP returns identifiers — the product thesis gap */
  ucpGtinWhereCrawlZero: gapStores.length,
  gapStores: gapStores
    .map((r) => ({
      host: r.host,
      ucpGtinPct: r.ucpGtinPct,
      crawlGtinPct: r.crawlGtinPct,
      ucpProducts: r.ucpProducts,
    }))
    .sort((a, b) => b.ucpGtinPct - a.ucpGtinPct),
};

writeFileSync(
  path.join(root, 'research', 'ucp-vs-crawl-latest.json'),
  JSON.stringify(summary, null, 2),
);

const table = summary.gapStores
  .map((r) => `| ${r.host} | ${r.crawlGtinPct}% | **${r.ucpGtinPct}%** | ${r.ucpProducts} |`)
  .join('\n');

writeFileSync(
  path.join(root, 'research', 'experiments', 'E3b-ucp-vs-crawl.md'),
  `# E3b: UCP identifiers vs public crawl GTIN

**Date:** ${summary.at.slice(0, 10)}  
**Inputs:** \`audits/ucp-census-latest.json\` × latest \`audits/batch-*.json\`

## Headline

**${summary.ucpGtinWhereCrawlZero} stores** show **0% GTIN on public crawl** and **>0% GTIN via UCP Catalog MCP**.

That is the ReadyCounter gap in one table: merchant-side / protocol surfaces can hold barcodes while agents scraping \`/products.json\` see none.

## Counts

| Metric | N |
|--------|---|
| Crawl succeeded | ${summary.crawlCrawled} |
| UCP available | ${summary.ucpAvailable} |
| Both UCP + crawl | ${summary.ucpAndCrawl} |
| **UCP GTIN > 0 ∧ crawl GTIN = 0** | **${summary.ucpGtinWhereCrawlZero}** |

## Gap stores

| Host | Crawl GTIN | UCP GTIN | UCP products (sample) |
|------|------------|----------|------------------------|
${table}

## Product implication

\`POST /api/v1/audit/compare\` (crawl + UCP + optional OAuth) is not a nice-to-have — it is how you tell the truth. Rankings from crawl alone understate agent-reachable identity on UCP-capable stores.

## Artifact

\`research/ucp-vs-crawl-latest.json\`
`,
);

console.log(JSON.stringify({ ...summary, gapStores: summary.gapStores.length }, null, 2));
console.log('Wrote research/ucp-vs-crawl-latest.json + research/experiments/E3b-ucp-vs-crawl.md');
