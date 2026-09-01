# ReadyCounter — ambitious submit cloud wave · 2026-09-02

**Deadline:** Wed Sep 3, 2026 · 1pm PDT  
**Harness ambition:** TOP-25 → stretch TOP-10 (EYES panel 2026-09-01)  
**Branch:** `night/gates-that-lie-2026-08-31` → merge `main`

---

## EYES learnings driving this wave

| Objection | Fix lane |
|-----------|----------|
| "Audit dashboard, not agent commerce" | **RC-FILM** — co-shop in first 30s |
| "Tools run in dev console, not assistant" | **RC-JUDGE** — `CHATGPT-JUDGE.md` + Path A native |
| "Submission incomplete" | **RC-JUDGE** — `SUBMIT-READY.md` |
| "main branch stale" | **RC-MERGE** — night → main |
| KV empty on prod | ✅ fixed 2026-09-01 (re-publish if API returns 0) |

---

## Lane table

| ID | Prompt | Objective | Done when |
|----|--------|-----------|-----------|
| **RC-FILM** | `rc-submit-film-v2-2026-09-02` | Film v2 co-shop-first | `demo/demo-final.mp4` ≤130s; co-shop @15s; no cue bar; no >2s silence |
| **RC-JUDGE** | `rc-submit-judge-path-2026-09-02` | Judge docs + submit pack | `JUDGE-60s.md` + `CHATGPT-JUDGE.md` + `submission/SUBMIT-READY.md` |
| **RC-MERGE** | `rc-submit-merge-2026-09-02` | main merge + receipt | `main` merged; `docs/CLOUD-RECEIPT-submit-2026-09-02.md` |

**Wave 1 (parallel):** RC-FILM + RC-JUDGE  
**Wave 2 (after push):** RC-MERGE

---

## Oscar gates (cloud stops)

| Gate | Owner | Action |
|------|-------|--------|
| **O2** | Oscar | Upload `demo/demo-final.mp4` to YouTube unlisted |
| **O4** | Oscar | Paste `submission/DEVPOST-PASTE.md` → Devpost + video URL |
| O5 | Oscar | Shopify OAuth (E1 blocked — say "public feeds empty") |

**15-min submit:** see `submission/SUBMIT-READY.md` (RC-JUDGE creates).

---

## Pre-flight (done)

- [x] Prod deploy + FilmGuide `record=1`
- [x] Rankings KV 78/148/11
- [x] Film v1 + submission pack committed (`715001c`)
- [x] `npm run verify` + `check:numbers` green
- [x] Harness updated · maxLanes 3

---

## Morning review

```bash
node ~/CODE/zup/scripts/cloud-harness.js review readycounter
cd ~/CODE/tooltruth-webmcp && git pull && npm run verify
open submission/SUBMIT-READY.md
ffprobe demo/demo-final.mp4  # watch end-to-end
```
