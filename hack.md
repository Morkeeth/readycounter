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

## PLAN (post-EYES, risk-first)

**Shipped (do not re-build):** co-shop core · readiness + autopilot · 16 tools · REST API · Shopify import · product UI · `npm run verify`

| # | Slice | Done when | Size | Risk |
|---|-------|-----------|------|------|
| **1** | **Deploy + truth in UI** — Vercel live URL; demote live session; lead **copy cart link** | https://tooltruth-webmcp.vercel.app live | S — Oscar | ✅ |
| **2** | **Stranger gate** — post live URL (opener B: abandon stats); 72h clock for one non-Oscar reply; **freeze features** | Gate running; zero code slices until reply or timeout | S — Oscar | Building past this falsifies demand |
| **3** | **Import survives share** — `?co=` carries custom store catalog so incognito sees imported SKUs | `npm run verify` share import roundtrip | M | ✅ shipped |
| **4** | **Merchant-honest copy** — Readiness/Connect say "sandbox audit + checklist"; autopilot labeled sandbox fixes | No UI line implies live Shopify mutation | S | ✅ shipped |
| **5** | **Wed Devpost** — submit live URL + ≤60s product screen recording (Shop → Readiness → Connect import) | Devpost filed Wed 22:00 CEST | S — Oscar | Calendar creep |
| **6** | **Post-gate fork** _(only after reply)_ | | | |
| | · **Dev reply** → sharpen Connect, FORK.md, tool manifest | | S | |
| | · **Merchant reply** → spike read-only URL audit (their catalog URL, not our sandbox) | | L | Real wedge test |
| | · **Either** → Upstash KV for rooms + server custom stores | | M | Live session promise |

**Not in v1 queue:** merchant auth, payments, Shopify OAuth, Playwright e2e, more demo stores.

## NOW

```
open https://tooltruth-webmcp.vercel.app → Start shopping → add item → Copy cart link
→ incognito → same order + same store catalog
→ Readiness → score + one autopilot fix → re-run journey preview
→ Connect → paste sample Shopify JSON → import → share again → incognito roundtrip
```

## LOG

- 2026-08-30 — ReadyCounter ruled. Duet/Tooltruth killed.
- 2026-08-30 — Slices 1–2 shipped: co-shop core, merchant readiness.
- 2026-08-30 — Slice 3: research, DEVPOST, brand.
- 2026-08-31 — Slice 4: persist, share link, landing, JSON-LD.
- 2026-08-31 — Slice 4b–5: platform, API, 16 tools, integrations, ambition slice.
- 2026-08-31 — **Product reframe:** UI/copy/README away from hackathon; Connect tab; merchant-first landing.
- 2026-08-31 — **Deployed:** https://tooltruth-webmcp.vercel.app · slices 3–4 shipped · `da97b0a`

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
