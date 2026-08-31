# E3b: UCP identifiers vs public crawl GTIN

**Date:** 2026-08-31  
**Inputs:** `audits/ucp-census-latest.json` × latest `audits/batch-*.json`

## Headline

**11 stores** show **0% GTIN on public crawl** and **>0% GTIN via UCP Catalog MCP**.

That is the ReadyCounter gap in one table: merchant-side / protocol surfaces can hold barcodes while agents scraping `/products.json` see none.

## Counts

| Metric | N |
|--------|---|
| Crawl succeeded | 78 |
| UCP available | 81 |
| Both UCP + crawl | 76 |
| **UCP GTIN > 0 ∧ crawl GTIN = 0** | **11** |

## Gap stores

| Host | Crawl GTIN | UCP GTIN | UCP products (sample) |
|------|------------|----------|------------------------|
| tatcha.com | 0% | **100%** | 56 |
| aloyoga.com | 0% | **100%** | 123 |
| buffy.co | 0% | **100%** | 40 |
| mejuri.com | 0% | **100%** | 207 |
| gorjana.com | 0% | **100%** | 80 |
| dagnedover.com | 0% | **100%** | 1 |
| stio.com | 0% | **100%** | 243 |
| awaytravel.com | 0% | **100%** | 27 |
| glossier.com | 0% | **99%** | 125 |
| brooklinen.com | 0% | **72%** | 241 |
| unitedbyblue.com | 0% | **64%** | 120 |

## Product implication

`POST /api/v1/audit/compare` (crawl + UCP + optional OAuth) is not a nice-to-have — it is how you tell the truth. Rankings from crawl alone understate agent-reachable identity on UCP-capable stores.

## Artifact

`research/ucp-vs-crawl-latest.json`
