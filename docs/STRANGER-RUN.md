# Stranger run — 2026-09-02

**Branch:** `day/stranger-path-2026-09-02`  
**Preview:** `https://tooltruth-webmcp-1ziwbwvg1-morkeeths-projects.vercel.app` (Vercel SSO — use local `npm run preview` or merge to prod)  
**Authority:** `npm run verify` → neon-matcha **65/100**, ember-oak **70/100**

---

## Step 0 — Re-probe: do three docs still print 57 and 71?

**Claim source:** 31 August nightrun — stale.

| Surface | 57/100 | 71/100 | Current score |
|---------|--------|--------|---------------|
| `JUDGE-60s.md` | — | — | neon **65/100** |
| `DEVPOST.md` / `submission/DEVPOST-PASTE.md` | — | — | neon **65/100** |
| `README.md` | — | — | neon **65/100** |
| `DEMO-SCRIPT.md` | — | — | ember **70/100** only |
| `NIGHTRUN-2026-08-31.md` | yes (historical log) | yes (historical log) | not judge-facing |

**Verdict:** No outward judge doc prints 57 or 71 today. `verify-embarrassment` now fails the build if 57/100 or 71/100 appear outside historical logs.

---

## Stranger transcript — colourpop.com

**Persona:** Merchant with no context, no login, no README.  
**Environment:** Production API + local UI build (`npm run preview` on branch commit `8febc55`).

### 1. Open URL

```
GET /
→ Lands Connect tab (no demo hero, no ember-oak tape)
→ Heading: "Paste your store. Get the score and the fix list."
```

### 2. Enter domain

```
Input: colourpop.com
Click: Score my store
```

### 3. API (what the button triggers)

```bash
curl -s -X POST https://readycounter.vercel.app/api/v1/audit/url \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://colourpop.com"}'
```

**Result:**

| Field | Value |
|-------|-------|
| Store | colourpop.com |
| SKUs | 50 |
| Catalog score | **0 / 24** pts |
| Scrape GTIN | **0%** |
| Field flags | 3 |

### 4. Top three fixes (merchant can name these)

1. **GTIN on every SKU** — Export barcodes from Shopify Admin; ensure `products.json` / JSON-LD exposes `gtin13` / `gtin` on each variant.
2. **Schema.org Offer on product pages** — Only ~19% of Shopify stores emit Offer in JSON-LD; agents need price + availability in machine-readable form.
3. **Enable guest checkout path** — NOT MEASURED on URL crawl; handbook ranks account-wall risk at 15% of agent abandon (Presenc row). OAuth path unlocks this line.

### 5. Eight tool checks (PASS / FAIL / NOT MEASURED)

| Tool | Request | Result |
|------|---------|--------|
| `audit_url` | `POST /api/v1/audit/url {"url":"https://colourpop.com"}` | **PASS** — 50 SKUs |
| `validate_catalog_feed` | `validate_catalog_feed({})` | **FAIL** — feed issues (0% GTIN) |
| `get_readiness_score` | `get_readiness_score({})` | **FAIL** — 0/24 catalog pts |
| `review_against_field` | `review_against_field({ gtinPct: 0, catalogScore: 0 })` | **PASS** — 3 handbook flags |
| `search_catalog` | `search_catalog({ in_stock_only: true })` | **PASS** — in-stock SKUs |
| `get_merchant_config` | `get_merchant_config({})` | **NOT MEASURED** — crawl cannot see checkout walls |
| `prepare_checkout` | `prepare_checkout({ actor: "agent" })` | **NOT MEASURED** — needs OAuth or sandbox |
| `get_field_companion` | `get_field_companion({ topic: "gtin-gap" })` | **PASS** — 0% scrape GTIN, gtin-gap applies |

**Merchant takeaway:** "We're 0/24 on catalog legibility, 0% GTIN on scrape, and three handbook flags — fix barcodes and Offer JSON-LD first."

---

## `?co=` share link — incognito second person

**Test:** `PLAYWRIGHT_BASE_URL=http://localhost:4173 npx playwright test e2e/share-stranger.spec.ts` → **PASS**

**What the second person sees:**

1. Fresh browser context (incognito-equivalent) opens the copied `?co=` URL.
2. Store switcher shows **Stranger Tea Co** (imported catalog embedded in v2 payload).
3. Order panel shows **Stranger Matcha Tin** — same cart as the sharer.
4. No **Start live session** button — only **Copy cart link** (removed previously).

**Note:** Builtin demo stores (`ember-oak`) share without v2 embed; strangers auditing their own URL use the domain input path above.

---

## Live API batch numbers

```bash
curl -s https://readycounter.vercel.app/api/v1/rankings | jq '{succeeded,shopCount,avgGtinPct,ucp:.ucp.gtinWhereCrawlZero}'
```

**At run time (2026-09-02 ~06:50 UTC):** `succeeded: 0, shopCount: 0` — Render KV batch missing on prod (`note: "No batch on Render KV yet"`). UCP census still shows `gtinWhereCrawlZero: 0` with stale `at` timestamp.

**Expected when KV is warm:** `78 / 148 / avgGtinPct 0 / ucp 11` — run `npm run render:publish-audit` on main before film (see `FILM-READY.md`).

---

## Score unification — files changed

| File | Change |
|------|--------|
| `scripts/verify-embarrassment.mjs` | Fail on `57/100`, `71/100` in judge docs |
| `src/components/StrangerPath.tsx` | Stranger hero cites **65/100** and **70/100** from verify authority |
| `FILM-READY.md` | Removed home path; `npm run verify` only |

**Numbers removed from active surfaces:** none found (claim was already stale). Historical `57`/`71` remain only in `NIGHTRUN-2026-08-31.md`.

---

## Verify

```bash
npm run verify
# verify-stores: ember-oak 70/100 (captcha) · neon-matcha 65/100 (account)
# verify-stranger-probes: 8 checks
```

---

## Not done (Oscar)

- Film take · Devpost submit · prod deploy of this branch
- Restore rankings KV on prod (`render:publish-audit`) before citing 78/148 on camera
