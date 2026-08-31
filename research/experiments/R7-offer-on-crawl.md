# R7 — Offer% on public crawl

**Date:** 2026-08-31  
**Question:** What % of Product JSON-LD nodes on homepage crawls include Offer+price?  
**Method:** `computeOfferPct()` in `src/server/url-audit.ts` + `runPolicySmoke()` on same HTML.

---

## Hosts (re-derive — do not carry these numbers)

| Host | Method | Offer% | JSON-LD products | Policy smoke |
|------|--------|--------|------------------|--------------|
| colourpop.com | shopify-products-json | **null** (0 Product nodes on homepage JSON-LD) | 0 | privacy ✓ · terms ✓ |
| glossier.com | shopify-products-json | **null** (0 Product nodes) | 0 | privacy ✓ · terms ✓ |
| allbirds.com | shopify-products-json | **null** (0 Product nodes) | 0 | URLs not found in homepage HTML |

**Run:** 2026-08-31T21:50Z via `auditStorefrontUrl` (see repro below).

### colourpop.com

```json
{"offerPct":null,"offerSampleSize":0,"policySmoke":{"privacyUrl":"https://colourpop.com/pages/privacy-policy","termsUrl":"https://colourpop.com/pages/terms","privacyOk":true,"termsOk":true}}
```

### glossier.com

```json
{"offerPct":null,"offerSampleSize":0,"policySmoke":{"privacyUrl":"https://glossier.com/policies/privacy-policy","termsUrl":"https://glossier.com/policies/terms-of-service","privacyOk":true,"termsOk":true}}
```

### allbirds.com

```json
{"offerPct":null,"offerSampleSize":0,"policySmoke":{"privacyUrl":null,"termsUrl":null,"privacyOk":null,"termsOk":null,"note":"No privacy or terms links found in homepage HTML"}}
```

**Finding:** Shopify `products.json` path dominates these DTC hosts — Offer% is honestly **null** when homepage has no Product JSON-LD. Policy smoke is the stronger ACP signal on crawl today (allbirds fails discovery).

```bash
cd tooltruth-webmcp
node --import tsx/esm -e "
import { auditStorefrontUrl } from './src/server/url-audit.ts';
for (const url of ['https://colourpop.com','https://glossier.com','https://allbirds.com']) {
  const r = await auditStorefrontUrl(url);
  if (!r.ok) { console.log(url, 'ERR', r.error); continue; }
  console.log(JSON.stringify({
    url,
    method: r.meta.method,
    offerPct: r.meta.signals.offerPct,
    offerSampleSize: r.meta.signals.offerSampleSize,
    policySmoke: r.meta.signals.policySmoke,
  }));
}
"
```

---

## Findings (fill after run)

Run the repro above and paste stdout here. Honest nulls when homepage has no Product JSON-LD (products.json-only stores).

**Baseline arm:** naive grep for `"@type":"Offer"` on homepage HTML — overcounts script noise; ReadyCounter walks `@graph` Product nodes only.
