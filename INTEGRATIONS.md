# Integrations — ReadyCounter

API-first agent commerce. WebMCP tools, REST, and Shopify Catalog feeds share one surface.

## REST API v1

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/health` | GET | Service health |
| `/api/v1/catalog?storeId=` | GET | Products + Shopify-shaped export |
| `/api/v1/readiness?storeId=` | GET | Score + checks + feed validation |
| `/api/v1/rooms` | POST | Create live co-shop room |
| `/api/v1/rooms/:roomId` | GET, PATCH | Sync order across human + agent |

### Create live room (curl)

```bash
curl -sX POST https://tooltruth-webmcp.vercel.app/api/v1/rooms \
  -H 'Content-Type: application/json' \
  -d '{"storeId":"ember-oak"}' | jq
```

Open returned URL: `?room=room-xxx&store=ember-oak`

### Catalog (Shopify partner path)

```bash
curl -s 'https://tooltruth-webmcp.vercel.app/api/v1/catalog?storeId=neon-matcha' | jq '.shopify_catalog'
```

## WebMCP tools (16)

Commerce: `search_catalog` · `get_product` · `add_to_order` · `update_line_quantity` · `remove_line` · `get_order` · `get_delivery_quote` · `prepare_checkout`

Merchant: `get_readiness_score` · `get_merchant_config` · `validate_catalog_feed` · `export_shopify_catalog` · `apply_readiness_fix` · `simulate_agent_journey`

Platform: `create_coshop_room` · `import_shopify_catalog`

## API extras

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/tools` | GET | WebMCP tool manifest |
| `/api/v1/stores/custom` | POST | Register custom catalog (server memory) |
| `/api/v1/rooms/:id/events` | GET | SSE room sync |
| `/openapi.yaml` | GET | OpenAPI 3.1 spec |

## Architecture

```
Agent (WebMCP) ──► registerTool execute ──► Zustand + optional API room sync
Merchant UI ─────► same store state ◄────── REST /api/v1/*
Shopify feed ────► export_shopify_catalog / GET /catalog
```

## Local dev

- `npm run dev` — UI + Zustand + static share links
- `vercel dev` — UI + API routes (live rooms)

## Post-hack

- Vercel KV for durable rooms
- Shopify OAuth + Catalog sync
- Merchant login
