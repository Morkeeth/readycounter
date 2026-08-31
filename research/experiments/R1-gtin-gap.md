# R1: DTC public feed GTIN gap

**Date:** 2026-08-31  
**Status:** complete (curated batch v1)

## Hypothesis

Major DTC Shopify storefronts expose **near-zero GTIN/barcode coverage** in public `products.json` / JSON-LD, driving catalog legibility scores toward 0/24 regardless of in-admin data quality.

## Method

```bash
npm run audit:batch -- --publish
```

Uses `audits/curated-dtc.json` (21 unique URLs across beauty, apparel, home, food).  
Scoring: `computeAuditFindings()` catalog mode — `page_structure` via `scrapedCatalogLegibility()`.

## Results (2026-08-31 curated batch)

| Metric | Value |
|--------|-------|
| **N attempted** | 21 |
| **N crawled** | 16 |
| **N blocked** | 5 (elf, gymshark, patagonia, article, bluebottle) |
| **Median GTIN%** | **0%** |
| **Avg catalog score** | **0/24** |
| **Captcha HTML hints** | 14/16 crawled stores |

Every store that crawled scored **0/24** on catalog legibility — missing `gtin13` on all sampled SKUs in the public feed.

### Blocked (OAuth path)

- elfcosmetics.com · gymshark.com · patagonia.com · article.com · bluebottlecoffee.com (403)

## Finding

**16/16 crawled DTC stores: 0% GTIN in public agent-discoverable feeds.**  
Sandbox scores (60–83) would overstate readiness — catalog score is honest at zero.

This supports Shopify’s **2× catalog vs scrape** claim: agents reading public `products.json` cannot resolve product identifiers merchants may hold in Admin.

## Caveats

- URL crawl only — not Admin API
- Sample capped at 50 SKUs per store (`products.json` pagination)
- Presenc checkout rows NOT MEASURED on crawls
- HTML captcha hints ≠ confirmed checkout wall

## Evidence

- KV: `rc:render:audit-batch:latest`
- API: `GET /api/v1/rankings`
- File: `audits/batch-2026-08-31.json`

## Next

- **R2:** OAuth same-store — does Admin GTIN% differ?
- Rankings UI live on Connect tab
- Expand to 50 stores · vertical breakdown (R6)
