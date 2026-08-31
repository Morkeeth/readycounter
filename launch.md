# ReadyCounter — research-based launch kit

**Live:** https://tooltruth-webmcp.vercel.app  
**Promise:** Every recommendation, test case, and impact line traces to `research.md` and `src/data/sources.ts`.

---

## Impact (why now)

| Finding | Figure | Source | Product proof |
|---------|--------|--------|---------------|
| AI traffic surge | **8×** sessions, **~13×** orders YoY | Shopify Q1 2026 | Landing hero cites source; merchants audit before checkout |
| Agent abandonment | **78.6%** vs ~70% human | Presenc AI 2026 | Six-line tape = Presenc causes table (26+24+18+15+11+6) |
| Catalog beats scrape | **2×** conversion | Shopify Finkelstein Q1 2026 | OAuth + URL audit pull structured catalog |
| Trust gap | **65%** compare · **14%** auto-buy | YouGov / Checkout.com | Co-shop: human confirms payment |
| **Field audit (ours)** | **0% GTIN** on 6/6 DTC crawls | Batch 2026-08-31 → Render KV | `GET /api/v1/render/status` |
| Fix one wall | **+24 pts** CAPTCHA cleared | Presenc 24% row | ember-oak sandbox 70→94 (`verify-readiness.mjs`) |

**Batch stores audited:** colourpop, tentree, jeffreestarcosmetics, brooklinen, allbirds, kyliecosmetics (6 OK) · gymshark (blocked → OAuth path).

---

## Recommendations (research → action)

Ordered by Presenc abandonment share + what our batch actually found.

### 1. Publish GTIN on every discoverable SKU — **6 pts max** (page structure row)

- **Research:** Shopify Catalog AI **2×** vs scrape; only **19%** of Product schema includes Offer (Digital Applied 5k audit); Presenc **6%** ambiguous structure.
- **Field:** 0% GTIN in public `products.json` across our DTC sample → **catalog score 0/24** on crawls.
- **Action:** Barcodes in Shopify Admin → visible in theme JSON-LD or products feed.

### 2. Remove CAPTCHA on agent checkout — **24 pts** (Presenc **24%**)

- **Research:** Largest checkout friction row after stale data.
- **Proof:** ember-oak scores **70** with CAPTCHA; autopilot clear → **94**.
- **Action:** Guest/agent checkout path without verification wall; confirm via agent journey.

### 3. Guest checkout — **15 pts** (Presenc **15%**)

- **Research:** Separate row from CAPTCHA (we re-read the table 2026-08-31 to fix this).
- **Proof:** neon-matcha **65** with account wall → **80** when cleared.
- **Action:** Enable guest checkout in Shopify.

### 4. Feed ↔ shelf price match — **18 pts** (Presenc **18%**)

- **Research:** Distinct from stale-at-checkout (26%).
- **Proof:** neon-matcha ships feed drift; `sync_feed_prices` autopilot clears line.
- **Action:** OAuth sync or separate agent feed.

### 5. Agent-completable payment — **11 pts** (Presenc **11%**)

- **Proof:** neon-matcha 0/11 until stored-credential method enabled in sandbox.
- **Action:** Declare tokenized / stored-credential methods.

### 6. Fresh data at checkout — **26 pts** (Presenc **26%**)

- **Cannot score from URL crawl** — marked NOT MEASURED.
- **Action:** Shopify OAuth + `prepare_checkout` agent journey.

---

## Test cases (ship before you post)

| ID | Type | Entry | Pass when |
|----|------|-------|-----------|
| `tc-sandbox-captcha` | Sandbox | `/?store=ember-oak&view=merchant` | CAPTCHA 0/24 → autopilot → 94 |
| `tc-sandbox-account` | Sandbox | `/?store=neon-matcha&view=merchant` | Account 0/15 → autopilot → 80 |
| `tc-url-audit-gtin` | URL audit | `POST /api/v1/audit/url` colourpop | catalogScore honest; checkout NOT MEASURED |
| `tc-url-blocked` | URL audit | gymshark.com | 422 + OAuth recommendation |
| `tc-api-production` | API | `npm run test:e2e` | health redis · shopify · 16 tools |
| `tc-autopilot-impact` | Autopilot | ember-oak Autopilot tab | Each fix cites Presenc % |

**Run automated:** `npm run test:e2e` + `npm run verify` + `node scripts/verify-launch.mjs`

---

## Demo script (~90 seconds)

See `DEMO.md` for beat-by-beat narration. Short version:

1. **0:00** — Landing tape **70/100** ember-oak, CAPTCHA line **0/24**
2. **0:30** — Connect → audit **colourpop.com** → catalog vs sandbox honesty
3. **0:45** — **0% GTIN** batch finding (`/api/v1/render/status`)
4. **0:55** — Autopilot CAPTCHA fix **70→94** (sandbox only)
5. **1:05** — Co-shop `?co=` — human in tab
6. **1:15** — Render KV persistence
7. **1:25** — Close: **2× catalog** (Shopify) + **78.6% abandon** (Presenc)

**Deep links for judges:**

- Sandbox CAPTCHA: https://tooltruth-webmcp.vercel.app/?store=ember-oak&view=merchant
- Sandbox account: https://tooltruth-webmcp.vercel.app/?store=neon-matcha&view=merchant
- API status: https://tooltruth-webmcp.vercel.app/api/v1/render/status

---

## One-liner

> **Research-priced agent abandonment bill + real catalog audit + co-shop proof — Shopify catalog in, Render persistence out.**

---

## Files

| File | Role |
|------|------|
| `src/data/launch.ts` | Machine-readable kit (UI + verify) |
| `research.md` | Primary source quotes |
| `LAUNCH.md` | This brief |
| `DEMO.md` | Video script |
| `USE-CASE.md` | Shopify + Render architecture |
| `PARTNERSHIP-RENDER.md` | Render partnership ops |

---

## LOG — night wave RC-C (2026-08-31)

| Deliverable | Status |
|-------------|--------|
| `LIGHTHOUSE-VISION.md` | Shipped — problem / compare·width·delta·WebMCP / 2027 ambition / honest gaps |
| `SHOPIFY-PARTNER-BRIEF.md` | Shipped — partner tone, field 0% GTIN, UCP gap, co-shop proof |
| README stranger hero | Shipped — live link + 3-step path + film/Devpost |
| `audits/STRANGER-PASS-2026-08-31.md` | Shipped — 12 Playwright pass; prod missing RC-A hero until deploy |
| `DEVPOST.md` elevator | Synced with `demo/AMBITION.md` lighthouse + 148 width + gap naming |

**Verified:** `curl …/api/v1/rankings` → 148/78/0% GTIN/11 UCP gaps · `npx playwright test e2e/*.spec.ts` → 12 passed · `npm run verify` → exit 0.

**Wrong:** Prod Vercel not redeployed — stranger does not see `ConnectLighthouseHero` yet. E1 OAuth pairs still 0.
