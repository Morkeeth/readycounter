# ReadyCounter

**Agent-ready commerce for the WebMCP era.**

AI traffic is here. Most stores lose it silently. ReadyCounter gives **merchants** a readiness score (data-backed) and **developers** a forkable WebMCP storefront where **humans and agents co-edit the same order**.

[WebMCP Challenge](https://webmcp.devpost.com/) · [Devpost copy](./DEVPOST.md) · [Research citations](./research.md) · MIT

## Pitch

> Shopify proved catalog beats scrape 2×. ReadyCounter is the merchant-ready storefront: structured WebMCP tools, a live readiness score, and co-shop so humans never leave the tab—because 65% trust AI to compare prices but only 14% trust it to buy autonomously ([YouGov/Checkout.com](./research.md#checkoutcom--yougov-65-trust-compare--14-auto-buy-51pt-gap)).

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
| **Shop + order** | Shopper + agent | Coffee catalog, shared co-shop order, 8 WebMCP tools |
| **Merchant readiness** | Store owner / dev | Score ring /100, failure-mode checks, agent funnel, CAPTCHA toggle demo |

## WebMCP tools

All via `document.modelContext.registerTool` in `src/webmcp/registerTools.ts`:

- `search_catalog` · `get_product` · `add_to_order` · `update_line_quantity`
- `remove_line` · `get_order` · `get_delivery_quote` · `prepare_checkout`

## Quick start

```bash
npm install
npm run dev
```

## Judge test (no WebMCP flag)

1. Open app → add item from catalog (human)
2. Expand **Judge harness** → run `add_to_order` → `get_order` — same order updates
3. **Merchant readiness** tab → score **< 70** with CAPTCHA on (default)
4. Toggle CAPTCHA off → score rises → run `prepare_checkout` in harness → succeeds
5. Merchant funnel: run harness buttons → `catalog_search`, `add_to_order`, `checkout_prepare` counters increment

**With WebMCP:** Chrome 149+ `chrome://flags/#enable-webmcp-testing` or ChatGPT in-app browser.

## Stranger test (before filming)

See [`DEMO-SCRIPT.md`](./DEMO-SCRIPT.md) for the full <3 min film spine. Quick checks:

1. Add item from catalog → appears in co-shop order in <10s
2. Judge harness `add_to_order` → same order updates
3. Merchant tab → CAPTCHA toggle changes score ring and blocks `prepare_checkout`
4. One-sentence pitch without jargon overload

## Build & lint

```bash
npm run build
npm run lint
```

## License

MIT
