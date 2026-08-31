#!/usr/bin/env node
/**
 * E3 — UCP / Storefront Catalog MCP census on curated DTC URLs.
 * Usage: npm run audit:ucp-census
 */

import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

function loadCuratedUrls() {
  const file = path.join(root, 'src', 'data', 'curated-dtc.json');
  const fallback = path.join(root, 'audits', 'curated-dtc.json');
  const raw = JSON.parse(readFileSync(existsSync(file) ? file : fallback, 'utf8'));
  const seen = new Set();
  const urls = [];
  for (const list of Object.values(raw.verticals ?? {})) {
    for (const u of list) {
      if (!seen.has(u)) {
        seen.add(u);
        urls.push(u);
      }
    }
  }
  return urls;
}

async function main() {
  const { probeUcpCatalog } = await import('../src/server/ucp-probe.ts');
  const urls = loadCuratedUrls();
  const rows = [];
  let available = 0;
  let withGtin = 0;

  for (const url of urls) {
    process.stderr.write(`UCP probe ${url}…\n`);
    const snap = await probeUcpCatalog(url);
    if (snap.available) available += 1;
    if (snap.gtinPct > 0) withGtin += 1;
    rows.push({
      url,
      available: snap.available,
      gtinPct: snap.gtinPct,
      productCount: snap.productCount,
      tools: snap.tools,
      error: snap.error ?? null,
      httpStatus: snap.httpStatus ?? null,
    });
  }

  const summary = {
    at: new Date().toISOString(),
    attempted: urls.length,
    ucpAvailable: available,
    ucpRatePct: urls.length ? Math.round((available / urls.length) * 100) : 0,
    ucpWithGtin: withGtin,
    rows,
  };

  mkdirSync(path.join(root, 'audits'), { recursive: true });
  const outFile = path.join(root, 'audits', 'ucp-census-latest.json');
  writeFileSync(outFile, JSON.stringify(summary, null, 2));

  // Slim snapshot committed for rankings UI (crawl × UCP join without gitignored audits/).
  const slim = {
    at: summary.at,
    attempted: summary.attempted,
    ucpAvailable: summary.ucpAvailable,
    ucpWithGtin: summary.ucpWithGtin,
    rows: summary.rows.map((r) => ({
      url: r.url,
      available: !!r.available,
      gtinPct: typeof r.gtinPct === 'number' ? r.gtinPct : 0,
      productCount: typeof r.productCount === 'number' ? r.productCount : 0,
    })),
  };
  const slimFile = path.join(root, 'src', 'data', 'ucp-census.json');
  writeFileSync(slimFile, `${JSON.stringify(slim, null, 2)}\n`);
  console.log(`Wrote ${slimFile}`);

  const md = `# E3: UCP Storefront Catalog census

**Date:** ${summary.at.slice(0, 10)}  
**Command:** \`npm run audit:ucp-census\`

## Results

| Metric | Value |
|--------|-------|
| Attempted | ${summary.attempted} |
| UCP /api/ucp/mcp available | **${summary.ucpAvailable}** (${summary.ucpRatePct}%) |
| Probes with GTIN% > 0 | **${summary.ucpWithGtin}** |

## Finding

${
  summary.ucpAvailable === 0
    ? 'No curated store responded as an available UCP catalog MCP in this run — agents still depend on public feeds or Admin/OAuth for these brands.'
    : `${summary.ucpAvailable}/${summary.attempted} exposed UCP MCP; ${summary.ucpWithGtin} returned GTIN via UCP tools.`
}

## Artifact

\`${outFile.replace(root + '/', '')}\`
`;

  writeFileSync(path.join(root, 'research', 'experiments', 'E3-ucp-census.md'), md);
  console.log(JSON.stringify({ attempted: summary.attempted, ucpAvailable: available, ucpRatePct: summary.ucpRatePct, ucpWithGtin: withGtin }, null, 2));
  console.log(`Wrote ${outFile}`);
  console.log('Wrote research/experiments/E3-ucp-census.md');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
