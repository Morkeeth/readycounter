# Judge path — 5 minutes (live UI · Sep 2026)

No API keys. **Path B** (below) works without a WebMCP browser flag.
**Path A (native):** [`CHATGPT-JUDGE.md`](./CHATGPT-JUDGE.md)

**Live:** https://tooltruth-webmcp.vercel.app  
**Judge deep link:** https://tooltruth-webmcp.vercel.app/?judge=1

Nav tabs on the live product: **Connect · Readiness · Co-shop**.
There is no “Start shopping” button and no “Start live session”.

---

## Timed path

| Time | Action | Pass |
|------|--------|------|
| **0:00** | Open [`/?view=shop`](https://tooltruth-webmcp.vercel.app/?view=shop) — click **Add to order** on any product | Item appears in **Co-shop order** panel with a **HUMAN** chip |
| **0:20** | **Connect** → scroll to **Agent tool console** → run **`add_to_order`** then **`get_order`** | Same order · **HUMAN** + **AGENT** chips |
| **0:40** | Run **`prepare_checkout`** (console sample or Co-shop **Prepare checkout**) | Refuses with wall citation · **never charges** |
| **0:50** | **Readiness** (ember-oak) → toggle **CAPTCHA on checkout** off | Score **70 → 94** · delta = **24** |
| **1:00** | **Connect** → paste **colourpop.com** → **Audit** → rankings filter **UCP GTIN · scrape empty** | **78/148** crawled · **0%** scrape GTIN · **11** UCP gaps |

---

## Step detail

### 0:00 · Human add (Co-shop)

1. Open `/?view=shop` (or click **Co-shop**).
2. Click **Add to order** on House Espresso Blend (or any SKU).
3. Confirm the line in **Co-shop order** shows a **HUMAN** actor chip.

### 0:20 · Agent add (Path B console)

1. Click **Connect** (`/?view=integrations`).
2. Scroll to **Agent tool console** (Path B — no Chrome flag).
3. Click **`add_to_order: first SKU`**, then **`get_order`**.
4. Return to **Co-shop** — new line shows **AGENT**; prior line still **HUMAN**.

### 0:40 · Refusal (never charges)

1. In the console click **`prepare_checkout`**, or on Co-shop click **Prepare checkout (human confirms)**.
2. **Pass:** blocked with a CAPTCHA / wall citation (Presenc AI). No charge. No card form.

### 0:50 · Sandbox delta

1. **Readiness** tab · store **Ember & Oak** (`/?store=ember-oak&view=merchant`).
2. Starting tape: **70/100** · CAPTCHA line **0/24** · CHECKOUT VOID.
3. Uncheck **CAPTCHA on checkout** (or Autopilot / `apply_readiness_fix: disable_captcha`).
4. **Pass:** **70 → 94** · delta exactly **24** (Presenc CAPTCHA row).

### 1:00 · Field width

1. **Connect** → paste `colourpop.com` → **Audit**.
2. Open rankings → filter **ucp gtin · scrape empty** (chip shows **11**).
3. **Pass:** batch **78/148** · scrape GTIN **0%** · **11** UCP-gap stores.

---

## Badge (what you should see)

| Mode | Header badge |
|------|----------------|
| Flag off (most judges) | **Tools ready · Connect to test** |
| Path A native WebMCP | **WebMCP live · 18 tools** |

---

## Optional +30s

| Action | Why |
|--------|-----|
| `?store=neon-matcha` | Second merchant **65/100** (account + payment + GTIN) |
| `?judge=1` | Co-shop + proof banner |
| Native flag | Path A — see [`CHATGPT-JUDGE.md`](./CHATGPT-JUDGE.md) |
| `npm run verify` | Automated proof (cold clone) |

---

## 18 WebMCP tools

`GET /api/v1/tools` · source: `src/webmcp/registerTools.ts`

**Constitution:** `prepare_checkout` never charges a card.
