# Devpost submission copy — ReadyCounter

Paste-ready fields for [WebMCP Challenge](https://webmcp.devpost.com/).  
Stats sourced in [`research.md`](./research.md).

---

## Project name

ReadyCounter

---

## Tagline (≤60 characters)

Agent-ready storefront with readiness score + co-shop

*(59 characters)*

---

## Elevator pitch (one paragraph)

AI traffic is up 8× on Shopify, but most stores lose agent shoppers silently—stale feeds, CAPTCHA walls, thin catalog schema. **ReadyCounter** is a forkable WebMCP storefront where merchants see a data-backed **readiness score** (why agents abandon) and developers ship **8 structured tools** instead of scrape targets. Humans and agents **co-edit the same order** in-tab: the agent proposes via tools; the human confirms checkout—matching the 51-point trust gap (65% trust AI to compare, 14% to buy autonomously). `prepare_checkout` never charges a card.

---

## Description (extended)

### The problem

| Signal | Source |
|--------|--------|
| Shopify: AI traffic **8×** YoY, AI orders **~13×** (Q1 2026) | [Shopify](https://www.shopify.com/enterprise/blog/ai-search-insights) |
| Catalog-powered AI searches convert **2×** vs scraped data | [Shopify earnings](https://stockanalysis.com/stocks/shop/transcripts/555081-q1-2026/) |
| AI conversion went from **38% worse → 42% better** in 12 months | [Adobe](https://business.adobe.com/blog/ai-traffic-surge-retail-sites-not-machine-readable) |
| Agent cart abandon **~78.6%**; stale price **26%**, CAPTCHA **24%** | [Presenc AI](https://presenc.ai/research/agent-cart-abandonment-statistics-2026) |
| **81%** of Product-schema pages lack Offer object | [DigitalApplied 5k audit](https://www.digitalapplied.com/blog/schema-markup-adoption-5k-site-audit-2026) |
| **65%** trust compare · **14%** auto-buy | [YouGov / Checkout.com](https://yougov.com/en-us/articles/53808-american-trust-in-ai-for-retail-consumer-sentiment-in-2025) |

### What we built

**ReadyCounter** = agent-ready commerce demo for the WebMCP era:

1. **Co-shop order** — Ember & Oak Coffee catalog (8 SKUs, intentional gaps: missing GTIN, stale feed, OOS, CAPTCHA default ON).
2. **8 WebMCP tools** — `search_catalog`, `get_product`, `add_to_order`, `update_line_quantity`, `remove_line`, `get_order`, `get_delivery_quote`, `prepare_checkout` with JSON schemas in `src/webmcp/registerTools.ts`.
3. **Merchant readiness dashboard** — score /100, failure-mode checks, CAPTCHA toggle, live agent funnel counters.
4. **Judge harness** — invoke every tool without `chrome://flags/#enable-webmcp-testing`.

### Human-in-the-loop constraint

`prepare_checkout` validates the order and returns totals—it **never charges a card**. Checkout blocked when CAPTCHA is on (demo of Presenc's 24% abandon driver).

---

## Built with

- React 19 + TypeScript + Vite
- Zustand (shared order state)
- WebMCP `document.modelContext.registerTool`
- MIT license

---

## Testing instructions (judges)

```bash
git clone https://github.com/Morkeeth/tooltruth-webmcp.git
cd tooltruth-webmcp
npm install
npm run dev
```

Open `http://localhost:5173`. **No API keys. No WebMCP flag required.**

### 5-minute judge path

1. **Shop + order** — Add a product from the catalog; confirm it appears in the co-shop order panel (<10s).
2. **Judge harness** (bottom of page) — Run `add_to_order` → `get_order`. Same shared order updates with `human` / `agent` badges.
3. **Merchant readiness** — Score <70 with CAPTCHA on (default). Toggle CAPTCHA off → score rises; run `prepare_checkout` in harness → succeeds.
4. **Checkout gate** — With CAPTCHA on, `prepare_checkout` returns blocked + funnel `checkout_blocked` increments.

### Optional: native WebMCP

Chrome 149+ → `chrome://flags/#enable-webmcp-testing` → badge shows "WebMCP live · 8 tools".

---

## Demo steps (video spine, no flag)

See [`DEMO-SCRIPT.md`](./DEMO-SCRIPT.md). Summary:

| Time | Beat |
|------|------|
| 0:00 | Merchant tab: score ~50/100, CAPTCHA ON |
| 0:20 | Human adds item; harness `add_to_order` — co-shop order |
| 0:50 | Readiness checks: stale feed, missing GTIN, funnel counters |
| 1:20 | `prepare_checkout` blocked → toggle CAPTCHA → succeeds |
| 1:50 | Point at 8 tools in `registerTools.ts` |
| 2:20 | Pitch: structured tools + readiness + co-shop |

---

## Links

- Repo: https://github.com/Morkeeth/tooltruth-webmcp
- Research citations: [`research.md`](./research.md)
- Challenge: https://webmcp.devpost.com/
