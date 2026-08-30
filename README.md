# ReadyCounter

**Agent-ready commerce platform for the WebMCP era.**

AI traffic is here. Most stores lose it silently, and no dashboard tells them
which door is locked. ReadyCounter gives **merchants** a readiness score they can
audit line by line, **developers** a forkable multi-store WebMCP platform, and
**shoppers** a co-shop where a human and an agent share one order.

**Try it:** `https://YOUR-APP.vercel.app` · second store: `?store=neon-matcha` · a tab directly: `?view=merchant` _(Vercel URL after deploy)_

![ReadyCounter merchant readiness — the tape](./docs/shots/03-merchant-1440.png)

[WebMCP Challenge](https://webmcp.devpost.com/) · [Devpost copy](./DEVPOST.md) · [Fork in 5 min](./FORK.md) · [Judge 60s](./JUDGE-60s.md) · [Research](./research.md) · MIT

## Pitch

> **The counter prints the score.** ReadyCounter rates a storefront out of 100 for agent shoppers and prints the rating as an **itemised bill** — every point traced to a named check, its arithmetic, its one-line fix, and the page the weight came from, with the date it was read. Two of the five weights are published shares of abandoned agent carts; the other three are ours, and the receipt says so on the line. The store itself ships **13 structured WebMCP tools**, so a human and an agent co-edit one order in one tab — because 65% trust AI to compare prices but only 14% trust it to place the order ([YouGov / Checkout.com](./research.md)).

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

ReadyCounter addresses the **infrastructure gap**: structured WebMCP tools + merchant readiness + human-in-the-loop co-shop.

## What it does

| View | Audience | Features |
|------|----------|----------|
| **Shop + order** | Shopper + agent | Multi-store catalog, shared co-shop order, share links |
| **Merchant readiness** | Store owner / dev | The readiness tape — itemised score /100, per-line source + fix, CHECKOUT VOID stamp, agent funnel, CAPTCHA/account toggles |
| **Integrations** | Developer | REST API status, Shopify-shaped catalog export with feed issues, live co-shop rooms |

### How the score is built

100 points across five checks. **26** and **24** are *measured* — they are the
shares of abandoned agent carts Presenc AI attributes to a stale price feed and
to a verification wall. The remaining **50** are *allocated by us*, and every
surface that prints the score says which is which.

`npm run verify` fails the build if a measured weight stops equalling the figure
its source publishes, if a source loses its URL or its read date, or if a source
URL is not quoted in [`research.md`](./research.md). Full derivation and the
list of assertions: [`research.md` § How the readiness score is weighted](./research.md).

Observable consequence: clearing the CAPTCHA on Ember & Oak moves the score
**70 → 94** — a delta of exactly **24**, the published figure.

## WebMCP tools (13)

All via `document.modelContext.registerTool` in [`src/webmcp/registerTools.ts`](./src/webmcp/registerTools.ts):

- `search_catalog` · `get_product` · `add_to_order` · `update_line_quantity`
- `remove_line` · `get_order` · `get_delivery_quote` · `prepare_checkout`
- `get_readiness_score` · `get_merchant_config` · `validate_catalog_feed`
- `export_shopify_catalog` · `create_coshop_room`

`prepare_checkout` validates and returns totals. **It never charges a card.**
When a wall is up it refuses, and the refusal names the wall, its point cost,
and the page that priced it.

## Quick start

```bash
npm install
npm run dev
```

Open `http://localhost:5173` or `http://localhost:5173/?store=neon-matcha`.

## Judge test (no WebMCP flag)

Full 60-second path: [`JUDGE-60s.md`](./JUDGE-60s.md)

1. Start co-shopping → add item from catalog (human)
2. **Judge harness** → run `add_to_order` → `get_order` — same order updates
3. **Merchant readiness** → Ember & Oak score **< 70** with CAPTCHA on
4. Toggle CAPTCHA off → score rises → `prepare_checkout` succeeds
5. Switch to **Neon Matcha Lab** → different score, account wall check fails
6. Harness `get_readiness_score` on both stores — compare JSON

**With WebMCP:** Chrome 149+ `chrome://flags/#enable-webmcp-testing` or ChatGPT in-app browser.

## Verify

```bash
npm run verify   # readiness + share roundtrip + both stores
npm run build
npm run lint
```

## Stranger test (before filming)

See [`DEMO-SCRIPT.md`](./DEMO-SCRIPT.md) · [`FILM-CUES.md`](./FILM-CUES.md). Quick checks:

1. Add item → appears in co-shop order in <10s
2. Harness `add_to_order` → same order updates
3. Store switch → readiness score + blocker change (CAPTCHA ↔ account)
4. One-sentence pitch without jargon overload

## License

MIT
