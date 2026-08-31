# R6: GTIN gap by vertical

**Date:** 2026-08-31  
**Status:** complete (batch v3 — 102 URLs)

## Hypothesis

The public-feed GTIN gap (R1) is **not uniform by vertical** — beauty/food may crawl more often than home/pet, but catalog legibility stays near zero wherever `/products.json` works.

## Method

```bash
npm run audit:analyze   # reads latest audits/batch-*.json + curated-dtc vertical tags
```

Maps each batch row URL → vertical from `audits/curated-dtc.json` (last vertical wins on duplicates).

## Results (batch v3 — 102 URLs)

| Vertical | Attempted | Crawled | Crawl rate | Avg GTIN% | Captcha hint % | Avg catalog |
|----------|-----------|---------|------------|-----------|----------------|-------------|
| beauty | 17 | 13 | 76% | **0%** | 92% | 0/24 |
| food | 12 | 9 | 75% | **0%** | 100% | 0/24 |
| headless-suspects | 8 | 6 | 75% | **0%** | 100% | 0/24 |
| fun | 7 | 5 | 71% | **0%** | 100% | 0/24 |
| kids | 4 | 2 | 50% | **0%** | 100% | 0/24 |
| wellness | 8 | 3 | 38% | **0%** | 100% | 0/24 |
| accessories | 6 | 2 | 33% | **0%** | 50% | 0/24 |
| outdoor | 7 | 2 | 29% | **0%** | 100% | 0/24 |
| home | 12 | 3 | **25%** | **0%** | 67% | 0/24 |
| apparel | 15 | 6 | 40% | **0%** | 100% | 0/24 |
| pet | 6 | 1 | **17%** | **0%** | 100% | 0/24 |

**Overall:** 52/102 crawled (**51%**), **avg GTIN 0%**, **avg catalog 0/24** on all 52 crawled stores.

### Failure taxonomy (50 blocked)

| Reason | Count |
|--------|-------|
| No public products feed / JSON-LD | 30 |
| HTTP 403 | 13 |
| HTTP timeout | 4 |
| HTTP 429 | 2 |
| HTTP 400 | 1 |

## Finding

1. **Vertical does not predict GTIN coverage** — 52/52 crawled stores: 0% GTIN, 0/24 catalog.
2. **Vertical predicts crawl success** — pet (17%) and home (25%) block most; beauty/food ~75%.
3. **Half the long tail never crawls** — 403 + headless/no-feed dominates apparel, outdoor, pet.
4. **Captcha hints** on 50–100% of successful crawls — aligns with R3.

## Caveats

- `headless-suspects` overlaps other verticals — tagging cross-check, not independent N.
- URL crawl only; Admin GTIN may differ (R2).

## Evidence

- `audits/analysis-latest.json`
- `audits/batch-2026-08-31.json` (102 rows)
- KV: `rc:render:audit-batch:latest` (published v3)

## Next

- Split failure taxonomy in `analyze-batch.mjs` (automated)
- OAuth paired compare on blocked 403 set
