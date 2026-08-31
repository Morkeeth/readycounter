#!/usr/bin/env node
/**
 * R6 — analyze batch JSON by vertical from curated-dtc.json
 * Usage: npm run audit:analyze
 */

import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

function loadCuratedVerticals() {
  const file = path.join(root, 'src', 'data', 'curated-dtc.json');
  const fallback = path.join(root, 'audits', 'curated-dtc.json');
  const raw = JSON.parse(readFileSync(existsSync(file) ? file : fallback, 'utf8'));
  const urlToVertical = new Map();
  const primary = [
    'beauty',
    'apparel',
    'home',
    'food',
    'wellness',
    'pet',
    'accessories',
    'fun',
    'outdoor',
    'kids',
  ];
  for (const vertical of primary) {
    for (const u of raw.verticals?.[vertical] ?? []) {
      const n = u.replace(/\/$/, '');
      if (!urlToVertical.has(n)) urlToVertical.set(n, vertical);
    }
  }
  for (const [vertical, urls] of Object.entries(raw.verticals ?? {})) {
    if (primary.includes(vertical)) continue;
    for (const u of urls) {
      const n = u.replace(/\/$/, '');
      if (!urlToVertical.has(n)) urlToVertical.set(n, vertical);
    }
  }
  return urlToVertical;
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

function norm(url) {
  return url.replace(/\/$/, '').replace(/^http:/, 'https:');
}

function failureReason(error) {
  const e = error ?? '';
  if (e.includes('403')) return '403';
  if (e.includes('429')) return '429';
  if (e.includes('400')) return '400';
  if (/timeout/i.test(e)) return 'timeout';
  if (e.includes('No products')) return 'no-products-json';
  return 'other';
}

const verticals = loadCuratedVerticals();
const batch = loadLatestBatch();

const byVertical = new Map();
const failures = {};

for (const row of batch) {
  const v = verticals.get(norm(row.url)) ?? 'unknown';
  if (!byVertical.has(v)) {
    byVertical.set(v, { attempted: 0, crawled: 0, gtinSum: 0, captcha: 0, catalogSum: 0 });
  }
  const bucket = byVertical.get(v);
  bucket.attempted += 1;
  if (row.error) {
    const reason = failureReason(row.error);
    failures[reason] = (failures[reason] ?? 0) + 1;
    continue;
  }
  bucket.crawled += 1;
  bucket.gtinSum += row.gtinPct ?? 0;
  if (row.captchaHint) bucket.captcha += 1;
  bucket.catalogSum += row.catalogScore ?? 0;
}

const summary = [...byVertical.entries()]
  .map(([vertical, s]) => ({
    vertical,
    attempted: s.attempted,
    crawled: s.crawled,
    crawlRate: s.attempted ? Math.round((s.crawled / s.attempted) * 100) : 0,
    avgGtinPct: s.crawled ? Math.round(s.gtinSum / s.crawled) : null,
    captchaPct: s.crawled ? Math.round((s.captcha / s.crawled) * 100) : null,
    avgCatalog: s.crawled ? Math.round(s.catalogSum / s.crawled) : null,
  }))
  .sort((a, b) => b.attempted - a.attempted);

const crawled = batch.filter((r) => !r.error);
const out = {
  at: new Date().toISOString(),
  batchFile: 'latest audits/batch-*.json',
  total: batch.length,
  crawled: crawled.length,
  avgGtinPct: crawled.length
    ? Math.round(crawled.reduce((a, r) => a + (r.gtinPct ?? 0), 0) / crawled.length)
    : 0,
  failures,
  byVertical: summary,
};

const outFile = path.join(root, 'audits', 'analysis-latest.json');
writeFileSync(outFile, JSON.stringify(out, null, 2));

console.log(JSON.stringify(out, null, 2));
console.log(`\nWrote ${outFile}`);
