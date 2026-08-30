# ReadyCounter

**Agent-ready commerce for the WebMCP era.**

AI traffic is here. Most stores lose it silently. ReadyCounter gives **merchants** a readiness score (data-backed) and **developers** a forkable WebMCP storefront where **humans and agents co-edit the same order**.

[WebMCP Challenge](https://webmcp.devpost.com/) · MIT

## The problem (sourced)

| Stat | Source |
|------|--------|
| Shopify: AI traffic **8×** YoY, AI orders **~13×** (Q1 2026) | Earnings call |
| Catalog-powered AI searches convert **2×** vs scraped data | Shopify |
| Agent cart abandonment **~78.6%** — stale price **26%**, CAPTCHA **24%** | Presenc AI 2026 |
| **81%** of product pages lack minimal agent-readable schema | DigitalApplied audit |
| **65%** trust AI to compare prices · **14%** to buy autonomously | Checkout.com / YouGov |

ReadyCounter addresses the **infrastructure gap**: structured WebMCP tools + merchant readiness + human-in-the-loop co-shop (the 51-point trust gap).

## What it does

| View | Audience | Features |
|------|----------|----------|
| **Shop + order** | Shopper + agent | Coffee catalog, shared co-shop order, 8 WebMCP tools |
| **Merchant readiness** | Store owner / dev | Score /100, failure-mode checks, agent funnel, CAPTCHA toggle demo |

## WebMCP tools

All via `document.modelContext.registerTool` in `src/webmcp/registerTools.ts`:

- `search_catalog` · `get_product` · `add_to_order` · `update_line_quantity`
- `remove_line` · `get_order` · `get_delivery_quote` · `prepare_checkout`

## Quick start

```bash
npm install
npm run dev
```

**Judge test (no WebMCP flag):**

1. Open app → add item from catalog (human)
2. Expand **Judge harness** → run `add_to_order` → `get_order` — same order updates
3. **Merchant readiness** tab → score &lt; 70 with CAPTCHA on
4. Toggle CAPTCHA off → run `prepare_checkout` in harness → succeeds

**With WebMCP:** Chrome 149+ `chrome://flags/#enable-webmcp-testing` or ChatGPT in-app browser.

## Stranger test (before filming)

See [`DEMO-SCRIPT.md`](./DEMO-SCRIPT.md) for the full <3 min film spine. Quick checks:

1. Add item from catalog → appears in co-shop order in <10s
2. Judge harness `add_to_order` → same order updates
3. Merchant tab → CAPTCHA toggle changes score and blocks `prepare_checkout`
4. One-sentence pitch without jargon overload

## Pitch

> Shopify proved catalog beats scrape 2×. ReadyCounter is the merchant-ready storefront: structured tools, readiness score, and co-shop so humans never leave the tab.

## License

MIT
