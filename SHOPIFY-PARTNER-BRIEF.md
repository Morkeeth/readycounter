# Shopify partner brief — ReadyCounter

**Audience:** Shopify partnerships, Agentic Storefronts, Catalog / UCP teams  
**Tone:** complement, not compete · open source · evidence-first  
**Live:** https://tooltruth-webmcp.vercel.app · repo: https://github.com/Morkeeth/tooltruth-webmcp

---

## Why Shopify should care

Shopify is winning agent traffic — **8×** session growth and **~13×** order growth from AI referrals ([`shopify_ai_traffic`](./src/data/sources.ts)). Harley Finkelstein reports catalog-powered AI search converts **2×** vs scraped data ([`shopify_catalog_2x`](./src/data/sources.ts)). The platform investment in **Universal Commerce Protocol (UCP)**, Agentic Storefronts, and Catalog channels is the right rails.

**The gap Shopify cannot see from Admin alone:** what an unauthenticated agent actually retrieves from the public web before it ever reaches those rails.

ReadyCounter is an open-source field instrument that answers that question — and prints the answer as a **Presenc-priced itemised bill** merchants can audit line by line.

---

## What we measured (field receipt, 2026-08-31)

| Signal | Value | How to reproduce |
|--------|-------|------------------|
| Curated DTC sample | **148** URLs | `src/data/curated-dtc.json` |
| Public feed crawled | **78** (53%) | `GET /api/v1/rankings` |
| Scrape GTIN on crawled | **0%** (78/78) | same endpoint · `avgGtinPct: 0` |
| UCP Catalog MCP available | **81 / 148** | `ucp.available` in rankings |
| UCP GTIN where scrape empty | **11** brands | filter *UCP GTIN · scrape empty* |

**Implication for Shopify:** Catalog and UCP can hold identifiers agents need while public `products.json` stays empty — glossier, tatcha, brooklinen, mejuri, and eight others in our batch. Merchants who only fix Admin barcodes but leave headless feeds dead still lose discovery. ReadyCounter shows **both columns** side by side; we do not ask Shopify to trust scrape alone.

We **do not** claim OAuth Admin GTIN parity until **E1** paired audits exist (script ready: `npm run audit:oauth-pairs`; needs merchant-connected shops).

---

## What ReadyCounter is (and is not)

| ReadyCounter | Shopify-native scanners / channel setup |
|--------------|----------------------------------------|
| Agent-side public truth + field distribution | Admin completeness checklist |
| Presenc abandonment weights → sandbox journey proof | Flip Agentic / Catalog toggles |
| Open source MIT · self-host or Vercel | App Store listing |
| WebMCP co-shop proves path in-tab | Requires merchant install for proof |

**Frame for partners:** Shopify brings catalog syndication and UCP. ReadyCounter measures whether the **agent-retrievable surface** matches what merchants think they published — and gives merchants a **delta receipt** when they fix it.

---

## Co-shop proof — why WebMCP matters to this story

Research and crawl answer “can an agent see you?” WebMCP answers “can an agent **shop** you in the same tab as the merchant?”

- **18** structured tools on the storefront (`GET /api/v1/tools`)
- `prepare_checkout` validates and refuses with cited walls — **never charges a card**
- Fallback **Agent tool console** under Connect — no `chrome://flags` required for judges or partners

This is the proof layer on top of the audit plane — not a replacement for Shopify Catalog.

---

## Adoption paths we are proposing (not shipping tonight)

1. **Receipt in CI** — signed JSON readiness artifact merchants pin beside theme checks (public receipt API: roadmap, not done)
2. **Agentic Storefronts checklist** — “run ReadyCounter on your public feed” as a pre-submit gate (partner doc + open protocol, not a Shopify App yet)
3. **Field census changelog** — weekly `audit:batch` publish; Shopify can cite agent-side emptiness trends without building another crawler
4. **E1 OAuth pairs** — when merchants connect, crawl↔Admin GTIN tables lock or kill the “Admin gap” narrative with data

---

## Honest limits (partner-safe)

- URL crawl ≠ live checkout; Presenc **78.6%** is cited industry research, not our field measurement
- Sandbox fixes (CAPTCHA off → **70→94**) preview impact; they do not change live Shopify checkout
- We cite CatalogScan for headless `/products.json` death (~40% signal) — we complement, not replace, their Admin scan
- **0** E1 OAuth pairs today — do not film “Admin holds barcodes” without paired evidence

---

## One-liner for the room

> **Shopify** brings the catalog. **ReadyCounter** shows what agents actually retrieve — and **WebMCP** lets an assistant shop the cart you're looking at. Open source. Field receipt attached.

**Next step:** point us at one design partner shop for E1 OAuth pairs; we publish the crawl↔Admin table in `research/experiments/R2-oauth-vs-crawl.md`.
