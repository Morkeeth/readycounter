#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { writeFileSync, unlinkSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const script = `
let __fails = 0;
function ok(label, cond, detail) {
  console.log(label + ':', cond === true ? 'true' : cond, detail === undefined ? '' : detail);
  if (cond !== true) { __fails += 1; console.log('  ASSERT FAILED: ' + label); }
}
function done() {
  if (__fails > 0) { console.log('FAIL: ' + __fails + ' assertion(s)'); process.exit(1); }
}
import { compareToField, buildAuditDeepLink } from './src/lib/field-compare.ts';

const rows = [
  { url: 'https://a.com', catalogScore: 20, gtinPct: 0, vertical: 'beauty' },
  { url: 'https://b.com', catalogScore: 10, gtinPct: 0, vertical: 'beauty' },
  { url: 'https://c.com', catalogScore: 5, gtinPct: 0, vertical: 'beauty' },
  { url: 'https://e.com', catalogScore: 8, gtinPct: 0, vertical: 'beauty' },
  { url: 'https://f.com', catalogScore: 12, gtinPct: 0, vertical: 'beauty' },
  { url: 'https://d.com', catalogScore: 15, gtinPct: 0, vertical: 'apparel' },
];
const meta = { shopCount: 148, succeeded: 78, avgCatalogScore: 8, avgGtinPct: 0 };

const r = compareToField(
  { url: 'https://b.com', catalogScore: 10, catalogBudget: 24, gtinPct: 0, productCount: 24 },
  rows,
  meta,
);
ok('peer rank among batch', r.catalogRank === 4, String(r.catalogRank));
ok('receipt mentions host', r.receiptLine.includes('b.com'));
ok('deep link has audit_url', buildAuditDeepLink('https://b.com').includes('audit_url='));

const empty = compareToField(
  { url: 'https://new.com', catalogScore: 12, catalogBudget: 24, gtinPct: 0, productCount: 20 },
  [],
  meta,
);
ok('empty batch still returns host', empty.host === 'new.com');
done();
`;

const tmp = path.join(root, '.verify-field-compare.mts');
writeFileSync(tmp, script);
try {
  execSync(`npx --yes tsx ${tmp}`, { cwd: root, stdio: 'inherit' });
} catch {
  unlinkSync(tmp);
  process.exit(1);
} finally {
  unlinkSync(tmp);
}
