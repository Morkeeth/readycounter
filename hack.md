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
| 3 | **Research + pitch** — `research.md`, `DEVPOST.md`, README, brand | All stats primary-sourced · score-ring identity | S |
| 4 | **Instant use** — persist, share link, landing, JSON-LD, deploy prep | Share link + refresh eval passes | M |
| 5 | **Outward** — film + Devpost with live URL | Submit Wed 22:00 CEST | S — Oscar |

## NOW

**Slice 5** — Oscar: Vercel deploy · film with **share link** demo · Devpost Wed 22:00.

**Instant-use eval (moonshot):**
```text
open <live-url> → Start co-shopping → add item → refresh → order remains
→ Copy co-shop link → incognito → same order → merchant funnel visible
```

## LOG

- 2026-08-30 — ReadyCounter ruled. Duet/Tooltruth killed.
- 2026-08-30 — **Slice 1 shipped:** coffee catalog, shopStore, 8 tools, Shop+Order UI, merchant readiness dashboard.
- 2026-08-30 — **Slice 2 shipped:** readiness score, CAPTCHA toggle, agent funnel, checkout gate.
- 2026-08-30 — **Slice 3 shipped:** `research.md`, `DEVPOST.md`, README pitch + judge steps, score-ring + funnel-strip visual pass, `npm run build` + `npm run lint` exit 0, verify script for CAPTCHA score delta.
- 2026-08-31 — **Name ruled:** ReadyCounter (Devpost). Repo `tooltruth-webmcp` unchanged.
- 2026-08-31 — **Scope ruled:** Product track — ambitious, instant use (live URL, no signup to shop).
- 2026-08-31 — **Slice 4 shipped (moonshot):** localStorage persist, shareable co-shop links (`?co=`), landing hero, JSON-LD catalog, `vercel.json`.
