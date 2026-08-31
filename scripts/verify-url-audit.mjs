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
import { extractJsonLdBlocks, productNodeHasCompleteOffer, offerPctFromJsonLdNodes, offerPctFromShopifyProducts } from './src/server/url-audit.ts';
import { discoverPolicyUrls } from './src/server/policy-smoke.ts';
import { assertSafeAuditUrl } from './src/server/ssrf.ts';
import { reviewAgainstField } from './src/data/field-companion.ts';

const html = \`
<html><head>
<script type="application/ld+json">{"@graph":[{"@type":"Product","name":"Test Bean","sku":"sku-1","offers":{"price":"12.00","availability":"https://schema.org/InStock"}}]}</script>
</head>
<footer>
<a href="/policies/privacy-policy">Privacy Policy</a>
<a href="/policies/terms-of-service">Terms of Service</a>
</footer></html>\`;

const blocks = extractJsonLdBlocks(html);
ok('json-ld blocks parsed', blocks.length === 1);

const nodes = [{"@type":"Product","name":"A","offers":{"price":"9.99","availability":"InStock"}},{"@type":"Product","name":"B","offers":{"price":"0"}}];
ok('complete offer detected', productNodeHasCompleteOffer(nodes[0]) === true);
ok('incomplete offer rejected', productNodeHasCompleteOffer(nodes[1]) === false);
ok('offerPctFromJsonLdNodes', offerPctFromJsonLdNodes(nodes) === 50);

const feedProducts = [
  { title: 'A', variants: [{ price: '10.00', available: true }] },
  { title: 'B', variants: [{ price: '0', available: true }] },
];
ok('offerPctFromShopifyProducts', offerPctFromShopifyProducts(feedProducts) === 50);

const policies = discoverPolicyUrls(html, 'https://example.myshopify.com');
ok('privacy URL discovered', policies.privacy?.includes('privacy-policy') === true);
ok('terms URL discovered', policies.terms?.includes('terms-of-service') === true);

const review = reviewAgainstField({ offerPct: 10, policySmoke: { measurable: false } });
ok('schema-offer flagged when offer low', review.flags.some((f) => f.issueId === 'schema-offer') === true);
ok('acp-eligibility flagged when policy unmeasured', review.flags.some((f) => f.issueId === 'acp-eligibility') === true);

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
