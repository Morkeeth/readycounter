# Judge path — 60 seconds

No API keys. No WebMCP flag. One cold clone.

```bash
git clone https://github.com/Morkeeth/tooltruth-webmcp.git
cd tooltruth-webmcp && npm install && npm run dev
```

Open **http://localhost:5173** (or live URL when deployed).

---

## 0:00–0:15 · Shop

1. Click **Start shopping**
2. **Add** any product → appears in co-shop order panel

**Pass:** item visible in <10 seconds.

---

## 0:15–0:30 · Agent co-shop

1. Open the **Connect** tab → **Agent tool console**
2. Run **`add_to_order`** (pick any SKU)
3. Run **`get_order`**

**Pass:** same order, human + agent lines, badges show `addedBy`.

---

## 0:30–0:45 · Readiness tab (store A)

1. **Readiness** tab — Ember & Oak, score **70/100**, CAPTCHA **ON**
2. **Run agent journey** — blocked at `prepare_checkout`
3. Toggle CAPTCHA **off** → score goes **70 → 94** → journey succeeds

**Pass:** score changes; journey + checkout gate match toggle.

---

## 0:45–0:60 · Platform (store B + audit wedge)

1. Header **Store** → **Neon Matcha Lab** (or `?store=neon-matcha`)
2. **Readiness** — **65/80**: account wall 0/15, payment 0/11, catalog 2/6
3. **Connect** → paste a storefront URL → audit → rankings table shows batch
4. Harness → **`get_readiness_score`** — JSON shows store-specific checks

**Pass:** two merchants, audit path, rankings from Render KV.

---

## Optional +30s

| Action | Why it matters |
|--------|----------------|
| **Copy co-shop link** → incognito | Shareable session |
| **Crawl vs OAuth** on Readiness | A2 comparison panel |
| View page source → `application/ld+json` | Product schema for agents |
| `npm run verify` | Automated proof |

---

## 16 WebMCP tools

`search_catalog` · `get_product` · `add_to_order` · `update_line_quantity` · `remove_line` · `get_order` · `get_delivery_quote` · `prepare_checkout` · `get_readiness_score` · `get_merchant_config` · `simulate_agent_journey` · …

Source: `src/webmcp/registerTools.ts` · `GET /api/v1/tools`

---

## Fork in 5 min

Duplicate one entry in `src/data/stores.ts` → `?store=your-id`  
Full guide: [`FORK.md`](./FORK.md)

---

## Live URL (when deployed)

```text
https://tooltruth-webmcp.vercel.app
https://tooltruth-webmcp.vercel.app/?store=neon-matcha
```

Constitution: **`prepare_checkout` never charges a card.**
