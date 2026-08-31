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
import { extractJsonLdBlocks } from './src/server/url-audit.ts';

const html = \`
<html><head>
<script type="application/ld+json">{"@graph":[{"@type":"Product","name":"Test Bean","sku":"sku-1","offers":{"price":"12.00"}}]}</script>
</head></html>\`;

const blocks = extractJsonLdBlocks(html);
ok('json-ld blocks parsed', blocks.length === 1);
done();
`;

const tmp = path.join(root, '.verify-url-audit.mts');
writeFileSync(tmp, script);
try {
  execSync(`npx --yes tsx ${tmp}`, { cwd: root, stdio: 'inherit' });
} catch {
  unlinkSync(tmp);
  process.exit(1);
} finally {
  unlinkSync(tmp);
}
