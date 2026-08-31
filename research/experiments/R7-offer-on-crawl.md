# R7: Offer measurement on crawl path

**Date:** 2026-08-31  
**Status:** complete (RC-B night wave)

## Hypothesis

Public crawl can measure **Offer completeness** (% Product JSON-LD nodes or feed rows with price + availability) and **ACP policy smoke** (privacy + ToS URLs resolve) without feed upload or Instant Checkout certification.

## Method

```bash
# Unit checks (no network)
npm run verify   # scripts/verify-url-audit.mjs

# Live object (colourpop.com — products.json path)
npx tsx -e "
import { auditStorefrontUrl } from './src/server/url-audit.ts';
(async () => {
  const r = await auditStorefrontUrl('https://colourpop.com');
  console.log(JSON.stringify({
    offerPct: r.ok ? r.meta.signals.offerCoverage : null,
    policySmoke: r.ok ? r.meta.policySmoke : r.error,
  }, null, 2));
})();
"
```

**Offer:** `src/lib/offer-crawl.ts` — JSON-LD nodes need `offers.price` + `offers.availability`; `products.json` feed rows need `price > 0` + `inStock`.

**ACP policy smoke:** `src/lib/policy-smoke.ts` — discover privacy/terms from homepage anchors + JSON-LD; HTTP GET for 2xx. Returns honest `measured: false` when no URLs found.

## Results (colourpop.com, 2026-08-31)

| Signal | Value |
|--------|-------|
| **Method** | `shopify-products-json` |
| **SKUs sampled** | 50 |
| **offerPct** | **100%** (all feed rows carry price + availability) |
| **policySmoke.privacyOk** | `true` → `https://colourpop.com/pages/privacy-policy` |
| **policySmoke.termsOk** | `true` → `https://colourpop.com/pages/terms` |
| **policySmoke.measured** | `true` |

## Finding

**Feed-path Offer is not JSON-LD Offer adoption.** Colourpop scores 100% on `products.json` rows but that does **not** contradict Digital Applied's **19% Product+Offer JSON-LD** stat — we are not sampling PDP JSON-LD at scale yet. The crawl path is honest: feed rows when `products.json` works; homepage JSON-LD Product nodes otherwise.

**ACP policy smoke works without partner feed.** Privacy + ToS discovered from footer links and verified with HTTP GET — no `is_eligible_*` flags claimed (not measurable without upload).

## API surface

`POST /api/v1/audit/url` returns:

```json
{
  "meta": {
    "offerPct": 100,
    "policySmoke": {
      "privacyOk": true,
      "termsOk": true,
      "measured": true,
      "urls": { "privacy": "...", "terms": "..." }
    }
  }
}
```

`reviewAgainstField` flags `schema-offer` when `offerPct < 100` and `acp-eligibility` when policy URLs missing or HTTP-fail.

Rankings batch rows carry `offerPct`; RankingsPanel shows **Offer** column + signal chip.

## Caveats

- PDP JSON-LD Offer adoption (Digital Applied 19% baseline) **not** measured on `products.json` path
- `is_eligible_search` / `is_eligible_checkout` require partner feed — labelled unmeasured
- Policy discovery is homepage/footer only — not feed-linked policy URLs
- Checkout lines still NOT MEASURED

## Evidence

- `src/lib/offer-crawl.ts` · `src/lib/policy-smoke.ts`
- `api/v1/audit/url.ts` · `scripts/verify-url-audit.mjs`
- Live host: colourpop.com (command above)

## Next

- Optional PDP JSON-LD sample (5 URLs) for true Digital Applied comparison
- Batch re-publish with `offerPct` column in KV rankings
