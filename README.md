# ReadyCounter

**Agent-ready commerce — score your store, co-shop with your assistant.**

AI shoppers are arriving. Most stores lose them at checkout — CAPTCHA walls, login gates, stale catalog feeds. ReadyCounter gives merchants a **readiness score** with one-click fixes, and gives shoppers a **shared cart** where humans and assistants build the same order in one tab.

**Live:** https://tooltruth-webmcp.vercel.app · second store: `?store=neon-matcha`

## Who it's for

| You are | You get |
|---------|---------|
| **Merchant / operator** | Readiness score /100, checkout blocker audit, catalog feed validation, autopilot fixes |
| **Shopper** | Browse, co-shop with your assistant, share a cart link — no account required |
| **Developer** | REST API, Shopify catalog import/export, 16 structured agent tools, OpenAPI spec |

## How it works

1. **Open the URL** — pick a store or import your catalog under Connect
2. **Shop** — add items yourself or let your assistant use structured tools (search, add to cart, prepare checkout)
3. **Readiness** — see what's blocking assistants and apply fixes
4. **Share** — copy a cart link or start a live session so someone else joins the same order

`prepare_checkout` validates the order and returns totals. **It never charges a card** — a human confirms payment in the browser.

## Sample stores

| Store | URL | Notes |
|-------|-----|-------|
| Ember & Oak Coffee | _(default)_ | Specialty coffee |
| Neon Matcha Lab | `?store=neon-matcha` | Ceremonial matcha |

Import your own catalog: **Connect → Import your catalog** (Shopify JSON).

## API & integrations

| Endpoint | Purpose |
|----------|---------|
| `GET /api/v1/catalog?storeId=` | Products + Shopify-shaped export |
| `GET /api/v1/readiness?storeId=` | Score, checks, feed validation |
| `GET /api/v1/tools` | Agent tool manifest |
| `POST /api/v1/rooms` | Live co-shop sessions |
| `POST /api/v1/stores/custom` | Register catalog server-side |

Full reference: [`INTEGRATIONS.md`](./INTEGRATIONS.md) · OpenAPI at `/openapi.yaml`

## Agent tools (16)

Structured tools registered via WebMCP — search, cart, checkout validation, readiness, catalog import, live rooms. See [`src/webmcp/toolManifest.ts`](./src/webmcp/toolManifest.ts).

Test without the browser flag: **Connect → Agent tool console**.

## Run locally

```bash
npm install
npm run dev          # UI + co-shop
vercel dev           # UI + REST API + live sessions
npm run verify       # readiness, stores, integrations, ambition checks
```

## Why readiness matters

Primary sources: [`research.md`](./research.md)

| Stat | Source |
|------|--------|
| Shopify: AI traffic **8×** YoY, AI orders **~13×** (Q1 2026) | [Shopify Enterprise](https://www.shopify.com/enterprise/blog/ai-search-insights) |
| Catalog-powered AI searches convert **2×** vs scraped data | [Shopify Q1 2026](https://stockanalysis.com/stocks/shop/transcripts/555081-q1-2026/) |
| Agent cart abandonment **~78.6%** — stale price **26%**, CAPTCHA **24%** | [Presenc AI 2026](https://presenc.ai/research/agent-cart-abandonment-statistics-2026) |
| **65%** trust AI to compare · **14%** to buy autonomously | [YouGov / Checkout.com](https://yougov.com/en-us/articles/53808-american-trust-in-ai-for-retail-consumer-sentiment-in-2025) |

## Fork your own store

Add an entry to [`src/data/stores.ts`](./src/data/stores.ts) or import a feed. See [`FORK.md`](./FORK.md).

## License

MIT
