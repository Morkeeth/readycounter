# ReadyCounter — long-run goal

**Cursor goal armed:** 2026-08-31  
**North star:** Own the **measurement layer** for agent commerce — cited abandonment economics, field rankings, co-shop proof — not another discoverability checklist.

**Live:** https://readycounter.vercel.app  
**Repo:** `Morkeeth/readycounter`  
**Session log:** `SESSION-STATUS.md` (autonomous runs)

---

## Done when (goal exit gates)

| # | Gate | Evidence | Status |
|---|------|----------|--------|
| G1 | **Generalized framework** | `CatalogAdapter` seam; Shopify + URL crawl adapters | ✅ `src/server/catalog-adapter.ts` |
| G2 | **Public rankings** | `GET /api/v1/rankings` + UI; 50+ stores in KV batch | ✅ 148 attempted · 78 crawled |
| G3 | **Research program** | `research/experiments/R1–R3` complete | ✅ R1–R4 written |
| G4 | **Product proof** | B1 agent journey + A2 OAuth vs crawl | ✅ both shipped |
| G5 | **Ops** | Render cron weekly batch; verify + e2e green | ✅ |
| G6 | **Publish** | Findings paper (D3) | ✅ `research/FINDINGS-D3.md` |

---

## Phases (no deadline — run until gates pass)

### Phase 0 — Submit wedge (handbook 5–7)
- [x] B1 one-click agent journey (`AgentJourneyRun` on Readiness)
- [ ] Film `DEMO.md` · Devpost submit — **Oscar**
- [x] Stranger + degraded judge runs logged (`audits/stranger-runs-2026-08-31.md`)

### Phase 1 — Rank more stores (R1)
- [x] `audits/curated-dtc.json` → 50+ URLs by vertical (v2)
- [x] `npm run audit:batch -- --publish` (58 URLs, 34 crawled, published KV)
- [x] Rankings API + UI (`GET /api/v1/rankings`, Connect tab)

### Phase 2 — Generalize tool
- [x] `CatalogAdapter` interface
- [x] Honest dual leaderboard: **crawl** vs **OAuth** (`/api/v1/audit/compare`, `CrawlVsOAuthPanel`)
- [ ] GTIN CSV export (A3)

### Phase 3 — Research depth
- [x] R2 OAuth vs crawl delta study (infra + crawl baseline)
- [ ] R5 ReadyCounter vs Shopify scanner (10 URLs)
- [x] R4 journey pass rate (`npm run audit:journey`)
- [x] D3 publish findings (`research/FINDINGS-D3.md`)

### Phase Holistic — measurement layer expansion
- [x] Audit → companion review loop (slice 1)
- [x] Rankings failure-reason filter (slice 2)
- [x] DEMO/FINDINGS sync to v4 148/78/0% (slice 3)
- [x] E3 UCP census on curated list — **81/148 (55%) available; 13 with GTIN**
- [ ] E1 OAuth pairs ≥3 (script ready; needs connected shop)
- See: `research/HOLISTIC-EXPANSION.md` · `ONBOARDING.md`

---

## Constitution (unchanged)

- `prepare_checkout` never charges a card
- Every **cited** figure → `sources.ts` + `research.md`
- Sandbox fixes ≠ live Shopify changed
- WebMCP = proof layer; bill = research layer

---

## Commands

```bash
npm run audit:batch -- --publish          # batch → Render KV
npm run audit:journey                     # R4 journey stats
npm run verify && npm run test:e2e        # gates
curl -s …/api/v1/render/status | jq .
curl -s …/api/v1/rankings | jq .
curl -s -X POST …/api/v1/audit/compare -H 'Content-Type: application/json' -d '{"url":"https://colourpop.com"}'
```

See: `AMBITION.md` · `WHY-WEBMCP.md` · `research/FINDINGS-D3.md` · `research/experiments/README.md`
