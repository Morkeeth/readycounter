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
import { assertSafeAuditUrl } from './src/server/ssrf.ts';
import {
  jsonLdNodeHasCompleteOffer,
  offerCoverageFromJsonLdNodes,
  offerCoverageFromProducts,
  feedRowHasCompleteOffer,
} from './src/lib/offer-crawl.ts';
import { discoverPolicyUrls } from './src/lib/policy-smoke.ts';

const html = \`
<html><head>
<script type="application/ld+json">{"@graph":[{"@type":"Product","name":"Test Bean","sku":"sku-1","offers":{"price":"12.00","availability":"https://schema.org/InStock"}}]}</script>
</head><body>
<footer>
<a href="/policies/privacy-policy">Privacy Policy</a>
<a href="/pages/terms-of-service">Terms of Service</a>
</footer>
</body></html>\`;

const blocks = extractJsonLdBlocks(html);
ok('json-ld blocks parsed', blocks.length === 1);

const node = {"@type":"Product","name":"X","offers":{"price":"9.99","availability":"InStock"}};
ok('complete offer detected', jsonLdNodeHasCompleteOffer(node) === true);
const noAvail = {"@type":"Product","offers":{"price":"9.99"}};
ok('missing availability fails', jsonLdNodeHasCompleteOffer(noAvail) === false);
ok('offer coverage from nodes', offerCoverageFromJsonLdNodes([node, noAvail]) === 50);

const products = [
  { id: 'a', name: 'A', description: '', price: 10, currency: 'USD', tags: [], category: 'x', inStock: true },
  { id: 'b', name: 'B', description: '', price: 0, currency: 'USD', tags: [], category: 'x', inStock: true },
];
ok('feed row complete offer', feedRowHasCompleteOffer(products[0]) === true);
ok('feed row zero price fails', feedRowHasCompleteOffer(products[1]) === false);
ok('offer coverage from products', offerCoverageFromProducts(products) === 50);

const policies = discoverPolicyUrls(html, 'https://example.com');
ok('privacy url discovered', policies.privacy === 'https://example.com/policies/privacy-policy');
ok('terms url discovered', policies.terms === 'https://example.com/pages/terms-of-service');

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
