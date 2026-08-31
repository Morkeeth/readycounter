# E1: OAuth vs crawl pairs

**Date:** 2026-08-31  
**Status:** blocked — no connected shop in this environment

## How to run

1. Connect tab → Install on Shopify (read-only scopes).
2. `npm run audit:oauth-pairs -- https://YOURSTORE.com your-store.myshopify.com`
3. Or set `SHOPIFY_DEV_SHOP` and `npm run audit:oauth-pairs -- --from-env`

## Hypothesis

Admin GTIN% ≫ public crawl GTIN% on the same brand.

## Artifact

`audits/oauth-pairs-latest.json` (empty until OAuth available)
