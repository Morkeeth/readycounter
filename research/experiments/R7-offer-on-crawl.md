# R7: Offer schema measured on crawl path

**Date:** 2026-08-31  
**Status:** complete (RC-B night wave)  
**Closes:** `research/RANK-AND-HELP-GAP.md` gap #4 (Offer) + #5 (ACP policy smoke, non-upload)

## Hypothesis

Public catalog crawls can measure **Offer completeness** (% Product JSON-LD or feed rows with price + availability) and **ACP policy smoke** (live privacy + ToS URLs from homepage) without claiming Instant Checkout certification or partner-feed eligibility flags.

## Method

```bash
# Unit checks (offer + policy discovery + reviewAgainstField wiring)
node scripts/verify-url-audit.mjs

# Live object — colourpop.com (same host as Connect demo default)
npx tsx -e "(async () => { const { auditStorefrontUrl } = await import('./src/server/url-audit.ts'); const r = await auditStorefrontUrl('https://colourpop.com'); console.log(JSON.stringify(r.ok ? { offerPct: r.meta.signals.offerPct, policySmoke: r.meta.policySmoke } : r, null, 2)); })();"

# API surface (requires running dev server or deployed URL)
curl -sS -X POST http://localhost:3000/api/v1/audit/url \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://colourpop.com"}' | jq '{offerPct: .meta.offerPct, policySmoke}'
```

**Offer metric:** `offerPct` = round(complete / sampled × 100).  
- **products.json path:** variant has `price > 0` and `available` defined.  
- **JSON-LD path:** Product node has `offers` with price and availability.

**Policy smoke:** discover privacy + terms links from crawled HTML; HTTP GET each; honest `measurable: false` when none found. Does **not** validate `is_eligible_search` / `is_eligible_checkout` (requires partner feed upload).

## Results — colourpop.com (2026-08-31)

| Signal | Value | Notes |
|--------|-------|-------|
| **Method** | `shopify-products-json` | 50 SKU sample cap |
| **offerPct** | **100%** | All feed rows carry price + availability |
| **gtinPct** | **0%** | Unchanged field finding |
| **policySmoke.measurable** | **true** | Footer/nav links found |
| **privacyOk** | **true** | `https://colourpop.com/pages/privacy-policy` |
| **termsOk** | **true** | `https://colourpop.com/pages/terms` |

### Baseline contrast (honest)

| Arm | What it measures | colourpop |
|-----|------------------|-----------|
| **Naive “has products.json”** | Feed exists | pass |
| **Offer on crawl (this ship)** | Price + availability on sampled rows | **100%** |
| **Digital Applied benchmark** | Product JSON-LD with nested Offer on PDPs | **19% industry** — not re-run on colourpop PDPs tonight |
| **ACP feed eligibility** | `is_eligible_*` flags | **NOT MEASURED** (no upload) |

**Finding:** Feed-path Offer completeness can read **100%** while GTIN stays **0%** and catalog legibility stays **0/24** — Offer measurement is orthogonal to identifier gaps. Policy URLs can pass HTTP smoke while checkout eligibility remains unverified.

## UI / API wiring

- `POST /api/v1/audit/url` → `meta.offerPct` + top-level `policySmoke`
- Rankings table → **Offer** column + signal chips (`low-offer`, `policy-unmeasured`, `policy-fail`)
- `reviewAgainstField` → flags `schema-offer` when `offerPct < 50`; `acp-eligibility` when policy smoke fails or unmeasurable

## Caveats

- Homepage-only policy discovery — may miss links only in checkout or feed metadata
- JSON-LD Offer not measured when `/products.json` wins the crawl path (colourpop case)
- No PDP sampling for Rich Results–style Product+Offer audit at scale
- CAPTCHA / checkout lines still NOT MEASURED

## Evidence

- Code: `src/server/url-audit.ts`, `src/server/policy-smoke.ts`, `api/v1/audit/url.ts`
- Verify: `scripts/verify-url-audit.mjs` (ran in `npm run verify`)
- Rankings: `src/components/RankingsPanel.tsx` Offer column

## Next

- Batch re-publish with `offerPct` + `policySmoke` on 148 curated stores
- Optional PDP JSON-LD Offer probe when feed path wins (second sample arm)
- E1 OAuth pairs still blocking full holistic claim
