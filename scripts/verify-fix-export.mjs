/**
 * The fix file must be importable, or it is theatre.
 *
 * Shopify matches an import by Handle. We were storing the SKU as `id`
 * ("Accessory-HairClipsGWP") and never capturing the handle ("hair-clips-gwp")
 * at all, so a CSV built from that data would have matched nothing.
 */
import { readFileSync } from 'node:fs';

let bad = 0;
const fail = (m) => { console.error(`FAIL ${m}`); bad++; };

const types = readFileSync('src/types/commerce.ts', 'utf8');
if (!/handle\?: string;/.test(types)) fail('Product has no handle field');

const crawler = readFileSync('src/server/url-audit.ts', 'utf8');
if (!/handle\?: string;/.test(crawler)) fail('the crawler does not read handle off products.json');
if (!/\.\.\.\(p\.handle \? \{ handle: p\.handle \} : \{\}\)/.test(crawler))
  fail('the crawler does not carry handle into the feed');

const cat = readFileSync('src/integrations/shopify-catalog.ts', 'utf8');
if (!/row\.handle \? \{ handle: row\.handle \}/.test(cat))
  fail('handle is dropped converting the feed into products');

const exp = readFileSync('src/lib/fix-export.ts', 'utf8');
for (const col of ['Handle', 'Variant SKU', 'Variant Barcode']) {
  if (!exp.includes(`'${col}'`)) fail(`the CSV is missing the ${col} column`);
}
if (!/products\.filter\(\(p\) => Boolean\(p\.handle\)\)/.test(exp))
  fail('the CSV does not exclude products without a handle');

const census = readFileSync('src/components/FieldCensus.tsx', 'utf8');
if (!/'blocked'/.test(census)) fail('the census still hides refusals inside "no feed"');

if (bad) { console.error(`\nverify-fix-export: ${bad} problem(s)`); process.exit(1); }
console.log('ok   the fix CSV carries Handle, and refusals are their own class');
console.log('verify-fix-export: all checks pass');
