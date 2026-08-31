# R7 — Offer JSON-LD on public crawl

**Date:** 2026-08-31  
**Signal:** `% of Product JSON-LD nodes with Offer + price + availability` on homepage sample.

## Repro

```bash
# Branch API (after deploy) or local dev:
curl -sS -X POST http://localhost:3000/api/v1/audit/url \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://colourpop.com"}' | jq '{offerPct, policySmoke, meta: {method: .meta.method, gtinPct: .meta.gtinPct}}'

curl -sS -X POST http://localhost:3000/api/v1/audit/url \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://www.allbirds.com"}' | jq '{offerPct, policySmoke}'

curl -sS -X POST http://localhost:3000/api/v1/audit/url \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://www.glossier.com"}' | jq '{offerPct, policySmoke}'
```

## Sample (run on branch — numbers vary by crawl)

| Host | Method | offerPct | policy privacy | policy terms |
|------|--------|----------|----------------|--------------|
| colourpop.com | shopify-products-json | from homepage JSON-LD | discovered | discovered |
| allbirds.com | shopify-products-json | from homepage JSON-LD | discovered | discovered |
| glossier.com | shopify-products-json | from homepage JSON-LD | discovered | discovered |

**Interpretation:** Catalog often comes from `/products.json` while Offer% is measured from homepage Product JSON-LD nodes — honest split. Field benchmark: ~19% Offer coverage ([`schema_offer_gap`](../../src/data/sources.ts)).

## Code

- `src/lib/offer-schema.ts` — `computeOfferPct`
- `src/lib/policy-smoke.ts` — footer link discovery + HTTP smoke
- `src/server/url-audit.ts` — wired into crawl path
