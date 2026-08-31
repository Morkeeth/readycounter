#!/usr/bin/env node
/**
 * Batch-audit real storefronts and print a findings table.
 * Usage: node scripts/audit-shops.mjs [url...]
 *        node scripts/audit-shops.mjs   # runs default sample list
 */

import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
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

const args = process.argv.slice(2);
const publishToKv = args.includes('--publish');
const useCurated = args.includes('--curated');
const urlArgs = args.filter((a) => !a.startsWith('--'));

const DEFAULT_SHOPS = [
  'https://colourpop.com',
  'https://www.tentree.com',
  'https://jeffreestarcosmetics.com',
  'https://www.brooklinen.com',
  'https://www.gymshark.com',
  'https://www.allbirds.com',
  'https://kyliecosmetics.com',
];

function loadCuratedUrls() {
  const file = path.join(root, 'src', 'data', 'curated-dtc.json');
  // Prefer src/data (bundled with UI); fall back to audits/ for older checkouts
  const fallback = path.join(root, 'audits', 'curated-dtc.json');
  const raw = JSON.parse(
    readFileSync(existsSync(file) ? file : fallback, 'utf8'),
  );
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

const shopUrls = urlArgs.length ? urlArgs : useCurated ? loadCuratedUrls() : DEFAULT_SHOPS;

async function main() {
  const { auditStorefrontUrl } = await import('../src/server/url-audit.ts');
  const { computeAuditFindings } = await import('../src/lib/audit-findings.ts');
  const { WEBMCP_TOOL_COUNT } = await import('../src/webmcp/toolManifest.ts');

  const rows = [];
  for (const url of shopUrls) {
    process.stderr.write(`Auditing ${url}…\n`);
    const result = await auditStorefrontUrl(url);
    if (!result.ok) {
      rows.push({ url, error: result.error });
      continue;
    }
    const { findings, summary } = computeAuditFindings(
      result.store.merchant,
      result.store.products,
      result.store.audit,
      WEBMCP_TOOL_COUNT,
    );
    rows.push({
      url,
      storeId: result.store.id,
      method: result.meta.method,
      products: result.meta.productCount,
      gtinPct: result.meta.signals.gtinCoverage,
      offerPct: result.meta.signals.offerPct,
      policySmoke: result.meta.policySmoke
        ? {
            measurable: result.meta.policySmoke.measurable,
            privacyOk: result.meta.policySmoke.privacyOk,
            termsOk: result.meta.policySmoke.termsOk,
          }
        : undefined,
      captchaHint: result.meta.signals.captchaHints,
      catalogScore: summary.catalogScore,
      catalogBudget: summary.catalogBudget,
      sandboxScore: summary.fullScore,
      unmeasured: summary.unmeasuredLineIds.length,
      pageLine: findings.find((f) => f.id === 'page_structure'),
      feedLine: findings.find((f) => f.id === 'feed_price_match'),
    });
  }

  const outDir = path.join(root, 'audits');
  mkdirSync(outDir, { recursive: true });
  const stamp = new Date().toISOString().slice(0, 10);
  const outFile = path.join(outDir, `batch-${stamp}.json`);
  writeFileSync(outFile, JSON.stringify(rows, null, 2));

  console.log('\n| Store | Method | SKUs | GTIN% | Catalog | Sandbox* | Signals |');
  console.log('|-------|--------|------|-------|---------|----------|---------|');
  for (const r of rows) {
    if (r.error) {
      console.log(`| ${r.url.slice(0, 40)} | FAIL | — | — | — | — | ${r.error.slice(0, 40)} |`);
      continue;
    }
    const sig = [r.captchaHint ? 'captcha?' : '', r.gtinPct < 50 ? 'low-gtin' : ''].filter(Boolean).join(',') || '—';
    console.log(
      `| ${r.url.replace(/^https?:\/\/(www\.)?/, '').slice(0, 22)} | ${r.method} | ${r.products} | ${r.gtinPct}% | ${r.catalogScore}/${r.catalogBudget} | ${r.sandboxScore}/100 | ${sig} |`,
    );
  }
  console.log('\n* Sandbox score assumes demo checkout flags — misleading for crawls. Use catalog score.');
  console.log(`Full JSON: ${outFile}`);

  if (publishToKv) {
    const { saveAuditBatchToKv } = await import('../src/server/render-partnership.ts');
    const kvRows = rows.map((r) => ({
      url: r.url,
      storeId: r.storeId,
      catalogScore: r.catalogScore,
      catalogBudget: r.catalogBudget,
      gtinPct: r.gtinPct,
      captchaHint: r.captchaHint,
      method: r.method,
      products: r.products,
      error: r.error,
    }));
    await saveAuditBatchToKv(kvRows);
    console.log(`\nPublished batch to Render KV (rc:render:audit-batch:latest)`);
  }

  console.log('\nNext: OAuth for blocked stores · agent journey for checkout lines · tweak weights in src/lib/audit-findings.ts');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
