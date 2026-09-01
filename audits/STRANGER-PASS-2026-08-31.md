# Stranger pass — live URL

**Run:** 2026-08-31T21:35:00Z (UTC)  
**URL:** https://tooltruth-webmcp.vercel.app/?view=integrations&demo=1  
**Runner:** Playwright `e2e/stranger-pass.spec.ts` + manual API checks  
**Branch:** `night/gates-that-lie-2026-08-31`

---

## Path exercised

| Step | Action | Result |
|------|--------|--------|
| 1 | Open live Connect tab | **PASS** — ReadyCounter loads, field receipt **78/148 · 0% GTIN scrape · 11 UCP gaps** visible |
| 2 | Rankings width | **PASS** — DTC rankings table **148** rows, UCP filter **UCP GTIN · scrape empty · 11** |
| 3 | Paste audit (colourpop.com) | **PASS** — catalog bill, navigates to merchant audit view, **0/24** catalog |
| 4 | Re-audit delta | **PASS** — **Re-audit & show delta** button, delta/prior copy appears |
| 5 | Prove path (branch) | **PASS on branch** — **Prove in co-shop** + WebMCP tool console under Connect |

**90s timing (branch):**

| Time | Step |
|------|------|
| 0:00 | Open Connect — lighthouse hero 78/148 |
| 0:15 | Audit colourpop — YOU·FIELD strip |
| 0:35 | Scroll rankings — UCP gap filter |
| 0:50 | Prove in co-shop or tool console |
| 1:05 | Re-audit — delta receipt hero |

**Command:**

```bash
PLAYWRIGHT_BASE_URL=https://tooltruth-webmcp.vercel.app npx playwright test e2e/stranger-pass.spec.ts
# exit 0 · 1 passed (2026-08-31T21:35Z)
```

**API re-derive (not carried from docs):**

```bash
curl -s https://tooltruth-webmcp.vercel.app/api/v1/rankings | jq '{shopCount,succeeded,avgGtinPct,ucp}'
# shopCount: 148, succeeded: 78, avgGtinPct: 0, ucp.gtinWhereCrawlZero: 11
```

---

## Pass list

- [x] Live health + KV (`npm run test:e2e` smoke — 12/12 on production)
- [x] Rankings batch **78/148** at API object
- [x] URL audit colourpop → 201 + catalog score note
- [x] UCP compare colourpop → UCP available
- [x] Stranger 60s path without signup
- [x] Re-audit delta on same URL
- [x] **18** tools on `GET /api/v1/tools`

---

## Embarrassments (not fixed — docs lane)

| # | Issue | Severity | Notes |
|---|--------|----------|-------|
| 1 | **Lighthouse hero not on production** | Medium | Ships on branch; Oscar `vercel --prod` |
| 2 | **Offer/policy chips not on production** | Medium | Branch-only until deploy |
| 3 | **First audit jumps to Readiness tab** | Low | Stranger still completes path; Connect rankings require scroll on first visit only |
| 4 | **JUDGE-60s.md** | Low | Fixed 18 tools heading |
| 5 | **E1 OAuth pairs = 0** | Blocking narrative | Named in all partner docs; do not film Admin-gap climax |
| 6 | **`#rankings-panel` id** | Low | Present in branch bundle; production HTML is SPA — use heading "DTC rankings" for tests |

---

## Copy/UX fixes this wave

| File | Change |
|------|--------|
| `README.md` | Lighthouse hero + stranger path + 18 tools |
| `DEVPOST.md` | Elevator pitch sync with ambition + honest gaps |

No blocking copy bugs required code fixes on live URL for stranger completion.

---

## Fail / defer

- Lighthouse hero on production — **defer deploy** (Oscar)
- Offer schema ranked line on crawl — **defer RC-A/B**
- E1 OAuth pairs — **defer** (needs connected shop)
