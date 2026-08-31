# Film-ready checklist

**Goal:** Record `DEMO.md` (~90s) for Devpost (deadline Wed Sep 3, 1pm PDT).

---

## Pre-flight (5 min)

```bash
cd /Users/morkeeth/CODE/tooltruth-webmcp
npm run build && npm run verify && npm run test:e2e
curl -s https://tooltruth-webmcp.vercel.app/api/v1/health | jq '{ok, kv}'
curl -s https://tooltruth-webmcp.vercel.app/api/v1/rankings | jq '{succeeded, shopCount}'
```

- [ ] Production rankings show **78/148** (republish if empty: `npm run render:publish-audit`)
- [ ] Incognito window — no stale localStorage
- [ ] Mic tested · screen 1440×900 or 1920×1080

---

## Film mode URL

Opens app with **script overlay** (prev/next beats):

```text
https://tooltruth-webmcp.vercel.app/?film=1&view=integrations&demo=1
```

| Beat | Deep link |
|------|-----------|
| 0 — Landing tape | `/?film=1&beat=0&store=ember-oak&view=merchant` |
| 1 — Bill depth | `/?film=1&beat=1&store=ember-oak&view=merchant` |
| 2 — URL audit | `/?film=1&beat=2&view=integrations&demo=1` |
| 3 — Rankings | `/?film=1&beat=3&view=integrations` |
| 4 — Agent journey | `/?film=1&beat=4&store=ember-oak&view=merchant` |
| 5 — Three paths | Audit colourpop first, then Readiness compare panel |
| 6 — Autopilot | `/?film=1&beat=6&store=ember-oak&view=merchant` |
| 7 — Co-shop | `/?film=1&beat=7&view=shop` |
| 8 — Render | `/?film=1&beat=8&view=integrations` |
| 9 — Close | `/?film=1&beat=9` (landing or hero) |

---

## WebMCP native path (bonus for judges)

Chrome 149+ → `chrome://flags/#enable-webmcp-testing` → relaunch

Badge should read **WebMCP live · 18 tools**. Film co-shop with assistant calling tools (not dev console) if flag works. Open Field companion first for the handbook beat.

ChatGPT in-app browser also accepted per Devpost rules.

---

## Key numbers (say these)

| Stat | Source |
|------|--------|
| **8×** AI traffic YoY | Shopify Q1 2026 |
| **78.6%** agent cart abandon | Presenc AI 2026 |
| **78/148** stores crawled · **0% GTIN** | Our batch |
| **70 → 94** CAPTCHA clear | ember-oak sandbox |
| **16** WebMCP tools | `GET /api/v1/tools` |

---

## Do not claim on camera

- ❌ "We fixed your live Shopify checkout" — sandbox only
- ❌ URL audit scores CAPTCHA — NOT MEASURED on crawls
- ❌ UCP available on every store — many return 404 (honest in compare table)

---

## After recording

- [ ] Upload video (<3 min) to YouTube unlisted
- [ ] Paste `DEVPOST.md` copy into Devpost
- [ ] Submit before **Sep 3, 1pm PDT**
