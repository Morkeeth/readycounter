# Judge path — 5 minutes

No API keys. No WebMCP flag required (Path B below). One cold clone.

```bash
git clone https://github.com/Morkeeth/tooltruth-webmcp.git
cd tooltruth-webmcp && npm install && npm run dev
```

Open **http://localhost:5173** (or live when deployed).

**Live:** https://tooltruth-webmcp.vercel.app

---

## 5-minute path (live UI · Sep 2026)

Tabs are **Connect · Readiness · Co-shop** — not “Start shopping”. Deep-link with `?view=`.

| Time | Action | Pass |
|------|--------|------|
| **0:00** | Open `/?view=shop` — **Add** any in-stock SKU to the co-shop order | Item visible in **Co-shop order** panel |
| **0:20** | **Connect** tab → expand **Path B — Agent tool console** → run **`add_to_order`** (first SKU) then **`get_order`** | Same order; `human` + `agent` chips on lines |
| **0:40** | In the console, run **`prepare_checkout`** (CAPTCHA still on) | **Refuses** — cites the wall + Presenc source; **never charges** |
| **0:50** | **Readiness** tab — Ember & Oak (**ember-oak**), score **70/100**, CAPTCHA **ON** → toggle CAPTCHA **off** | Score **70 → 94** (delta **24**) |
| **1:00** | **Connect** → paste `https://colourpop.com` → **Audit storefront** → scroll **DTC rankings** → filter **UCP GTIN · scrape empty** | Batch **78/148**, scrape GTIN **0%**, filter shows **11** rows |

Re-derive batch numbers at the API (do not copy from this doc):

```bash
curl -s https://tooltruth-webmcp.vercel.app/api/v1/rankings | jq '{succeeded,shopCount,avgGtinPct,ucp}'
# succeeded: 78, shopCount: 148, avgGtinPct: 0, ucp.gtinWhereCrawlZero: 11

curl -s https://tooltruth-webmcp.vercel.app/api/v1/tools | jq '.toolCount'
# 18
```

---

## Optional +30s

| Action | Why it matters |
|--------|----------------|
| **Copy co-shop link** (`?co=`) → incognito | Shareable cart survives fresh context |
| **Readiness → Run agent journey** | Same path as tools, step-by-step |
| **Second merchant** `?store=neon-matcha` | **65/100** — account wall **15**, payment **0/11**, records **2/6** |
| `npm run verify` | Automated proof (score deltas, tool count, share) |
| Native WebMCP (Path A) | [`CHATGPT-JUDGE.md`](./CHATGPT-JUDGE.md) — flag or ChatGPT browser |

---

## 18 WebMCP tools

`search_catalog` · `get_product` · `add_to_order` · `update_line_quantity` · `remove_line` · `get_order` · `get_delivery_quote` · `prepare_checkout` · `get_readiness_score` · `get_merchant_config` · `simulate_agent_journey` · `apply_readiness_fix` · `import_shopify_catalog` · `validate_catalog_feed` · `export_shopify_catalog` · `create_coshop_room` · `get_field_companion` · `review_against_field`

Source: `src/webmcp/registerTools.ts` · `GET /api/v1/tools`

---

## Fork in 5 min

Duplicate one entry in `src/data/stores.ts` → `?store=your-id`  
Full guide: [`FORK.md`](./FORK.md)

---

## Constitution

**`prepare_checkout` never charges a card.**
