# Render partnership — ReadyCounter

ReadyCounter uses **Render as the durable data plane** while **Vercel** serves the merchant-facing app. This is intentional: serverless is great for APIs and UI; agent-ready commerce needs state that survives cold starts.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Vercel (tooltruth-webmcp.vercel.app)                        │
│  · React UI · serverless API · Shopify OAuth · URL audit     │
└───────────────────────────┬─────────────────────────────────┘
                            │ REDIS_URL (TLS)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Render Key Value — readycounter-kv (oregon)               │
│  rc:store:*     synced Shopify catalogs + URL audit slugs    │
│  rc:room:*      live co-shop sessions (SSE + PATCH)          │
│  rc:render:*    partnership metadata + audit batch results   │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Render Cron (optional) — readycounter-audit-cron            │
│  Daily batch audit of DTC storefronts → written to KV        │
│  Surfaced in Connect tab via GET /api/v1/render/status         │
└─────────────────────────────────────────────────────────────┘
```

## What Render powers (not just "we use Redis")

| Capability | Without Render | With Render KV |
|------------|----------------|----------------|
| Shopify OAuth connect → return tomorrow | Store gone after cold start | `rc:store:{slug}` persists |
| Live co-shop `?room=` | In-memory lie | `rc:room:{id}` survives deploy |
| Batch shop audits | Local JSON file only | `rc:render:audit-batch:latest` on KV |
| Partnership ops | Manual dashboard | `render.yaml` + `npm run render:setup` |

## Setup

```bash
# 1. Provision KV (once)
npm run render:create-kv
# → writes REDIS_URL to .env.local, set same on Vercel

# 2. Open external access for Vercel
node scripts/render-setup.mjs --allow-external

# 3. Verify production
curl -s https://tooltruth-webmcp.vercel.app/api/v1/render/status | jq .

# 4. Run batch audit → KV
npm run audit:shops
npm run render:publish-audit   # pushes last batch to Render KV

# 5. Optional: deploy cron via Blueprint
# Render Dashboard → New → Blueprint → render.yaml
```

## API

| Endpoint | Purpose |
|----------|---------|
| `GET /api/v1/health` | `kv.backend: redis`, `render` block |
| `GET /api/v1/render/status` | Full partnership status + last audit batch from KV |

## Partnership narrative (Devpost / outbound)

> **Shopify** brings the merchant catalog. **Render Key Value** makes the audit and co-shop session real across serverless. ReadyCounter is the readiness counter that sits between them — scoring agent abandonment with published weights, not vibes.

## Env

| Variable | Where | Purpose |
|----------|-------|---------|
| `REDIS_URL` | Vercel + Cron | Render Key Value connection string |
| `RENDER_API_KEY` | Local only | `render-setup.mjs` provisioning |
| `RENDER_KV_ID` | Optional | Dashboard deep link |
