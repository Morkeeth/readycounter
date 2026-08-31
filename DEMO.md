# ReadyCounter — 90-second demo script

**URL:** https://tooltruth-webmcp.vercel.app  
**Film mode:** `/?film=1` — script overlay with prev/next beats  
**Checklist:** [`FILM-READY.md`](./FILM-READY.md)

---

## Setup (before recording)

- [ ] `npm run verify` + `npm run test:e2e` green
- [ ] Production rankings: **78/148** (`GET /api/v1/rankings` — avg GTIN 0%)
- [ ] Field companion visible on Connect (`#field-companion`)
- [ ] Incognito window
- [ ] Optional: Chrome WebMCP flag for native assistant demo

---

## Beats

### 0:00 — The bill

**Show:** `/?store=ember-oak&view=merchant` — tape **70/100**, CHECKOUT VOID

**Say:**  
*"Agents are already shopping Shopify stores — traffic up eight-x year over year. This merchant scores seventy. Here is the itemised bill."*

**Point at:** CAPTCHA **0/24** — *"Twenty-four percent of abandoned agent carts hit a verification wall."*

---

### 0:15 — Readiness depth

**Show:** Expanded tape — six lines, all published weights

**Say:**  
*"Six lines, one hundred points — each weight is a row from Presenc AI's causes table. Nothing invented."*

---

### 0:30 — Real storefront audit

**Show:** **Connect** → paste `https://colourpop.com` → **Audit** (auto-fills with `?demo=1`)

**Say:**  
*"Paste any storefront URL. We read public products.json — no JSON paste."*

**Point at:** Catalog **0/24** · checkout lines **NOT MEASURED**

---

### 0:45 — Field batch + rankings

**Show:** **DTC rankings** table on Connect tab

**Say:**  
*"We batch-audited fifty-eight DTC stores. Thirty-four crawled. Zero percent had barcodes in the feed agents read."*

---

### 0:52 — Agent journey

**Show:** **Readiness** → **Run agent journey** on ember-oak

**Say:**  
*"One click: search, add, checkout. Blocked at CAPTCHA — same twenty-four percent row."*

---

### 0:58 — Three discovery paths

**Show:** After audit → **Compare all paths** (crawl · UCP · Admin)

**Say:**  
*"Public scrape versus Shopify's UCP protocol versus Admin OAuth — we don't fight their scanner, we measure what agents actually get."*

---

### 1:05 — Fix preview (sandbox)

**Show:** **Autopilot** → Remove CAPTCHA → **70 → 94**

**Say:**  
*"Preview the fix in sandbox. Your live Shopify is untouched."*

---

### 1:12 — Co-shop proof

**Show:** **Co-shop** tab → add item → **Copy cart link**

**Say:**  
*"Sixteen WebMCP tools. Human stays in the tab. prepare_checkout never charges a card."*

---

### 1:20 — Render persistence

**Show:** Render partnership card — batch **78/148**

**Say:**  
*"Vercel serves the app. Render Key Value keeps the audit. The link works tomorrow."*

---

### 1:28 — Close

**Say:**  
*"ReadyCounter: research-priced abandonment, field batch rankings, co-shop proof. Shopify brings catalog, Render keeps audit, WebMCP proves the path."*

---

## B-roll

| Shot | URL |
|------|-----|
| CAPTCHA sandbox | `/?store=ember-oak&view=merchant` |
| Account sandbox | `/?store=neon-matcha&view=merchant` |
| Film script overlay | `/?film=1&view=integrations` |
| Rankings API | `/api/v1/rankings` |
| Compare API | `POST /api/v1/audit/compare` |

---

## What not to claim

- ❌ "We fixed your Shopify checkout"
- ❌ Crawl scores checkout CAPTCHA
- ❌ Every store has UCP live
