# ReadyCounter — product compass

## NORTH STAR

**A storefront merchants and shoppers use for real** — open the URL, co-shop with a shopping assistant, see readiness and fix blockers. Not a contest entry. Not a dev harness dressed as a product.

## PROMISE LINE (honest v1)

**Merchants get:** an **agent-readiness audit** on a catalog they bring (import or fork) — score, blockers, exportable checklist. Fixes apply to the ReadyCounter sandbox, not their live Shopify checkout until post-gate.

**Shoppers get:** co-shop — assistant proposes via tools, human stays in the tab.

**Constraint:** `prepare_checkout` never charges a card — human confirms payment.

**Product constraint:** zero signup to start; the live URL is the product.

## DATA ANCHORS (cite in README / outbound)

| Stat | Source |
|------|--------|
| Shopify AI traffic **8×** YoY; orders from AI **~13×** | Shopify Q1 2026 |
| Catalog AI searches **2×** vs scraped | Shopify Finkelstein |
| Agent cart abandon **~78.6%**; stale price **26%**, CAPTCHA **24%**, required account **15%** | Presenc AI 2026 |
| **65%** trust compare · **14%** auto-buy (**51pt gap**) | Checkout.com/YouGov |

Full citations: `research.md`

## CONSTITUTION

- `prepare_checkout` never charges a card
- ≥6 structured agent tools with JSON schemas
- Agent tool console works without WebMCP browser flag (under Connect)
- Every outbound stat traceable in `research.md`
- No Tooltruth KYA / Duet gift staging revert
- Outward acts (deploy, post, Devpost) are Oscar's click
- **No false product promises:** don't market live API rooms until KV; lead strangers with **copy cart link** (`?co=`)

## EYES PANEL (2026-08-31) — plan revision

**Panel independence:** true multi-model (Grok Skeptic · Composer Pragmatist · GPT Red-team)

| Reviewer | Overall |
|----------|---------|
| Skeptic (Grok) | WRONG WEDGE — med |
| Pragmatist (Composer) | SHIP AS PRODUCT — med |
| Red-team (GPT) | KEEP BUILDING — high |

### Claims consensus

| # | Claim | Skeptic | Pragmatist | Red-team | Consensus |
|---|-------|---------|------------|----------|-----------|
| 1 | Readiness + co-shop is real wedge | PARTIAL | PARTIAL | PARTIAL | **PARTIAL** — audit yes, "fixes your store" no |
| 2 | Codebase enough without more build | DISAGREE | PARTIAL | DISAGREE | **PARTIAL** — ship `?co=` path; fix import share; defer live rooms |
| 3 | Deploy + stranger test before build | AGREE | AGREE | DISAGREE | **AGREE** — deploy now; stranger test on cart link not live session |
| 4 | Auth/KV can wait until gate | PARTIAL | AGREE | DISAGREE | **PARTIAL** — auth yes; **live rooms no** (misleading today) |
| 5 | Dual audience OK for v1 | DISAGREE | PARTIAL | DISAGREE | **DISAGREE** — **merchant audit is customer**; co-shop is proof |
| 6 | Devpost secondary to product | PARTIAL | AGREE | AGREE | **AGREE** — Wed = URL + short video, not feature sprint |

### Strongest objections (ranked)

1. Fixes only touch sandbox flags — real merchants will bounce if we imply we changed their checkout.
2. Live rooms are in-memory on serverless — "Start live session" overpromises.
3. `?co=` share may not carry imported catalog to incognito strangers.

### Revised take

Ship as a **merchant readiness sandbox** with co-shop as the proof mechanism, not two products. Deploy immediately, lead with **copy cart link**, run the 72h stranger gate, fix import-in-share before wide distribution. Devpost documents the live product; it does not drive the build queue.

---

## PLAN (production-ready — no freeze)

**Philosophy:** Ship continuously toward production. Devpost Wed runs in parallel; it does not pause the build queue. Stranger replies are a signal, not a gate.

**Already shipped:** co-shop · readiness tape · 16 tools · REST API · import + `?co=` share · sandbox-honest UI · Vercel live

| # | Slice | Done when | Size | Risk |
|---|-------|-----------|------|------|
| **1** | **Durable state (Render Key Value)** — rooms + server custom stores | ✅ `kv.backend: redis` on production | M | — |
| **2** | **E2E smoke (Playwright)** — landing + API health + Shopify configured | `npm run test:e2e` green | M | Flaky tests |
| **3** | **Merchant store API** — stable slug; `GET /stores/:id` + OAuth/audit persist | Import/OAuth/audit → `?store=slug` bookmark | M | Slug collisions |
| **4** | **Live URL audit** — paste storefront URL; JSON-LD / products.json | `POST /api/v1/audit/url` → score + Redis persist | L | Bot blocks |
| **5** | **Merchant identity (light)** — magic-link or passkey; stores tied to account; shoppers still no signup | Merchant returns to dashboard without re-import | M | Auth scope creep |
| **6** | **Production ops** — custom domain, Sentry, API rate limits, fix API route TS on Vercel build | Errors visible; no silent 500s; clean deploy logs | S | — |
| **7** | **Shopify OAuth (read-only)** | ✅ configured on Vercel | L | — |

**Parallel (Oscar, non-blocking):** post URL · film · Devpost Wed 22:00 CEST

**Production-ready v1 = slices 1–4.** Auth + OAuth are v1.1 once strangers use URL audit.

## NOW

**RC-WIN wave (2026-09-01):** Criteria-max Devpost + judge UX — per-criterion evidence in `submission/DEVPOST-PASTE.md`, embarrassment grep in verify, `e2e/judge-mode.spec.ts`.

```text
Done-when:
  test -f submission/JUDGES.md && test -f submission/DEVPOST-PASTE.md → exit 0
  npm run verify → exit 0 (includes verify-embarrassment.mjs)
  npm run test:e2e → exit 0 (judge-mode + stranger-pass green)
  node scripts/check-numbers.mjs → exit 0
```

## LOG

- 2026-08-30 — ReadyCounter ruled. Duet/Tooltruth killed.
- 2026-08-30 — Slices 1–2 shipped: co-shop core, merchant readiness.
- 2026-08-30 — Slice 3: research, DEVPOST, brand.
- 2026-08-31 — Slice 4: persist, share link, landing, JSON-LD.
- 2026-08-31 — Slice 4b–5: platform, API, 16 tools, integrations, ambition slice.
- 2026-08-31 — **Product reframe:** UI/copy/README away from hackathon; Connect tab; merchant-first landing.
- 2026-08-31 — **Autonomous goal run:** G1 CatalogAdapter · A2 compare API+UI · 50+ curated list · R2–R4 · D3 findings · rate limits · weekly cron · `SESSION-STATUS.md`

- 2026-08-31 — **Night run L3 — brand ruled + score made defensible.**
  Signature device is **the readiness tape** (the score ring was rejected: a ring
  is a component-library element, a bill is an argument). New direction **THE
  COUNTER** — receipt-paper palette, one stamp red for refusals, square corners,
  Bricolage Grotesque + JetBrains Mono; three directions were compared and the
  reasoning is in `DECISIONS.md` § Decision 4 for Oscar to veto cheaply.
  Score reweighted to **100 pts, 65 measured / 35 admitted as ours** — 26, 24 and
  15 are three rows of Presenc AI's published causes table, the rest are labelled
  `allocated` on the line. **Superseded the same night (wave 4): all six rows are
  now scored at their published shares, so the bill is 100 measured / 0
  allocated.** `src/data/sources.ts` (12 rows) is now the only place a
  *cited* figure may come from — measured catalog counts are computed live — and `scripts/verify-score.mjs` fails the build if a
  measured weight stops equalling its published figure (proven red at 24→30) or
  if the tool manifest and `registerTools.ts` disagree.
  **Corrected 2026-08-31:** the account wall had been charged the CAPTCHA's 24 on
  the claim that no published figure priced it; the figure was row four of the
  same table (15%). It now has its own line at 15, all six rows are reproduced in
  `research.md`, and each wall's delta is asserted against its own source row.
  **Fixed a pre-existing white-screen on the Shop tab** — React #185, present at
  `dd90f26`, reproduced in a scratch worktree. The co-shop flow was dead in the
  committed tree and every test still passed, because the verify scripts drive
  the store and never render a component.
  `verify-readiness` and `verify-stores` printed `false` and exited 0; they now
  assert. `verify-stores`' "failure modes differ" compared a CAPTCHA flag on one
  store to an account flag on the other and passed by accident.
  Landing screen printed a hardcoded 72; it scores the live store now.
  Merged with the integration lane's 16 tools, autopilot and Shopify import;
  their surfaces restyled into the counter tokens so the app has one token layer.
  `npm run build` + `npm run verify` exit 0. Branch `nightrun/l3-readycounter`.

- 2026-08-31 — **RC-A lighthouse UI:** `ConnectLighthouseHero` (148 width live from rankings API, 78.6% abandon from `sources.ts` only) · `FieldCompareStrip` YOU·FIELD·DELTA · `field-compare.ts` percentile join · rankings CTA with vertical/UCP gap filter · `?audit_url=` deep link + copy receipt · `verify-field-compare.mjs`.

- 2026-08-31 — **RC-C narrative wave:** `LIGHTHOUSE-VISION.md` · `SHOPIFY-PARTNER-BRIEF.md` · README lighthouse stranger hero (148 width, 3-step path) · `DEVPOST.md` elevator sync with `demo/AMBITION.md` · `audits/STRANGER-PASS-2026-08-31.md` (live URL Playwright + API) · `e2e/stranger-pass.spec.ts` · README 16→18 tools fix.

- 2026-08-31 — **RC-WEBMCP-SHAPE + RC-B Offer/ACP (IDE night):**
  Connect arc **Measure → Compare → Prove → Re-measure** · `offerPct` + `policySmoke` on crawl/API/UI ·
  `reviewAgainstField` flags for schema-offer + acp-eligibility · Prove in co-shop CTA ·
  `LAUNCH.md` restored (symlink loop) · `research/experiments/R7-offer-on-crawl.md` ·
  `verify-url-audit.mjs` offer fixture · landing urgency copy · delta hero on re-audit ·
  `demo/PITCH-TOMORROW.md` for morning pitch · `NIGHT-SLICES.md` ticked.
  `npm run verify && npm run build` exit 0. Branch `night/gates-that-lie-2026-08-31`.
  **Oscar:** `vercel --prod` · film · Devpost.

- 2026-09-01 — **RC-WIN judge UX:** per-criterion Devpost sections · embarrassment verify · stale copy fixes (16→18, Start shopping→Co-shop) · SUBMIT-READY WebMCP paragraph · `verify-embarrassment.mjs` in verify pipeline · rankings KV timeout 3s→10s (cold bundle was returning empty batch while render/status had 148 rows).
  https://tooltruth-webmcp.vercel.app · rankings 78/148 · share-stranger + stranger-pass e2e green on prod.
  **Oscar:** film · Devpost (video URL required).

- 2026-08-31 — **Hammer pass (autonomy):** B7 Offer% rankings column · batch publish fields ·
  compare API offer headline · ONBOARDING agent path · E2 glossier doc ·
  SESSION-STATUS + SUBMISSION-PACK sync · verify green.
