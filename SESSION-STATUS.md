# Session status — night wave complete

**Branch:** `night/gates-that-lie-2026-08-31`  
**Live:** https://readycounter.vercel.app · **Deployed:** 2026-09-01 (`vercel --prod`)  
**Pitch:** `demo/PITCH-TOMORROW.md`  
**Deadline:** Devpost Wed Sep 3, 2026 · 1pm PDT

---

## Field receipt (v4 — live API)

| Metric | Value |
|--------|-------|
| Curated | **148** |
| Crawled | **78** |
| Scrape GTIN | **0%** |
| UCP available | **81** |
| UCP GTIN where scrape empty | **11** |
| WebMCP tools | **18** |

`GET /api/v1/rankings` · `GET /api/v1/render/status`

---

## Night wave shipped

| Lane | Deliverables |
|------|----------------|
| **RC-A** | Lighthouse hero, YOU·FIELD·DELTA, rankings deep link, share receipt, landing urgency |
| **RC-B** | offerPct + policySmoke crawl/API/UI, R7 doc, verify fixture |
| **RC-C** | LIGHTHOUSE-VISION, partner brief, README, DEVPOST, stranger pass |
| **RC-W** | Measure→Compare→Prove→Re-measure, co-shop CTA, PITCH-TOMORROW |
| **RC-B7** | Offer% column on rankings (batch republish for column data) |

**Verify:** `npm run verify && npm run build` green.

---

## Oscar gates (morning)

1. `vercel --prod`  
2. Record film — `demo/FILM-AND-SUBMIT.md` + `demo/voiceover.mp3`  
3. Devpost — paste `DEVPOST.md`  
4. Optional: `npm run audit:batch -- --curated --publish` to backfill Offer% on rankings KV

---

## Honest gaps

- E1 OAuth pairs — blocked on shop connect  
- Prod UI may lag until deploy  
- Rankings Offer% column shows `—` until batch republished with new crawl fields
