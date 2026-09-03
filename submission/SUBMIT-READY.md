# Oscar — 15-minute seal (deadline morning)

**Deadline:** Thu Sep 4, 2026 · **1:00am PDT** (10:00 Paris) — re-fetched from webmcp.devpost.com 2026-09-03 23:5x UTC: `2026-09-04T04:00:00-04:00`

**Live entry:** https://devpost.com/software/readycounter — public page already shows **Submitted to** The WebMCP Challenge. This checklist is seal / eligibility, not a cold submit.

**Cloud receipt:** `docs/CLOUD-RECEIPT-rc-2026-09-04.md`

---

## Pre-flight (2 min) — re-derive, do not trust this file's numbers

```bash
curl -sI "https://readycounter.vercel.app/?judge=1" | head -5
# expect HTTP/2 200

curl -s https://readycounter.vercel.app/api/v1/rankings | jq '{succeeded,shopCount,avgGtinPct,ucp:.ucp.gtinWhereCrawlZero}'
# cloud re-derived 2026-09-03: succeeded 78 · shopCount 148 · avgGtinPct 0 · gtinWhereCrawlZero 11
# if rankings empty: npm run render:publish-audit (Oscar only)

curl -s https://readycounter.vercel.app/api/v1/tools | jq '{toolCount}'
# expect {"toolCount":18}  — NOT jq 'length' (that returns 4 object keys)

ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 demo/demo-final.mp4
# on disk 2026-09-03: ~141.3s · YouTube on Devpost: zyOK7XLKY8I
```

Open `https://readycounter.vercel.app/?judge=1` — Co-shop tab + **Judge quick path** banner must show.

---

## Step 1 · YouTube eligibility (3 min)

Devpost rules want a **public** YouTube video. Unlisted is an eligibility risk.

| Check | Where |
|-------|-------|
| Video on entry | https://www.youtube.com/watch?v=zyOK7XLKY8I |
| Title | ReadyCounter -- WebMCP Challenge demo (oEmbed) |
| Visibility | Must be **Public** — change if still Unlisted |
| Incognito | Opens and plays with audio |

Do **not** re-upload unless the live cut is wrong. Disk `demo/demo-final.mp4` is the current ship file.

---

## Step 2 · Devpost seal (5 min)

URL: https://webmcp.devpost.com/ → My projects → ReadyCounter

| Check | Expect |
|-------|--------|
| Status | **Submitted** (not `submission_draft`) — if still draft, press Submit |
| Live / Try it | `https://readycounter.vercel.app/?judge=1` |
| Repo | `https://github.com/Morkeeth/readycounter` |
| Demo video | YouTube above |
| Deadline | before **1:00am PDT** Sep 4 — not 1pm |

If fields need a last edit, paste from `submission/DEVPOST-ABOUT.md` / `submission/DEVPOST-UPDATE-GUIDE.md`. Prefer UPDATE-GUIDE over older `DEVPOST-PASTE.md`.

---

## Step 3 · Only Oscar can close (5 min)

1. Open `https://readycounter.vercel.app/?judge=1` in **ChatGPT's in-app browser** and fire one tool (Path B needs no Chrome flag).
2. Watch the first 30s of the YouTube cut yourself.
3. Stop. Do not push to the repo after seal — a push redeploys the site judges hit.

---

## Say once (honest gaps)

- Field crawls = catalog budget only · checkout NOT MEASURED until OAuth
- E1 OAuth Admin↔crawl pairs not done
- `prepare_checkout` never charges a card

---

## Do NOT

- YouTube re-upload for taste
- Devpost re-submit loops after sealed
- Rename GitHub
- Claim 16 tools (it's **18**)
- Claim fixed live Shopify checkout
- Trust a midday **1pm** deadline — live HTML is **1:00am PDT** Sep 4

---

## After seal

Do not touch repo or re-film until winners announced.
