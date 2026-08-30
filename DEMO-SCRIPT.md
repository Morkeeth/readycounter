# ReadyCounter — demo film spine (< 3 min)

**Audience:** WebMCP judges (Shopify merchant story, Vercel fork, Chrome WebMCP, co-shop trust gap).

**Setup:** `npm run dev` locally OR deployed Vercel URL. Chrome with WebMCP flag optional — judge harness works without it.

---

## 0:00–0:20 — Hook (problem)

**On screen:** Merchant readiness tab, score ~60/100, CAPTCHA ON.

**Voiceover:**

> AI traffic is up 8× on Shopify. But 78% of agent carts still abandon — stale prices, CAPTCHA, thin catalog. ReadyCounter is the merchant-ready storefront: structured WebMCP tools, a readiness score, and co-shop so humans never leave the tab.

**Show:** Data callouts in README or readiness cite block (2× catalog vs scrape, 65% compare vs 14% auto-buy).

---

## 0:20–0:50 — Co-shop (shopper + agent)

**On screen:** Shop + order tab. Ember & Oak Coffee catalog.

1. Human clicks **Add** on a bag of beans — order panel updates.
2. Open **Judge harness** → run `add_to_order` for `sku-pour-over`.
3. Run `get_order` — same shared order, both lines visible, `addedBy: human` / `agent` badges.

**Voiceover:**

> One order, two actors. The agent proposes via tools; the human stays in the tab. That's the 51-point trust gap — compare, don't auto-buy.

---

## 0:50–1:20 — Merchant readiness (why stores lose agent traffic)

**On screen:** Merchant readiness tab — **Ember & Oak Coffee**.

**Show:**
- Score drops with CAPTCHA on
- Price feed mismatch on Brew Scale (stale feed stat)
- Missing GTIN on some SKUs
- Agent funnel counters increment as harness runs

**Voiceover:**

> Merchants see *why* agents fail — not a black box. Toggle CAPTCHA: 24% of abandonments. Stale feed: 26%. Fix the path, score goes up.

---

## 1:05–1:25 — Platform pivot: two stores, one fork ★

**On screen:** Header **Demo store** dropdown → **Neon Matcha Lab** (URL shows `?store=neon-matcha`).

1. Merchant tab — score changes; **account wall** check fails (not CAPTCHA).
2. Harness → `get_readiness_score` on Ember & Oak, then switch store and run again.
3. Harness → `get_merchant_config` — show `checkoutRequiresAccount: true` vs CAPTCHA on store A.

**Voiceover:**

> Same platform, different failure mode. Fork your merchant in five minutes — duplicate one entry in stores.ts, open your URL. That's the wedge: readiness OS strangers can ship.

**Show:** [`FORK.md`](./FORK.md) or `src/data/stores.ts` briefly.

---

## 1:25–1:50 — Integrations (Shopify + Vercel) ★

**On screen:** **Integrations** tab.

1. **REST API** card — status shows **live (deployed)** on Vercel URL (or "local dev — use share link" on localhost).
2. **Shopify Catalog export** card — feed issue count → click **Download Shopify JSON** → open file, show product count matches catalog.
3. Harness → `export_shopify_catalog` — same JSON shape as download.
4. **(Deployed only)** Harness → `create_coshop_room` → copy returned URL → open in incognito → same empty order, room sync active.
5. **(Local fallback)** **Copy co-shop link** → incognito → same order via `?co=`.

**Voiceover:**

> One catalog, three surfaces — WebMCP tools, REST API, Shopify feed. Shopify proved structured catalog wins 2×. We export it; agents consume it; merchants see what's broken before agents bounce.

**Show:** [`INTEGRATIONS.md`](./INTEGRATIONS.md) curl block briefly on deployed URL.

---

## 1:50–2:10 — Checkout gate (human-in-the-loop)

**On screen:** Harness → `prepare_checkout` with CAPTCHA ON → blocked message with Presenc stat.

Toggle CAPTCHA off in Merchant → run `prepare_checkout` again → succeeds.

Human clicks **Prepare checkout** in order panel → "Ready for human payment."

**Voiceover:**

> `prepare_checkout` never charges a card. Agents validate; humans pay. That's WebMCP co-shopping done right.

---

## 2:10–2:35 — Developer story (optional WebMCP live)

**If Chrome WebMCP flag on:** badge shows "WebMCP live · 13 tools". ChatGPT/browser agent discovers tools natively.

**If not:** point at `src/webmcp/registerTools.ts` — 13 tools, structured schemas, forkable Vite app.

**Voiceover:**

> Fork it. Ship your catalog as tools, not scrape targets. Thirteen tools, five API routes, one stores.ts entry.

---

## 2:35–3:00 — Close

**On screen:** README pitch line + repo URL + Integrations tab.

**Voiceover:**

> ReadyCounter — agent-ready commerce for the WebMCP era. Merchants get readiness. Developers get tools and API. Shoppers get co-shop.

---

## Stranger test (before you film)

1. Fresh browser, no prior context — can you add an item and see it in the order in < 10s?
2. Harness `add_to_order` without reading docs — does the order update?
3. Merchant tab — does toggling CAPTCHA change score and block checkout?
4. **Store switch** — does Neon Matcha show a different score and account-wall blocker?
5. **Integrations tab** — does Shopify JSON download with correct product count?
6. **(Deployed)** Does `create_coshop_room` return a URL that loads in incognito?
7. Can you explain the pitch in one sentence without saying "MCP" three times?

All seven yes → film.
