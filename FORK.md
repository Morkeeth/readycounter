# Fork ReadyCounter in 5 minutes

Add your merchant without touching auth, payments, or deploy config.

## What you get

- **13 WebMCP tools** in `src/webmcp/registerTools.ts` (commerce + readiness + Shopify export + live rooms)
- **REST API v1** — your store is automatically served at `/api/v1/catalog?storeId=` and `/api/v1/readiness?storeId=` on Vercel
- **Readiness dashboard** — score /100, failure-mode checks, agent funnel
- **Co-shop order** — human + agent share one cart; `prepare_checkout` never charges a card
- **Share links** — `?co=` encodes order + merchant flags (no backend); `?room=` for API sync on deploy

## Step 1 — Duplicate a store entry (~3 min)

Open `src/data/stores.ts`. Copy the `neon-matcha` block and rename:

```typescript
'your-store-id': {
  id: 'your-store-id',
  name: 'Your Store Name',
  tagline: 'One line for judges',
  products: YOUR_PRODUCTS,
  merchant: {
    storeName: 'Your Store Name',
    checkoutRequiresCaptcha: false,  // flip to demo CAPTCHA abandon
    checkoutRequiresAccount: false,  // flip to demo account wall
  },
  categories: ['powder', 'kits'],    // match your product categories
},
```

**Product shape** (each SKU):

```typescript
{
  id: 'sku-unique-id',
  name: 'Product Name',
  description: 'Agent-readable copy.',
  price: 29,
  currency: 'USD',
  tags: ['tag1'],
  category: 'powder',
  inStock: true,
  gtin: '00812345001001',   // omit to lower readiness score
  feedPrice: 29,            // mismatch with price → stale-feed check fails
}
```

Aim for **≥6 SKUs**. Intentional gaps (missing GTIN, stale feed, OOS, CAPTCHA) make the readiness story visible.

**No API route edits needed** — `api/v1/catalog.ts` and `api/v1/readiness.ts` read from `getStore(storeId)` dynamically.

## Step 2 — Open your store (~30 sec)

```bash
npm install
npm run dev
```

Visit:

```text
http://localhost:5173/?store=your-store-id
```

Or use the **Demo store** dropdown in the header.

## Step 3 — Test API surface (~1 min)

**Local with API routes:**

```bash
npm i -g vercel   # once
vercel dev        # http://localhost:3000
```

```bash
curl -s 'http://localhost:3000/api/v1/catalog?storeId=your-store-id' | jq '.productCount'
curl -s 'http://localhost:3000/api/v1/readiness?storeId=your-store-id' | jq '.score'
curl -s 'http://localhost:3000/api/v1/catalog?storeId=your-store-id' | jq '.shopify_catalog.products | length'
```

**UI check:** Integrations tab → **Download Shopify JSON** → product count matches your catalog.

## Step 4 — Verify (~1 min)

```bash
npm run verify
```

Checks both demo stores plus integration invariants: SKU count, readiness delta, share roundtrip, Shopify export, room create+patch.

## Step 5 — Deploy (Oscar's click)

See [`DEPLOY.md`](./DEPLOY.md). Vercel one-click; SPA rewrite + API routes already in `vercel.json`.

Live URL pattern:

```text
https://YOUR-APP.vercel.app/?store=your-store-id
```

API on deploy (no extra config):

```text
GET  https://YOUR-APP.vercel.app/api/v1/catalog?storeId=your-store-id
GET  https://YOUR-APP.vercel.app/api/v1/readiness?storeId=your-store-id
POST https://YOUR-APP.vercel.app/api/v1/rooms  {"storeId":"your-store-id"}
```

Harness → `create_coshop_room` on live URL returns a shareable `?room=…&store=your-store-id` link.

## Tool surface (do not trim)

| Tool | Purpose |
|------|---------|
| `search_catalog` | Agent discovery |
| `get_product` | Full SKU record |
| `add_to_order` | Co-shop cart |
| `update_line_quantity` | Line edits |
| `remove_line` | Line removal |
| `get_order` | Shared order state |
| `get_delivery_quote` | Shipping quote |
| `prepare_checkout` | Validate — never charges |
| `get_readiness_score` | Merchant score + checks |
| `get_merchant_config` | CAPTCHA / account flags |
| `validate_catalog_feed` | Feed issue report |
| `export_shopify_catalog` | Shopify Catalog JSON |
| `create_coshop_room` | Live API-backed session |

## Judge path without WebMCP flag

Expand **Judge harness** at the bottom of the page. Every tool runs locally — no `chrome://flags` required.

## What not to add (constitution)

- No real payments (`prepare_checkout` validates only)
- No Shopify OAuth / merchant login (post-hack)
- No removal of share links or multi-store switcher

## Need a film spine?

- [`DEMO-SCRIPT.md`](./DEMO-SCRIPT.md) — full <3 min arc
- [`FILM-CUES.md`](./FILM-CUES.md) — Oscar cue cards
- [`JUDGE-60s.md`](./JUDGE-60s.md) — tired-judge fast path
- [`INTEGRATIONS.md`](./INTEGRATIONS.md) — curl + architecture
