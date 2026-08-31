#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { writeFileSync, unlinkSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const script = `
import { CATALOG_ADAPTERS, getCatalogAdapter } from './src/server/catalog-adapter.ts';
const ids = CATALOG_ADAPTERS.map((a) => a.id).sort();
if (ids.join(',') !== 'shopify-admin,url-crawl') {
  console.error('verify-goal: unexpected adapter ids', ids);
  process.exit(1);
}
for (const id of ['url-crawl', 'shopify-admin']) {
  if (getCatalogAdapter(id).id !== id) {
    console.error('verify-goal: getCatalogAdapter failed for', id);
    process.exit(1);
  }
}
console.log('verify-goal: CatalogAdapter seam OK');
`;
const tmp = path.join(root, '.verify-goal-tmp.mjs');
writeFileSync(tmp, script);
try {
  execSync(`npx tsx ${tmp}`, { cwd: root, stdio: 'inherit' });
} finally {
  unlinkSync(tmp);
}
