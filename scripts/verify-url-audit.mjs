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
import { extractJsonLdBlocks, computeOfferPct, runPolicySmoke } from './src/server/url-audit.ts';
import { assertSafeAuditUrl } from './src/server/ssrf.ts';

const html = \`
<html><head>
<script type="application/ld+json">{"@graph":[
  {"@type":"Product","name":"Test Bean","sku":"sku-1","offers":{"price":"12.00","availability":"https://schema.org/InStock"}},
  {"@type":"Product","name":"No Offer","sku":"sku-2"}
]}</script>
</head><body>
<a href="/privacy-policy">Privacy</a>
<a href="/terms-of-service">Terms</a>
</body></html>\`;

const blocks = extractJsonLdBlocks(html);
ok('json-ld blocks parsed', blocks.length === 1);

const nodes = [];
const walk = (node) => {
  if (!node || typeof node !== 'object') return;
  const obj = node;
  if (Array.isArray(obj['@graph'])) { for (const c of obj['@graph']) walk(c); }
  const t = obj['@type'];
  const types = Array.isArray(t) ? t : (typeof t === 'string' ? [t] : []);
  if (types.some((x) => x === 'Product' || String(x).endsWith('Product'))) nodes.push(obj);
};
for (const b of blocks) walk(b);
const offer = computeOfferPct(nodes);
ok('offer pct 50 on fixture', offer.offerPct === 50, String(offer.offerPct));
ok('offer sample size 2', offer.sampleSize === 2, String(offer.sampleSize));

const policy = await runPolicySmoke(html, 'https://example.com');
ok('policy finds privacy url', policy.privacyUrl !== null);
ok('policy finds terms url', policy.termsUrl !== null);

ok('https public host allowed', assertSafeAuditUrl('https://colourpop.com').ok === true);
ok('http blocked', assertSafeAuditUrl('http://colourpop.com').ok === false);
ok('localhost blocked', assertSafeAuditUrl('https://localhost/x').ok === false);
ok('private IP blocked', assertSafeAuditUrl('https://127.0.0.1/').ok === false);
ok('metadata host blocked', assertSafeAuditUrl('https://metadata.google.internal/').ok === false);
ok('link-local blocked', assertSafeAuditUrl('https://169.254.169.254/latest').ok === false);
ok('rfc1918 blocked', assertSafeAuditUrl('https://192.168.1.1/').ok === false);
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
