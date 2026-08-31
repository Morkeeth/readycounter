# Shopify partner brief — ReadyCounter

**Audience:** Shopify partnerships, Agentic Storefronts, Catalog / UCP teams  
**Tone:** Partner, not competitor. Open source. Evidence-first.

**Live demo:** https://tooltruth-webmcp.vercel.app/?view=integrations  
**Repo:** https://github.com/Morkeeth/tooltruth-webmcp

---

## Why Shopify should care

Shopify is betting on agentic commerce — Catalog-powered AI search converts **2×** better than scraped data ([`shopify_catalog_2x`](./src/data/sources.ts)), and AI traffic to merchant storefronts is up **8×** YoY ([`shopify_ai_traffic`](./src/data/sources.ts)). Merchants hear "turn on Agentic" but cannot see **what an agent reads** from the public web before checkout.

ReadyCounter answers that gap with a **field receipt** merchants and partners can audit:

| Signal | ReadyCounter measurement | Source |
|--------|--------------------------|--------|
| Public feed reach | **78/148** crawled curated DTC | Live [`GET /api/v1/rankings`](https://tooltruth-webmcp.vercel.app/api/v1/rankings) |
| Scrape GTIN | **0%** on every crawled store | Same API · [`FIELD_RECEIPT`](./src/data/field-companion.ts) |
| UCP Catalog MCP | **81/148** expose UCP | E3 census · rankings join |
| UCP GTIN where scrape empty | **11** brands (glossier, tatcha, brooklinen, aloyoga, mejuri, …) | [`research/experiments/E3b-ucp-vs-crawl.md`](./research/experiments/E3b-ucp-vs-crawl.md) |

**The UCP gap is the partner story:** Shopify's Catalog MCP can hold identifiers agents never see in `products.json`. Merchants who only fix the theme miss the protocol path. ReadyCounter shows both columns side by side — crawl GTIN vs UCP GTIN — without competing with Admin scanners.

---

## What we are not

- **Not** a replacement for Shopify Admin, CatalogScan, or channel toggles
- **Not** claiming we fixed a merchant's live checkout from a URL paste
- **Not** certifying Instant Checkout or ACP feed conformance (checklist points at OpenAI/Stripe specs; validators deferred)

We complement Shopify Agentic Storefronts: they syndicate Admin catalog; we measure **agent-side retrieval** and price abandonment causes from published research ([`presenc_abandon`](./src/data/sources.ts) + six cause rows in [`sources.ts`](./src/data/sources.ts)).

---

## Co-shop proof (WebMCP)

ReadyCounter registers **18** structured tools on the storefront via WebMCP (`document.modelContext`). A human and an assistant edit the **same order** in the **same tab**. `prepare_checkout` validates and refuses at walls — **never charges a card**.

Judges and merchants can run every tool without the browser flag: Connect → Agent tool console (same handlers). WebMCP is the **proof layer**; the bill and field batch work without it ([`WHY-WEBMCP.md`](./WHY-WEBMCP.md)).

**Partner line:** *Shopify brings the catalog. Render keeps the audit. WebMCP lets an assistant shop the cart you're looking at.*

---

## Open source + Render

- MIT repo · cold clone · `npm run verify` fails if cited figures drift from [`src/data/sources.ts`](./src/data/sources.ts)
- Render Key Value persists audits and co-shop rooms across Vercel deploys ([`PARTNERSHIP-RENDER.md`](./PARTNERSHIP-RENDER.md))
- Shopify OAuth (read-only products) configured on production — Admin path for merchants who cannot be crawled

---

## Adoption ambition (honest)

**Near term:** merchants paste URL → compare to **148** → re-audit delta → share `?audit_url=` receipt link.

**2027:** ReadyCounter as **lighthouse on every deploy** — public score + signed JSON receipt merchants pin in CI and on partner pages. Shopify adopting the receipt format (not our rails) is the success metric from [`demo/AMBITION.md`](./demo/AMBITION.md).

**Blocked until E1:** OAuth crawl↔Admin GTIN pairs (≥3) to lock or kill the "Admin holds barcodes" narrative. **E1 is not done** — film and partner copy must say "public feeds empty" until pairs exist ([`research/RANK-AND-HELP-GAP.md`](./research/RANK-AND-HELP-GAP.md)).

---

## Ask

1. **Pilot:** 3–5 Partner merchants run URL audit + UCP compare; we publish field changelog (weekly cron already ships)
2. **Receipt format:** align ReadyCounter delta JSON with Agentic Storefronts / Catalog readiness checklist
3. **Do not merge us with Admin scanner SKUs** — cite CatalogScan for Admin completeness; we own public + UCP agent-side truth

**Contact:** repo issues · Devpost submission Wed Sep 3, 2026 1pm PDT
