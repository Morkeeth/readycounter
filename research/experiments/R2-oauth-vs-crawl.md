# R2: OAuth vs public crawl delta

**Date:** 2026-08-31  
**Status:** complete (infrastructure + crawl baseline)

## Hypothesis

For the same Shopify store, **Shopify Admin API** exposes higher GTIN/barcode coverage and catalog legibility than public `products.json` / JSON-LD — supporting Shopify's **2× catalog search** claim.

## Method

```bash
# API (production or local)
curl -s -X POST https://readycounter.vercel.app/api/v1/audit/compare \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://colourpop.com","shop":"your-dev-store.myshopify.com"}'

# UI: Readiness tab → Crawl vs Shopify Admin (A2)
```

Uses `CatalogAdapter` seam (`url-crawl` vs `shopify-admin`) and `buildAuditCompare()`.

## Results (2026-08-31)

### Crawl-only baseline (R1 batch, n=16)

| Metric | Public crawl |
|--------|----------------|
| GTIN% | **0%** all stores |
| Catalog score | **0/24** all stores |

### OAuth paired runs

OAuth comparison requires merchant install or dev-store client credentials. Infrastructure shipped; field paired runs blocked on willing OAuth stores.

**Expected delta (from Shopify positioning):** Admin holds barcodes merchants never publish to `products.json`; catalog score and GTIN% should rise when OAuth row populates.

## Finding

**Measurement layer is live** — same weights, two adapters, honest delta. Crawl baseline proves agents reading public feeds see **0% GTIN**; OAuth row is the merchant-action unlock.

## Caveats

- OAuth needs app install or Partner dev store
- Admin pagination may exceed crawl 50-SKU cap → product count delta ≠ GTIN delta
- Checkout lines still NOT MEASURED in either mode without journey probe

## Evidence

- `src/server/catalog-adapter.ts`
- `src/lib/audit-compare.ts`
- `POST /api/v1/audit/compare`
- `src/components/CrawlVsOAuthPanel.tsx`

## Next

- Pair 3 willing merchants: crawl vs OAuth same store
- GTIN CSV export (A3) from Admin adapter
