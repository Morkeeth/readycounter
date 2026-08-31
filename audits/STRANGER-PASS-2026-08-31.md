# Stranger pass — live URL

**Run:** 2026-08-31T21:35:00Z (UTC)  
**URL:** https://tooltruth-webmcp.vercel.app  
**Branch under test (docs):** `night/gates-that-lie-2026-08-31` (RC-A lighthouse UI merged; **prod not redeployed this run** — Oscar deploy is out of scope)  
**Operator:** cold Playwright + curl against production, no local keys

---

## Stranger path (60s)

1. Open live URL → landing shows ReadyCounter + readiness tape  
2. **Connect** tab → paste `https://colourpop.com` → Audit  
3. See catalog findings (0% GTIN, catalog-only score) + field compare / delta affordances  
4. Scroll **DTC rankings** — batch width from API  
5. Optional: `?store=neon-matcha` → second failure mode

---

## Pass / fail

| # | Check | Result | Command / evidence |
|---|-------|--------|-------------------|
| 1 | Landing HTTP 200 | **PASS** | `curl -sS -o /dev/null -w '%{http_code}' https://tooltruth-webmcp.vercel.app/` → `200` |
| 2 | Health + Redis KV | **PASS** | `curl -sS …/api/v1/health` → `ok:true`, `kv.backend:redis` |
| 3 | Rankings **148** / **78** crawled / **0%** GTIN | **PASS** | `curl -sS …/api/v1/rankings \| jq '{shopCount,succeeded,avgGtinPct,ucp}'` → `148, 78, 0, gtinWhereCrawlZero:11` |
| 4 | URL audit (colourpop) returns catalog score + findings | **PASS** | `POST …/api/v1/audit/url` → `ok:true`, `scoreNote` matches `/catalog/i`, 7 findings |
| 5 | UCP compare row for colourpop | **PASS** | `POST …/api/v1/audit/compare` → `ucp.available:true` |
| 6 | Playwright launch suite (12 tests) | **PASS** | `PLAYWRIGHT_BASE_URL=https://tooltruth-webmcp.vercel.app npx playwright test e2e/smoke.spec.ts e2e/launch.spec.ts` → **12 passed** |
| 7 | Connect tab: paste URL → audit renders GTIN / catalog copy | **PASS** | Playwright: fill colourpop → click Audit → body matches `/GTIN\|0\/24\|catalog/i` |
| 8 | Connect tab: rankings panel visible | **PASS** | Playwright: `rankings` in body after Connect load |
| 9 | Lighthouse hero (`ConnectLighthouseHero`) on prod | **FAIL** | Playwright: `.lighthouse-hero` absent on `?view=integrations`; headings stop at "Audit a storefront URL" — **RC-A UI not deployed** |
| 10 | Field compare strip (YOU·FIELD·DELTA) on prod | **FAIL** | Playwright: no `field-compare` / YOU strip in DOM — ships on branch, not prod |
| 11 | README tool count matches live API | **FAIL (doc)** | README still says **16** tools; `curl …/api/v1/tools` → `toolCount: 18` — **fixed in this PR** |
| 12 | Landing hero cites lighthouse / 148 width | **FAIL (doc)** | README opening is pre-lighthouse — **fixed in this PR** |

---

## Embarrassments (filed, not hidden)

1. **Prod lags branch** — lighthouse hero + field compare strip are on `night/gates-that-lie-2026-08-31` but not on Vercel prod. Stranger hitting live URL today does not see the film narrative surface. *Fix: Oscar deploy (out of scope this lane).*
2. **README / JUDGE-60s say 16 tools** — live manifest is **18** (`get_field_companion`, `review_against_field` added). README fixed here; `JUDGE-60s.md` still stale (defer — not blocking stranger if they use live API).
3. **148 not in audit result body** — width lives in rankings API/panel, not repeated inline after single-store audit. Acceptable but film script must scroll rankings.
4. **E1 OAuth pairs = 0** — cannot demo Admin↔crawl GTIN table; partner brief and RANK-AND-HELP-GAP already flag.
5. **colourpop audit `score: 0`** — correct catalog-only honesty; strangers may read as “broken” without `scoreNote` — UI shows note on branch; prod shows note (verified in API JSON).

---

## Copy/UX fixes applied this run

| File | Change | Lines |
|------|--------|-------|
| `README.md` | Lighthouse hero + 3-step stranger path + 18 tools + film/Devpost links | ~25 |

No prod code changes — docs only per lane charter.

---

## Re-run recipe

```bash
curl -sS -o /dev/null -w '%{http_code}\n' https://tooltruth-webmcp.vercel.app/
curl -sS https://tooltruth-webmcp.vercel.app/api/v1/rankings | jq '{shopCount,succeeded,avgGtinPct,ucp}'
PLAYWRIGHT_BASE_URL=https://tooltruth-webmcp.vercel.app npx playwright test e2e/launch.spec.ts e2e/smoke.spec.ts
```

After deploy of `night/gates-that-lie-2026-08-31`, re-check items **9** and **10** — expect `.lighthouse-hero` and `#audit-storefront` with `FieldCompareStrip`.
