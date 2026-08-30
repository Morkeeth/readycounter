# Submission pack — ReadyCounter · WebMCP Challenge

**Deadline:** Wed 3 Sep 2026 @ 22:00 CEST  
**Devpost:** https://webmcp.devpost.com/

---

## Live URL

```
PASTE VERCEL URL HERE AFTER DEPLOY
```

## Repo

https://github.com/Morkeeth/tooltruth-webmcp

## Copy-paste fields

See [`DEVPOST.md`](./DEVPOST.md) for full text.

| Field | Value |
|-------|-------|
| **Name** | ReadyCounter |
| **Tagline** | Agent-ready storefront with readiness score + co-shop |
| **Built with** | React, TypeScript, Vite, WebMCP, Zustand, Vercel API |

## Integration story (Shopify + Vercel judges)

ReadyCounter is **API-first agent commerce**: 13 WebMCP tools, REST v1, and Shopify Catalog export share one catalog surface in `src/data/stores.ts`.

- **Shopify path:** Integrations tab → **Download Shopify JSON** (or `GET /api/v1/catalog?storeId=` → `shopify_catalog`). Feed validation drives readiness score — missing GTIN, stale price, thin catalog.
- **Vercel path:** Five serverless routes in `/api/v1/` deploy with the SPA. `create_coshop_room` tool → `POST /api/v1/rooms` → share `?room=…&store=…` for live human+agent sync.
- **Fork path:** Duplicate one store entry → same tools + API + export automatically. See [`FORK.md`](./FORK.md).

Full curl + architecture: [`INTEGRATIONS.md`](./INTEGRATIONS.md)

## Testing instructions (judges)

1. Open **live URL** (no WebMCP flag required)
2. Click **Start co-shopping**
3. Add a product → refresh → order persists
4. **Copy co-shop link** → open in incognito → same order
5. Switch store to **Neon Matcha Lab** → Merchant tab → different readiness failure (account wall)
6. **Integrations** tab → download Shopify JSON · (deployed) harness `create_coshop_room`
7. Expand **Judge harness** → run `get_readiness_score` + `export_shopify_catalog` + `prepare_checkout`
8. Optional: Chrome `chrome://flags/#enable-webmcp-testing` → 13 tools register live

## Video spine

See [`DEMO-SCRIPT.md`](./DEMO-SCRIPT.md) — lead with share link, show Integrations tab before close.

## Sealed prediction (before submit)

| Prediction | Kill bar |
|------------|----------|
| Judges click live URL | ≥1 partner comment mentions merchant readiness |
| Share link demo | Film shows incognito same-order |
| Integration demo | Film shows Shopify JSON download or `create_coshop_room` on live URL |

---

## Oscar-only clicks

- [ ] Deploy Vercel
- [ ] Paste URL above
- [ ] Upload video
- [ ] Submit Devpost
