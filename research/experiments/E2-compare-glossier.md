# E2 — Compare API headline (glossier)

**Slice:** RC-E2 · film-ready compare without OAuth  
**Date:** 2026-08-31

## Repro

```bash
curl -sS -X POST https://readycounter.vercel.app/api/v1/audit/compare \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://www.glossier.com"}' | jq '{headline,crawl:{gtinPct,catalogScore,offerPct},ucp}'
```

**Branch (after deploy)** also returns `crawl.offerPct` and low-offer headline when &lt;20%.

## Expected shape

- `crawl.gtinPct` — scrape coverage (often 0% on DTC batch)
- `ucp.available` — whether `/.well-known/ucp` + MCP respond
- `headline` — one sentence for film: UCP GTIN gap, low Offer%, or OAuth CTA

## Film beat

> "Same URL — three truths: what scrape sees, what UCP negotiates, what Admin would show if you OAuth."

Do **not** claim OAuth pairs on film until E1 ships.
