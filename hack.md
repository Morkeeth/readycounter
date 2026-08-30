# ReadyCounter — WebMCP Challenge

## NORTH STAR

**Agent-ready storefront people use instantly** — open the URL, co-shop with your agent, merchant sees readiness + funnel. Not a slide deck. Not a harness-only demo.

## PROMISE LINE

**Merchants get:** readiness score + agent funnel against real failure modes (CAPTCHA, stale feed, thin catalog).

**Shoppers get:** co-shop — agent proposes via tools, human stays in the tab (65% trust compare · 14% trust auto-buy).

**Constraint:** `prepare_checkout` never charges a card — human confirms payment.

**Instant-use constraint:** zero signup to start shopping; live URL is the product.

## DATA ANCHORS (cite in README / Devpost)

| Stat | Source |
|------|--------|
| Shopify AI traffic **8×** YoY; orders from AI **~13×** | Shopify Q1 2026 |
| Catalog AI searches **2×** vs scraped | Shopify Finkelstein |
| AI conversion **38% worse → 42% better** (12 mo) | Adobe via Digital Applied |
| Agent cart abandon **~78.6%**; stale price **26%**, CAPTCHA **24%** | Presenc AI 2026 |
| **81%** PDPs lack Product+Offer schema | DigitalApplied 5k audit |
| **65%** trust compare · **14%** auto-buy (**51pt gap**) | Checkout.com/YouGov |

## OPEN QUESTIONS

- Deploy URL (Oscar) — not decided here
- Devpost video — Oscar
- Whether to add live Product JSON-LD on catalog cards (nice-to-have, not blocking)

## CONSTITUTION

- `prepare_checkout` never charges a card
- ≥6 WebMCP tools with JSON schemas
- Judge harness works without WebMCP flag
- Every README/Devpost stat traceable in `research.md`
- No Tooltruth KYA / Duet gift staging revert
- Outward acts (deploy, Devpost, video) are Oscar's click

## PLAN (risk-first, product track)

| # | Slice | Done when | Size |
|---|-------|-----------|------|
| 1 | **Co-shop core** — catalog, shared order, 8 WebMCP tools | `npm run build` · tools in `registerTools.ts` | M |
| 2 | **Merchant readiness** — score, checks, CAPTCHA toggle, funnel | Merchant tab shows score & blocked checkout | M |
| 3 | **Research + pitch** — `research.md`, `DEVPOST.md`, README, brand | All stats primary-sourced · receipt-tape identity | S |
| 4 | **Instant use** — persist, share link, landing, JSON-LD, deploy prep | Share link + refresh eval passes | M |
| 5 | **Outward** — film + Devpost with live URL | Submit Wed 22:00 CEST | S — Oscar |

## NOW

**Slice 5 shipped (night run, 31 Aug):** brand ruled and built (THE COUNTER —
the readiness tape), the score made traceable point-by-point, and a pre-existing
white-screen on the Shop tab fixed. `npm run build` and `npm run verify` exit 0.

**Everything left is Oscar's click:** Vercel deploy · film `DEMO-SCRIPT.md`
(one take, 2:45, every number pre-verified) · paste `DEVPOST.md` · submit
Wed 3 Sep 22:00 CEST.

**Live numbers, read 2026-08-31 from `npm run verify`:** Ember & Oak **70/100**
(CAPTCHA), 94 with it cleared, delta **24** = the published figure. Neon Matcha
**57/100** (account wall). **13** WebMCP tools. **8** sources on file.

**Defensibility eval (the moonshot bar):**
```text
open the merchant tab → click any tape line → it prints points, basis, fix and
a source with publisher + date read → uncheck CAPTCHA → score moves by exactly
24 → edit a weight in src/lib/readiness.ts → `npm run verify` exits 1
```

**Instant-use eval (moonshot):**
```text
open <live-url> → Start co-shopping → add item → refresh → order remains
→ Copy co-shop link → incognito → same order → merchant funnel visible
→ ?store=neon-matcha → readiness score differs from default store
```

## LOG

- 2026-08-30 — ReadyCounter ruled. Duet/Tooltruth killed.
- 2026-08-30 — **Slice 1 shipped:** coffee catalog, shopStore, 8 tools, Shop+Order UI, merchant readiness dashboard.
- 2026-08-30 — **Slice 2 shipped:** readiness score, CAPTCHA toggle, agent funnel, checkout gate.
- 2026-08-30 — **Slice 3 shipped:** `research.md`, `DEVPOST.md`, README pitch + judge steps, score-ring + funnel-strip visual pass, `npm run build` + `npm run lint` exit 0, verify script for CAPTCHA score delta.
- 2026-08-31 — **Name ruled:** ReadyCounter (Devpost). Repo `tooltruth-webmcp` unchanged.
- 2026-08-31 — **Scope ruled:** Product track — ambitious, instant use (live URL, no signup to shop).
- 2026-08-31 — **Slice 4 shipped (moonshot):** localStorage persist, shareable co-shop links (`?co=`), landing hero, JSON-LD catalog, `vercel.json`.
- 2026-08-31 — **Slice 4b (platform):** 2 demo stores, 10 WebMCP tools (`get_readiness_score`, `get_merchant_config`), SUBMISSION-PACK, DEPLOY, launch.md, `npm run verify`.
- 2026-08-31 — **Overnight platform polish:** `FORK.md`, `FILM-CUES.md`, `JUDGE-60s.md`; DEVPOST + README + DEMO-SCRIPT updated for 2 stores + 10 tools; `scripts/verify-stores.mjs` wired into `npm run verify`; `npm run build && npm run verify` exit 0.
- 2026-08-31 — **Slice 5 shipped (night run L3, worktree `nightrun/l3-readycounter`):**
  brand RULED and built — **THE COUNTER**, signature device = the readiness tape
  (score ring rejected: a ring is a component, a bill is an argument). Score is
  now **100 points, 50 measured / 50 admitted as ours**, each line printing its
  arithmetic, its fix and its source with publisher + date read;
  `src/data/sources.ts` (8 rows) is the only place a figure may come from.
  New `scripts/verify-score.mjs` fails the build if a measured weight stops
  equalling its published figure (proven red at 24→30). `verify-readiness` and
  `verify-stores` now assert and exit non-zero instead of printing `false` and
  passing. **Fixed a pre-existing white-screen on the Shop tab** (React #185,
  present at `dd90f26`) — the co-shop flow, i.e. the demo, was dead in `main`.
  Landing screen scored a hardcoded 72; it scores the live store now. Docs
  corrected from 10 tools to **13**. `docs/shots/` holds 1440px and true-390px
  renders of every surface. `npm run build` + `npm run verify` exit 0.
