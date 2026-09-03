# Research agent memo — 2026-08-31

Deep dive for ReadyCounter field study expansion (WebMCP hackathon).

## Executive summary

1. **Public agent feeds are empty on GTIN** — 34/34 crawled DTC stores: 0% (R1, R6).
2. **Crawl success varies by vertical** — food/beauty ~77–88%; home/pet ~25% (blocks, headless, 403).
3. **Third-party research:** ~40% headless DTC may have killed public `/products.json` (CatalogScan) — explains blocks we see on gymshark, allbirds, skims, etc.
4. **Product direction:** Compare API (crawl + UCP + OAuth) positions ReadyCounter as **agent-side** complement to **merchant-side** catalog scanners (R5).

## Actions taken this session

| Action | Artifact |
|--------|----------|
| Expanded curated list **66 → 102** unique URLs | `audits/curated-dtc.json` v3 |
| New verticals: outdoor, kids, headless-suspects | same |
| Vertical breakdown script | `scripts/analyze-batch.mjs` · `npm run audit:analyze` |
| R6 vertical GTIN study | `research/experiments/R6-gtin-by-vertical.md` |
| R5 scanner complementarity | `research/experiments/R5-vs-scanner.md` |
| v3 batch | **52/102 crawled**, published to KV | done |

## Curated expansion (v3)

**102 unique storefronts** across 11 vertical tags:

- beauty (18), apparel (18), home (13), food (12), wellness (8), pet (6), accessories (6), fun (8), outdoor (7), kids (4), headless-suspects (8, overlap for tagging)

Research-driven adds: reformation, lululemon, daily-harvest, imperfect foods, ridge, nomad, peak design, yeti, primary, away, etc.

## Headline stats (batch v3)

```
Total attempted: 102
Crawled:         52 (51%)
Avg GTIN:        0% (52/52 crawled)
Avg catalog:     0/24
Blocked:         50 (no-feed×30, 403×13, timeout×4, 429×2, 400×1)
```

By vertical — see `audits/analysis-latest.json` and R6.

## External sources (for citations in Devpost)

| Claim | Source | Use |
|-------|--------|-----|
| Headless kills public products.json | CatalogScan 100-store methodology | Explain crawl failures |
| GTIN on variant barcode | Shopify product API docs | Aligns with our scraper |
| Hydrogen proxy + consent 2026 | Shopify Hydrogen changelog | Future crawl degradation |
| UCP Storefront Catalog MCP | `{store}/api/ucp/mcp` | Our `ucp-probe.ts` |
| 19% Product schema has Offer | Digital Applied 5k audit | Already in readiness rationale |

## Fun test cases (already shipped)

Six sandbox stores with distinct failure modes — see `FUN-STORES.md`:

- agent-paradise **100** · midnight-vinyl **89** · ghost-goods **87** · ember-oak **70** · neon-matcha **65** · chaos-pets **40**

## Recommended next research

1. **Finish v3 batch** → refresh R6 table + rankings KV
2. **Failure taxonomy** in analyze script: `403` vs `no products.json` vs `empty catalog`
3. **10-store OAuth paired compare** on dev store (R2 extension)
4. **Random store picker** on Rankings for demo variety

## Commands

```bash
npm run audit:batch -- --publish    # crawl 102 URLs → KV
npm run audit:analyze               # vertical breakdown
npm run render:publish-audit        # republish local JSON if KV empty
curl -s https://readycounter.vercel.app/api/v1/rankings | jq '.stores | length'
```
