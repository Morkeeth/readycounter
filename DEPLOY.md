# Deploy — ReadyCounter

## Vercel (recommended)

1. Import https://github.com/Morkeeth/readycounter
2. Framework: **Vite**
3. Build: `npm run build` · Output: `dist`
4. Deploy

No env vars required for core product (localStorage + share links).

## Verify after deploy

```bash
curl -sI https://readycounter.vercel.app | head -5
```

Manual stranger test:

1. Open URL → **Co-shop** tab
2. Add item → refresh → order remains
3. **Copy co-shop link** → incognito → same order
4. `?store=neon-matcha` → different catalog, account-wall readiness

## Optional env (Vercel → Settings → Environment Variables)

| Variable | Purpose |
|----------|---------|
| `SHOPIFY_CLIENT_ID` | Dev Dashboard app credentials |
| `SHOPIFY_CLIENT_SECRET` | **Never commit** — Vercel only |
| `SHOPIFY_APP_URL` | `https://readycounter.vercel.app` |
| `SHOPIFY_DEV_SHOP` | `your-dev-store.myshopify.com` (same Partner org) |
| `SHOPIFY_SCOPES` | `read_products,read_product_listings` |

**Shopify app redirect URL (required):**
`https://readycounter.vercel.app/api/v1/shopify/callback`

Local: copy `.env.example` → `.env.local` (gitignored).

| `REDIS_URL` | Render Key Value connection string — durable co-shop rooms + imported stores |
| `RENDER_API_KEY` | Local only — `npm run render:setup` / `render:create-kv` |

Provision Key Value:

```bash
# RENDER_API_KEY in .env.local (from Render dashboard → Account → API keys)
npm run render:setup          # list / print REDIS_URL
npm run render:create-kv      # create readycounter-kv if missing
```

After deploy: `curl -s https://readycounter.vercel.app/api/v1/health | jq .kv`

## Optional later

| Env | Purpose |
|-----|---------|
| `UPSTASH_REDIS_REST_URL` | Alternative to Render if you prefer Upstash REST |

## Oscar checklist

- [ ] Deploy URL copied to `DEVPOST.md` + `SUBMISSION-PACK.md`
- [ ] Test share link on mobile Safari
- [ ] Film uses **live URL** not localhost
