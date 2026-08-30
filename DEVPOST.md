# Devpost submission copy — ReadyCounter

Paste-ready fields for [WebMCP Challenge](https://webmcp.devpost.com/).  
Stats sourced in [`research.md`](./research.md).

---

## Live demo

```text
https://YOUR-APP.vercel.app
https://YOUR-APP.vercel.app/?store=neon-matcha
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

AI traffic is up 8× on Shopify, but most stores lose agent shoppers silently—stale feeds, CAPTCHA walls, thin catalog schema. **ReadyCounter** is a **forkable platform**: duplicate one entry in `src/data/stores.ts`, ship **13 structured WebMCP tools**, REST API v1, and Shopify Catalog export, and let merchants see a data-backed **readiness score** (why agents abandon). Two demo stores prove different failure modes—**Ember & Oak** (CAPTCHA) vs **Neon Matcha Lab** (`?store=neon-matcha`, account wall). Humans and agents **co-edit the same order** in-tab; `prepare_checkout` never charges a card.

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
2. **13 WebMCP tools** — commerce suite, merchant readiness, Shopify export, and live room creation. JSON schemas in `src/webmcp/registerTools.ts`.
3. **REST API v1** — `/health`, `/catalog`, `/readiness`, `/rooms` on Vercel serverless. Same catalog surface agents and partners consume.
4. **Merchant readiness dashboard** — score /100, failure-mode checks, CAPTCHA/account toggles, live agent funnel.
5. **Co-shop + share links** — `?co=` hydrates order across tabs; API rooms (`?room=`) sync human + agent on deploy.
6. **Judge harness** — invoke every tool without `chrome://flags/#enable-webmcp-testing`.

### Deep integrations (Shopify + Vercel)

**For Shopify judges:** ReadyCounter exports a **Shopify Catalog–shaped JSON feed** from the same product data that powers WebMCP tools. Merchants download it from the **Integrations** tab or call `GET /api/v1/catalog?storeId=` — the response includes a `shopify_catalog` object agents can ingest without scraping PDPs. `validate_catalog_feed` and `export_shopify_catalog` tools expose feed issues (missing GTIN, stale price) that drive the readiness score.

**For Vercel judges:** Five serverless API routes in `/api/v1/` deploy with zero config (`vercel.json` SPA rewrite included). `POST /api/v1/rooms` creates a live co-shop session; human and agent tabs sync via polling. The `create_coshop_room` WebMCP tool wraps the same endpoint — one click from the judge harness on the deployed URL. Local dev: `vercel dev` runs UI + API together.

See [`INTEGRATIONS.md`](./INTEGRATIONS.md) for curl examples and architecture.

### WebMCP tools (13)

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
| `validate_catalog_feed` | Feed issue report |
| `export_shopify_catalog` | Shopify Catalog JSON |
| `create_coshop_room` | Live API-backed session |

### Fork path

Duplicate a `src/data/stores.ts` entry → open `?store=your-id`. Five-minute guide: [`FORK.md`](./FORK.md).

### Human-in-the-loop constraint

`prepare_checkout` validates the order and returns totals—it **never charges a card**. Checkout blocked when CAPTCHA or account wall is on (demo of Presenc abandon drivers).

---

## Built with

- React 19 + TypeScript + Vite
- Zustand (shared order state + persist)
- WebMCP `document.modelContext.registerTool`
- Vercel serverless API routes
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
5. **Integrations** — Download Shopify JSON; on live URL run `create_coshop_room` → open returned link in incognito.
6. **Readiness tools** — Harness `get_readiness_score` + `export_shopify_catalog` on each store.

### Optional: native WebMCP

Chrome 149+ → `chrome://flags/#enable-webmcp-testing` → badge shows "WebMCP live · 13 tools".

### Optional: API (deployed or `vercel dev`)

```bash
curl -s https://YOUR-APP.vercel.app/api/v1/health
curl -s 'https://YOUR-APP.vercel.app/api/v1/catalog?storeId=ember-oak' | jq '.shopify_catalog.products | length'
```

---

## Demo steps (video spine, no flag)

See [`DEMO-SCRIPT.md`](./DEMO-SCRIPT.md) · [`FILM-CUES.md`](./FILM-CUES.md). Summary:

| Time | Beat |
|------|------|
| 0:00 | Merchant tab: Ember & Oak score ~50/100, CAPTCHA ON |
| 0:20 | Human adds item; harness `add_to_order` — co-shop order |
| 0:50 | Readiness checks: stale feed, missing GTIN, funnel counters |
| 1:10 | **Switch to Neon Matcha** — compare readiness scores |
| 1:25 | **Integrations tab** — Shopify JSON download + live room |
| 1:35 | `prepare_checkout` blocked → toggle CAPTCHA → succeeds |
| 2:00 | Share link + 13 tools in `registerTools.ts` |
| 2:30 | Pitch: platform strangers fork |

---

## Links

- Repo: https://github.com/Morkeeth/tooltruth-webmcp
- Integrations: [`INTEGRATIONS.md`](./INTEGRATIONS.md)
- Fork guide: [`FORK.md`](./FORK.md)
- Research citations: [`research.md`](./research.md)
- Challenge: https://webmcp.devpost.com/
