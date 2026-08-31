# E3: UCP Storefront Catalog census

**Date:** 2026-08-31  
**Command:** `npm run audit:ucp-census`  
**Status:** complete

## Hypothesis

Among curated DTC URLs, a meaningful share expose Shopify Storefront Catalog MCP (`/api/ucp/mcp`), and that surface may return identifiers even when public `/products.json` shows 0% GTIN.

## Results

| Metric | Value |
|--------|-------|
| Attempted | **148** |
| UCP MCP available | **81 (55%)** |
| Probes with GTIN% > 0 | **13** |

## Finding

1. **UCP is common but not universal** — about half the curated list answers Catalog MCP.  
2. **UCP can carry GTINs when public crawl does not** — 13 stores returned GTIN% > 0 via UCP tools; public crawl batch was 0% GTIN on all 78 readable feeds.  
3. **Implication for ReadyCounter** — compare API (crawl + UCP + OAuth) is the right product shape; rankings that only crawl understate agent-reachable identity on UCP-capable stores.

## Caveats

- Probe uses Shopify’s documented agent profile + MCP tools; failures may be bot/WAF, not “no UCP.”  
- GTIN% is from a limited MCP search sample, not full catalog.  
- Raw rows: `audits/ucp-census-latest.json` (gitignored — regenerate with the command above).

## Next

- Cross-join UCP-available ∩ crawl-0% GTIN for Devpost table  
- E1 OAuth pairs on the 13 UCP-with-GTIN stores when a shop is connected  
