# Film-ready checklist

**Goal:** Record `DEMO.md` / `demo/FILM-AND-SUBMIT.md` (~110s) for Devpost  
**Deadline:** Thu Sep 4, 2026 · **1:00am PDT** (seal — see `submission/SUBMIT-READY.md`)  
**Line:** Agent commerce. Now reviewable. Proof.

---

## Pre-flight (5 min)

```bash
npm run verify
curl -s https://readycounter.vercel.app/api/v1/rankings | jq '{succeeded,shopCount,avgGtinPct,ucp}'
# expect: 78 / 148 / 0 / gtinWhereCrawlZero 11
```

- [ ] Incognito · mic tested · screen 1920×1080
- [ ] Rankings UCP filter shows **11**
- [ ] Optional: `demo/voiceover.mp3` in headphones

---

## Film mode URL

```text
https://readycounter.vercel.app/?film=1&view=integrations&demo=1
```

**Automated capture** (`film/browser.py`) appends `&record=1&cues=0` so the director cue bar is not baked in.

| Beat | Deep link |
|------|-----------|
| 0 — Hook | `/?film=1&beat=0&store=ember-oak&view=merchant` |
| 1 — Stake | `/?film=1&beat=1&store=ember-oak&view=merchant` |
| 2 — Bill | `/?film=1&beat=2&store=ember-oak&view=merchant` |
| 3 — URL audit | `/?film=1&beat=3&view=integrations&demo=1` |
| 4 — Rankings + UCP | `/?film=1&beat=4&view=integrations` |
| 5 — Delta | `/?film=1&beat=5&view=integrations&demo=1` |
| 6 — Journey / autopilot | `/?film=1&beat=6&store=ember-oak&view=merchant` |
| 7 — Co-shop | `/?film=1&beat=7&view=shop` |
| 8 — Ambition | `/?film=1&beat=8&view=integrations` |
| 9 — Close | `/?film=1&beat=9` |

---

## Key numbers (say these)

| Stat | Source |
|------|--------|
| **8×** AI traffic YoY | Shopify |
| **78.6%** agent cart abandon | Presenc |
| **78/148** crawled · **0%** scrape GTIN | Our batch |
| **11** UCP GTIN where scrape empty | E3b |
| **70 → 94** CAPTCHA clear | ember-oak |
| **18** WebMCP tools | `GET /api/v1/tools` |

---

## Do not claim on camera

- ❌ Fixed live Shopify checkout
- ❌ URL audit scores CAPTCHA
- ❌ UCP on every store
- ❌ Full /100 for field crawls
- ❌ Stale 34/58 or 16 tools

---

## After recording

- [ ] Upload video (<3 min) YouTube unlisted · incognito-check
- [ ] Paste `DEVPOST.md` · seal before **Sep 4, 1:00am PDT**
