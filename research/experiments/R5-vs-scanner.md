# R5: ReadyCounter vs Shopify catalog scanner

**Date:** 2026-08-31  
**Status:** methodology complete · paired run pending external scanner access

## Hypothesis

ReadyCounter’s **agent-readiness score** and Shopify ecosystem **catalog scanners** (CatalogScan, Admin catalog health, UCP Storefront Catalog MCP) measure **different layers** — complementary, not redundant. A store can pass scanner GTIN checks in Admin while failing agent crawl legibility.

## What each tool sees

| Layer | ReadyCounter (URL crawl) | CatalogScan / Admin scanner | UCP `{store}/api/ucp/mcp` |
|-------|--------------------------|----------------------------|---------------------------|
| **Input** | Public `products.json`, HTML, JSON-LD | Shopify Admin product records | Merchant-configured MCP + OAuth |
| **GTIN field** | `variants[].barcode` in public JSON | Variant barcode in Admin | Depends on merchant feed |
| **Headless Hydrogen** | Often **no** public `/products.json` | Admin still has catalog | May expose via MCP |
| **Output** | 0–100 readiness + line items | Catalog health / % complete | Agent tool catalog |
| **Checkout walls** | Captcha/account hints (R3) | Not measured | Not measured |

## External research (not our N)

- **CatalogScan 100-store scan (2026):** ~40% of headless DTC stores removed or gated public `/products.json` — agents scraping lose the feed entirely.
- **Shopify Hydrogen v2026.4:** Storefront API proxy mandatory; consent/cookie changes (Jun 2026) affect what unauthenticated crawlers see.
- **GTIN placement:** Must live on **variant `barcode`**, not product-level fields — matches our `scrapedCatalogLegibility()` check.

## Our data (R1 + R6)

- **34/34 crawled stores:** 0% GTIN in public feeds, 0/24 catalog score.
- **Sandbox agent-paradise (100):** proves the rubric can go green when feeds are complete — real stores don’t.

**Interpretation:** Scanner-style Admin audits would likely show **non-zero** barcode coverage on many merchants; ReadyCounter shows **zero agent-discoverable** GTIN on the same brands via public crawl.

## Complementarity (film / Devpost angle)

1. **Scanner says:** “Your catalog is 80% complete in Shopify.”
2. **ReadyCounter says:** “An agent reading your storefront sees 0% GTIN and a captcha hint — score 68.”
3. **Compare API (`POST /api/v1/audit/compare`):** crawl + UCP probe + optional OAuth — same URL, three surfaces.

## Method (paired run — when scanner API available)

```bash
# ReadyCounter
curl -s -X POST https://tooltruth-webmcp.vercel.app/api/v1/audit/compare \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://colourpop.com"}'

# CatalogScan / Admin: export GTIN% for same 10 URLs from curated list
npm run audit:batch -- --curated   # subset overlap
```

Record: crawl GTIN%, Admin GTIN% (if known), UCP catalog present Y/N, headless Y/N.

## Finding (provisional)

**ReadyCounter is the agent-side mirror of merchant-side catalog scanners** — it scores what autonomous clients actually retrieve, not what Admin holds. For WebMCP/UCP, both views belong in the story.

## Caveats

- No CatalogScan API wired in-repo yet
- UCP probe is endpoint discovery, not full MCP handshake on all stores

## Evidence

- `src/server/ucp-probe.ts`
- `POST /api/v1/audit/compare`
- R1, R6 batch artifacts
