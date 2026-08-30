# ReadyCounter — WebMCP Challenge

## NORTH STAR

**Agent-ready storefront** — merchants see why AI shoppers abandon (data-backed readiness score), developers ship structured WebMCP tools, humans and agents **co-edit the same order** in-tab.

## PROMISE LINE

**Merchants get:** readiness score + agent funnel against real failure modes (CAPTCHA, stale feed, thin catalog).

**Shoppers get:** co-shop — agent proposes via tools, human stays in the tab (65% trust compare · 14% trust auto-buy).

**Constraint:** `prepare_checkout` never charges a card — human confirms payment.

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

## PLAN (risk-first)

| # | Slice | Done when | Size |
|---|-------|-----------|------|
| 1 | **Co-shop core** — catalog, shared order, 8 WebMCP tools | `npm run build` · tools in `registerTools.ts` | M |
| 2 | **Merchant readiness** — score, checks, CAPTCHA toggle, funnel | Merchant tab shows score & blocked checkout | M |
| 3 | **Research + pitch** — `research.md`, `DEVPOST.md`, README, demo spine | All stats primary-sourced · stranger test doc | S |
| 4 | **Deploy** | Live URL on Vercel | S — Oscar |
| 5 | **Devpost + video** | Frozen submit | S — Oscar |

## NOW

**Slice 4** — Deploy (Oscar). Research, Devpost copy, score-ring visual identity, build/lint green on main.

## LOG

- 2026-08-30 — ReadyCounter ruled. Duet/Tooltruth killed.
- 2026-08-30 — **Slice 1 shipped:** coffee catalog, shopStore, 8 tools, Shop+Order UI, merchant readiness dashboard.
- 2026-08-30 — **Slice 2 shipped:** readiness score, CAPTCHA toggle, agent funnel, checkout gate.
- 2026-08-30 — **Slice 3 shipped:** `research.md` (all DATA ANCHORS primary-sourced), `DEVPOST.md`, README pitch + judge steps, score-ring + funnel-strip visual pass, `npm run build` + `npm run lint` exit 0, verify script for CAPTCHA score delta.
