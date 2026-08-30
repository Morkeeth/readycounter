# Devpost submission copy — ReadyCounter

Paste-ready fields for [WebMCP Challenge](https://webmcp.devpost.com/).  
Stats sourced in [`research.md`](./research.md).

---

## Live demo

```text
https://tooltruth-webmcp.vercel.app
https://tooltruth-webmcp.vercel.app/?store=neon-matcha
```

_(Oscar: replace with Vercel URL after deploy.)_

---

## Project name

ReadyCounter

---

## Tagline (≤60 characters)

Agent-ready storefront with readiness score + co-shop

*(59 characters)*

---

## Elevator pitch (one paragraph)

AI traffic is up 8× on Shopify, but most stores lose agent shoppers silently—stale feeds, CAPTCHA walls, thin catalog schema. **ReadyCounter** is a **forkable platform**: duplicate one entry in `src/data/stores.ts`, ship **10 structured WebMCP tools**, and let merchants see a data-backed **readiness score** (why agents abandon). Two demo stores prove different failure modes—**Ember & Oak** (CAPTCHA) vs **Neon Matcha Lab** (`?store=neon-matcha`, account wall). Humans and agents **co-edit the same order** in-tab; `prepare_checkout` never charges a card.

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

**ReadyCounter** = agent-ready commerce **platform** for the WebMCP era:

1. **Two demo stores** — Ember & Oak Coffee (CAPTCHA default ON) · Neon Matcha Lab (`?store=neon-matcha`, account wall). Switch via header dropdown or URL param.
2. **10 WebMCP tools** — commerce suite plus `get_readiness_score` and `get_merchant_config`. JSON schemas in `src/webmcp/registerTools.ts`.
3. **Merchant readiness dashboard** — score /100, failure-mode checks, CAPTCHA/account toggles, live agent funnel.
4. **Co-shop + share links** — `?co=` hydrates order across tabs; localStorage persist on refresh.
5. **Judge harness** — invoke every tool without `chrome://flags/#enable-webmcp-testing`.

### WebMCP tools (10)

| Tool | Role |
|------|------|
| `search_catalog` | Agent product discovery |
| `get_product` | Full SKU record |
| `add_to_order` | Co-shop cart |
| `update_line_quantity` | Line quantity edits |
| `remove_line` | Remove line |
| `get_order` | Shared order state |
| `get_delivery_quote` | Shipping quote |
| `prepare_checkout` | Validate — never charges |
| `get_readiness_score` | Score /100 + checks |
| `get_merchant_config` | CAPTCHA / account flags |

### Fork path

Duplicate a `src/data/stores.ts` entry → open `?store=your-id`. Five-minute guide: [`FORK.md`](./FORK.md).

### Human-in-the-loop constraint

`prepare_checkout` validates the order and returns totals—it **never charges a card**. Checkout blocked when CAPTCHA or account wall is on (demo of Presenc abandon drivers).

---

## Built with

- React 19 + TypeScript + Vite
- Zustand (shared order state + persist)
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

Fast path: [`JUDGE-60s.md`](./JUDGE-60s.md)

### 5-minute judge path

1. **Shop + order** — Start co-shopping → add item → appears in order panel (<10s).
2. **Judge harness** — Run `add_to_order` → `get_order`. Same shared order, `human` / `agent` badges.
3. **Merchant readiness (Ember & Oak)** — Score <70 with CAPTCHA on. Toggle off → score rises; `prepare_checkout` succeeds.
4. **Switch store** — Demo store → Neon Matcha Lab (or `?store=neon-matcha`). Different score; account wall blocks checkout.
5. **Readiness tools** — Harness `get_readiness_score` + `get_merchant_config` on each store.

### Optional: native WebMCP

Chrome 149+ → `chrome://flags/#enable-webmcp-testing` → badge shows "WebMCP live · 10 tools".

---

## Demo steps (video spine, no flag)

See [`DEMO-SCRIPT.md`](./DEMO-SCRIPT.md) · [`FILM-CUES.md`](./FILM-CUES.md). Summary:

| Time | Beat |
|------|------|
| 0:00 | Merchant tab: Ember & Oak score ~50/100, CAPTCHA ON |
| 0:20 | Human adds item; harness `add_to_order` — co-shop order |
| 0:50 | Readiness checks: stale feed, missing GTIN, funnel counters |
| 1:10 | **Switch to Neon Matcha** — compare readiness scores |
| 1:35 | `prepare_checkout` blocked → toggle CAPTCHA → succeeds |
| 2:00 | Share link + 10 tools in `registerTools.ts` |
| 2:30 | Pitch: platform strangers fork |

---

## Links

- Repo: https://github.com/Morkeeth/tooltruth-webmcp
- Fork guide: [`FORK.md`](./FORK.md)
- Research citations: [`research.md`](./research.md)
- Challenge: https://webmcp.devpost.com/
