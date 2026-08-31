#!/usr/bin/env node
/**
 * E1 — OAuth vs crawl pairs (Admin GTIN delta).
 * Requires a previously OAuth-connected shop (token in Render KV) OR
 * SHOPIFY_DEV_SHOP + live session.
 *
 * Usage:
 *   npm run audit:oauth-pairs -- https://colourpop.com your-store.myshopify.com
 *   npm run audit:oauth-pairs -- --from-env
 */

import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

function loadEnvLocal() {
  const file = path.join(root, '.env.local');
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvLocal();

const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const fromEnv = process.argv.includes('--from-env');

async function main() {
  const pairs = [];
  if (fromEnv && process.env.SHOPIFY_DEV_SHOP) {
    pairs.push({
      url: process.env.SHOPIFY_DEV_STOREFRONT_URL ?? `https://${process.env.SHOPIFY_DEV_SHOP.replace('.myshopify.com', '.com')}`,
      shop: process.env.SHOPIFY_DEV_SHOP,
    });
  }
  if (args.length >= 2) {
    for (let i = 0; i + 1 < args.length; i += 2) {
      pairs.push({ url: args[i], shop: args[i + 1] });
    }
  }

  if (!pairs.length) {
    const stub = {
      at: new Date().toISOString(),
      status: 'blocked',
      reason:
        'No OAuth pairs supplied. Connect a shop via Connect → Shopify OAuth, then re-run: npm run audit:oauth-pairs -- <storefrontUrl> <shop.myshopify.com>',
      pairs: [],
    };
    mkdirSync(path.join(root, 'audits'), { recursive: true });
    writeFileSync(path.join(root, 'audits', 'oauth-pairs-latest.json'), JSON.stringify(stub, null, 2));
    writeFileSync(
      path.join(root, 'research', 'experiments', 'E1-oauth-pairs.md'),
      `# E1: OAuth vs crawl pairs

**Date:** ${stub.at.slice(0, 10)}  
**Status:** blocked — no connected shop in this environment

## How to run

1. Connect tab → Install on Shopify (read-only scopes).
2. \`npm run audit:oauth-pairs -- https://YOURSTORE.com your-store.myshopify.com\`
3. Or set \`SHOPIFY_DEV_SHOP\` and \`npm run audit:oauth-pairs -- --from-env\`

## Hypothesis

Admin GTIN% ≫ public crawl GTIN% on the same brand.

## Artifact

\`audits/oauth-pairs-latest.json\` (empty until OAuth available)
`,
    );
    console.log(JSON.stringify(stub, null, 2));
    return;
  }

  const { urlCrawlAdapter, shopifyAdminAdapter } = await import('../src/server/catalog-adapter.ts');
  const { buildAuditCompare } = await import('../src/lib/audit-compare.ts');

  const results = [];
  for (const { url, shop } of pairs) {
    process.stderr.write(`Pair crawl=${url} shop=${shop}…\n`);
    const crawl = await urlCrawlAdapter.fetch(url);
    const oauth = await shopifyAdminAdapter.fetch(shop);
    if (!crawl.ok) {
      results.push({ url, shop, error: `crawl: ${crawl.error}` });
      continue;
    }
    if (!oauth.ok) {
      results.push({ url, shop, error: `oauth: ${oauth.error}` });
      continue;
    }
    const compare = buildAuditCompare(
      url,
      {
        merchant: crawl.store.merchant,
        products: crawl.store.products,
        audit: crawl.meta,
      },
      {
        shop,
        merchant: oauth.store.merchant,
        products: oauth.store.products,
        audit: oauth.meta,
      },
    );
    results.push({
      url,
      shop,
      crawlGtinPct: compare.crawl.gtinPct,
      oauthGtinPct: compare.oauth?.gtinPct ?? null,
      deltaGtin: compare.delta?.gtinPct ?? null,
      crawlCatalog: compare.crawl.catalogScore,
      oauthCatalog: compare.oauth?.catalogScore ?? null,
      headline: compare.headline,
    });
  }

  const out = { at: new Date().toISOString(), status: 'complete', pairs: results };
  mkdirSync(path.join(root, 'audits'), { recursive: true });
  writeFileSync(path.join(root, 'audits', 'oauth-pairs-latest.json'), JSON.stringify(out, null, 2));

  const table = results
    .map((r) =>
      r.error
        ? `| ${r.url} | ${r.shop} | ERR | — | ${r.error} |`
        : `| ${r.url} | ${r.shop} | ${r.crawlGtinPct}% | ${r.oauthGtinPct}% | Δ ${r.deltaGtin} |`,
    )
    .join('\n');

  writeFileSync(
    path.join(root, 'research', 'experiments', 'E1-oauth-pairs.md'),
    `# E1: OAuth vs crawl pairs

**Date:** ${out.at.slice(0, 10)}  
**Status:** complete · N=${results.length}

| Storefront | Shop | Crawl GTIN | Admin GTIN | Delta |
|------------|------|------------|------------|-------|
${table}

## Artifact

\`audits/oauth-pairs-latest.json\`
`,
  );
  console.log(JSON.stringify(out, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
