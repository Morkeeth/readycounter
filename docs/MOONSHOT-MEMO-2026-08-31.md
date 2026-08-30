# Moonshot memo · ReadyCounter · 2026-08-31

## GOAL

**A stranger opens one link and co-shops with their agent in under 10 seconds** — no signup, no README, no harness. Merchants see why agents abandon. Judges see a product, not a prototype.

Press-release line: *"ReadyCounter is the storefront Shopify's AI traffic already expects — structured tools, readiness score, shared co-shop link."*

## Current model (what we believe)

Merchants lose agent traffic on infrastructure (CAPTCHA, stale feeds, thin schema), not model quality. WebMCP wins when the **live site** exposes tools + human-in-tab co-shop. The 4,468-entry room will submit coffee-store clones; we win on **merchant readiness OS + shareable co-shop**.

## External evidence

| Source | What it says | Confidence |
|--------|--------------|------------|
| Shopify Q1 2026 | AI traffic 8×, orders ~13× | High — earnings |
| Shopify Finkelstein | Catalog 2× vs scrape | High — cited in earnings |
| Presenc AI 2026 | 78.6% abandon; CAPTCHA 24% | Medium — verify in research.md |
| WebMCP showcase | Coffee store, flight, hotel clones | High — competitor collision |
| Checkout.com/YouGov | 65% compare / 14% auto-buy | Medium — verify |

## Hypotheses (ranked)

1. **Shareable co-shop link** — one URL hydrates order + merchant flags; human sends to friend or opens in ChatGPT browser. Kill bar: link >2KB fails on mobile Safari. Cost: S, no backend.
2. **JSON-LD on catalog** — agents + Google see Product+Offer; readiness score drops without GTIN. Kill bar: build only. Cost: S.
3. **Persist + landing** — refresh keeps order; hero CTA removes judge-first framing. Kill bar: none. Cost: S.
4. **Multi-tenant merchant login** — real SaaS. Kill bar: misses Wed. Cost: L — **post-submit**.

## Refute result

Hypothesis 4 killed by deadline. Hypothesis 1 survives: URL-share is the moonshot wedge **without** API keys — instant use is the product.

## Collision check

| Idea | Already fired? | Verdict |
|------|----------------|---------|
| Gift staging HITL | Duet | Killed |
| KYA verifier | Tooltruth | Killed |
| Coffee store clone | Chrome showcase | Avoid — we have readiness OS |
| Share link co-shop | No | **Ship** |

## BUILD-PLAN (Loop 3 — tonight)

1. **Persist session** — zustand → localStorage · done when: refresh keeps order
2. **Share link** — `?co=` payload encodes order + merchant + funnel · done when: copy link → incognito → same order
3. **Landing hero** — "Start co-shopping" · done when: stranger path <10s
4. **JSON-LD ItemList** — catalog schema · done when: view-source shows Product entities
5. **vercel.json** — SPA rewrite · Oscar deploys

## OPS (Loop 4 — Oscar)

- Deploy Vercel Tue
- Film Wed with **live share link** in demo
- Devpost: lead with URL, not harness

## Explicitly NOT doing

| Could do | Why not now |
|----------|-------------|
| Shopify OAuth | Wed |
| Vercel KV rooms | Needs env + Oscar |
| Payments | Constitution |
| Merchant accounts | Post-submit launch.md |
