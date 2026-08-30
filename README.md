# ReadyCounter

**Agent-ready commerce platform for the WebMCP era.**

AI traffic is here. Most stores lose it silently. ReadyCounter gives **merchants** a readiness score (data-backed), **developers** a forkable multi-store WebMCP platform with REST + Shopify Catalog export, and **shoppers** co-shop where humans and agents share one order.

**Try it:** `https://YOUR-APP.vercel.app` · second store: `?store=neon-matcha` _(Oscar: Vercel URL after deploy)_

[WebMCP Challenge](https://webmcp.devpost.com/) · [Devpost copy](./DEVPOST.md) · [Integrations](./INTEGRATIONS.md) · [Fork in 5 min](./FORK.md) · [Judge 60s](./JUDGE-60s.md) · [Research](./research.md) · MIT

## Pitch

> Shopify proved catalog beats scrape 2×. ReadyCounter is the merchant-ready storefront strangers fork: **13 structured WebMCP tools**, REST API v1, Shopify Catalog export, a live readiness score, two demo merchants (CAPTCHA vs account wall), and co-shop so humans never leave the tab—because 65% trust AI to compare prices but only 14% trust it to buy autonomously ([YouGov/Checkout.com](./research.md#checkoutcom--yougov-65-trust-compare--14-auto-buy-51pt-gap)).

## Architecture

```
┌─────────────────┐     registerTool execute      ┌──────────────────────────┐
│ Agent (WebMCP)  │ ──────────────────────────► │ Zustand shopStore        │
│ ChatGPT browser │                             │ + optional room sync     │
└─────────────────┘                             └────────────┬─────────────┘
                                                             │
┌─────────────────┐     same store state                   │
│ Merchant UI     │ ◄──────────────────────────────────────┤
│ Shop + Order    │                                        │
│ Integrations    │                                        ▼
└─────────────────┘                             ┌──────────────────────────┐
                                                │ REST /api/v1/*           │
┌─────────────────┐     export_shopify_catalog  │ health · catalog         │
│ Shopify partner │ ◄───────────────────────────│ readiness · rooms        │
│ Catalog feed    │     GET /catalog            └──────────────────────────┘
└─────────────────┘
```

One surface: WebMCP tools, REST endpoints, and Shopify JSON all read from the same `stores.ts` catalog. Deploy on Vercel → API routes + live co-shop rooms. Local-only → Zustand + `?co=` share links.

Full integration guide: [`INTEGRATIONS.md`](./INTEGRATIONS.md)

## Demo stores

| Store | URL param | Failure mode |
|-------|-----------|--------------|
| **Ember & Oak Coffee** | _(default)_ | CAPTCHA blocks agent checkout |
| **Neon Matcha Lab** | `?store=neon-matcha` | Account wall blocks agent checkout |

Switch via header **Demo store** dropdown or URL. Fork yours: duplicate one entry in [`src/data/stores.ts`](./src/data/stores.ts) — see [`FORK.md`](./FORK.md).

## The problem (sourced)

Full primary sources, exact quotes, and access dates: **[`research.md`](./research.md)**

| Stat | Source |
|------|--------|
| Shopify: AI traffic **8×** YoY, AI orders **~13×** (Q1 2026) | [Shopify Enterprise](https://www.shopify.com/enterprise/blog/ai-search-insights) |
| Catalog-powered AI searches convert **2×** vs scraped data | [Shopify Q1 2026 earnings](https://stockanalysis.com/stocks/shop/transcripts/555081-q1-2026/) |
| AI conversion **38% worse → 42% better** (Mar 2025 → Mar 2026) | [Adobe Digital Insights](https://business.adobe.com/blog/ai-traffic-surge-retail-sites-not-machine-readable) |
| Agent cart abandonment **~78.6%** — stale price **26%**, CAPTCHA **24%** | [Presenc AI 2026](https://presenc.ai/research/agent-cart-abandonment-statistics-2026) |
| **81%** of Product-schema pages lack Offer object | [DigitalApplied 5k audit](https://www.digitalapplied.com/blog/schema-markup-adoption-5k-site-audit-2026) |
| **65%** trust AI to compare · **14%** to buy autonomously (**51pt gap**) | [YouGov US / Checkout.com](https://yougov.com/en-us/articles/53808-american-trust-in-ai-for-retail-consumer-sentiment-in-2025) |

ReadyCounter addresses the **infrastructure gap**: structured WebMCP tools + merchant readiness + human-in-the-loop co-shop + API-first catalog export.

## What it does

| View | Audience | Features |
|------|----------|----------|
| **Shop + order** | Shopper + agent | Multi-store catalog, shared co-shop order, share links |
| **Merchant readiness** | Store owner / dev | Score ring /100, failure-mode checks, agent funnel, CAPTCHA/account toggles |
| **Integrations** | Shopify / Vercel judges | REST API status, Shopify JSON download, live room docs |

## REST API v1

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/health` | GET | Service health |
| `/api/v1/catalog?storeId=` | GET | Products + `shopify_catalog` export |
| `/api/v1/readiness?storeId=` | GET | Score + checks + feed validation |
| `/api/v1/rooms` | POST | Create live co-shop room |
| `/api/v1/rooms/:roomId` | GET, PATCH | Sync order across human + agent |

Requires Vercel deploy or `vercel dev` (see below). curl examples: [`INTEGRATIONS.md`](./INTEGRATIONS.md)

## WebMCP tools (13)

All via `document.modelContext.registerTool` in [`src/webmcp/registerTools.ts`](./src/webmcp/registerTools.ts):

**Commerce:** `search_catalog` · `get_product` · `add_to_order` · `update_line_quantity` · `remove_line` · `get_order` · `get_delivery_quote` · `prepare_checkout`

**Merchant:** `get_readiness_score` · `get_merchant_config` · `validate_catalog_feed` · `export_shopify_catalog`

**Platform:** `create_coshop_room`

## Quick start

```bash
npm install
npm run dev          # UI + Zustand + static ?co= share links
```

Open `http://localhost:5173` or `http://localhost:5173/?store=neon-matcha`.

### Local API routes (Vercel)

```bash
npm i -g vercel      # once
vercel dev           # UI + /api/v1/* on http://localhost:3000
```

Integrations tab shows **live (deployed)** when `/api/v1/health` responds. Without `vercel dev`, use **Copy co-shop link** (`?co=`) for offline share.

## Judge test (no WebMCP flag)

Full 60-second path: [`JUDGE-60s.md`](./JUDGE-60s.md)

1. Start co-shopping → add item from catalog (human)
2. **Judge harness** → run `add_to_order` → `get_order` — same order updates
3. **Merchant readiness** → Ember & Oak score **< 70** with CAPTCHA on
4. Toggle CAPTCHA off → score rises → `prepare_checkout` succeeds
5. Switch to **Neon Matcha Lab** → different score, account wall check fails
6. **Integrations** tab → download Shopify JSON · (deployed) run `create_coshop_room`
7. Harness `get_readiness_score` + `export_shopify_catalog` on both stores

**With WebMCP:** Chrome 149+ `chrome://flags/#enable-webmcp-testing` or ChatGPT in-app browser.

## Verify

```bash
npm run verify   # readiness + share + stores + integrations (Shopify export + rooms)
npm run build
npm run lint
```

## Stranger test (before filming)

See [`DEMO-SCRIPT.md`](./DEMO-SCRIPT.md) · [`FILM-CUES.md`](./FILM-CUES.md). Quick checks:

1. Add item → appears in co-shop order in <10s
2. Harness `add_to_order` → same order updates
3. Store switch → readiness score + blocker change (CAPTCHA ↔ account)
4. Integrations tab → Shopify JSON downloads with valid product count
5. One-sentence pitch without jargon overload

## License

MIT
