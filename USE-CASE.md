# Use case — Shopify + Render

**ReadyCounter is the agent-readiness counter for Shopify merchants.**

Connect your real catalog, get an itemised abandonment bill, co-shop with an assistant, and return tomorrow — your store and live sessions survive serverless cold starts.

## The loop (three paths, one outcome)

```
                    ┌─────────────────────────────────────┐
                    │         ReadyCounter (Vercel)        │
                    │  readiness tape · 18 tools · co-shop   │
                    └──────────────┬──────────────────────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         │                         │                         │
         ▼                         ▼                         ▼
  Paste storefront URL    Connect Shopify OAuth      Import catalog JSON
  (JSON-LD / products.json)  (read-only Admin API)   (manual / export)
         │                         │                         │
         └─────────────────────────┼─────────────────────────┘
                                   ▼
                    ┌─────────────────────────────────────┐
                    │     Render Key Value (Redis)           │
                    │  persisted stores · live co-shop rooms │
                    └─────────────────────────────────────┘
```

## Why both integrations matter

| Piece | Role | Merchant sees |
|-------|------|----------------|
| **Shopify OAuth** | Pulls real SKUs, prices, GTINs from Admin API | "This is *my* catalog, not a demo coffee shop" |
| **Render KV** | Stores synced catalogs + live room state across cold starts | "My audit link still works tomorrow; live cart sync is real" |
| **Vercel** | Static app + serverless API | Fast global URL, no ops |

## Primary persona

**Indie Shopify operator** (coffee, matcha, DTC) who heard AI traffic is up 8× and wants to know why agents abandon — without pasting JSON or reading WebMCP docs.

## Proof mechanics

1. **Readiness tape** — six lines, each tied to a published Presenc AI abandonment share
2. **Co-shop** — human + assistant share one order (`?co=` or `?room=` + Redis)
3. **Sandbox fixes** — autopilot toggles prove *what would change the score*; live checkout unchanged until merchant acts

## Honest limits (v1)

- URL audit reads public JSON-LD / `products.json` — cannot see CAPTCHA or login walls on live checkout without a deeper crawl
- OAuth is read-only — no payments, no order write
- Autopilot fixes apply to ReadyCounter sandbox flags, not merchant Shopify theme

## One-liner for distribution

> Connect Shopify → see why agents abandon your catalog → co-shop the fix in one tab. Your store persists on Render; your bill cites real research rows.
