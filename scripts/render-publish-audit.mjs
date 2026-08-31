#!/usr/bin/env node
/**
 * Load latest audits/batch-*.json and publish summary to Render KV.
 * Usage: npm run render:publish-audit
 */

import { readFileSync, existsSync, readdirSync } from 'node:fs';
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

function latestBatchFile() {
  const dir = path.join(root, 'audits');
  if (!existsSync(dir)) return null;
  const files = readdirSync(dir)
    .filter((f) => f.startsWith('batch-') && f.endsWith('.json'))
    .sort()
    .reverse();
  return files[0] ? path.join(dir, files[0]) : null;
}

async function main() {
  const batchFile = latestBatchFile();
  if (!batchFile) {
    console.error('No audits/batch-*.json found. Run npm run audit:shops first.');
    process.exit(1);
  }

  const raw = JSON.parse(readFileSync(batchFile, 'utf8'));
  const rows = raw.map((r) => ({
    url: r.url,
    storeId: r.storeId,
    catalogScore: r.catalogScore,
    gtinPct: r.gtinPct,
    error: r.error,
  }));

  const { saveAuditBatchToKv } = await import('../src/server/render-partnership.ts');
  await saveAuditBatchToKv(rows);
  console.log(`Published ${rows.length} rows from ${path.basename(batchFile)} → rc:render:audit-batch:latest`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
