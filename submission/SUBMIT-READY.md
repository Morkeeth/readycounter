# Oscar — 15-minute Devpost submit

**Deadline:** Wed Sep 3, 2026 · **1pm PDT** (22:00 Paris)  
**Tier (EYES):** TOP-25 base · TOP-10 stretch if film v2 + native WebMCP land

---

## Pre-flight (2 min)

```bash
curl -s https://tooltruth-webmcp.vercel.app/api/v1/rankings | jq '{succeeded,shopCount,avgGtinPct,ucp:.ucp.gtinWhereCrawlZero}'
# MUST show: 78, 148, 0, 11 — if 0/0 run: npm run render:publish-audit

cd ~/CODE/tooltruth-webmcp && git pull && npm run verify
```

Open `demo/demo-final.mp4` — watch **end to end** (use v2 if RC-FILM landed).

---

## Step 1 · YouTube (5 min)

| Field | Value |
|-------|-------|
| **File** | `demo/demo-final.mp4` |
| **Title** | `ReadyCounter — WebMCP Challenge` |
| **Description** | Paste `submission/YOUTUBE-DESCRIPTION.txt` |
| **Captions** | Upload `demo/demo-final.srt` |
| **Visibility** | **Unlisted** (or Public) |
| **Category** | Science & Technology |

**Incognito-check:** paste URL in private window — must play with audio.

Copy the YouTube URL: `________________________`

---

## Step 2 · Devpost (8 min)

URL: https://webmcp.devpost.com/

| Field | Paste from |
|-------|------------|
| Project name | `ReadyCounter` |
| Tagline | `Agent commerce. Now reviewable. Proof.` |
| Elevator + description | `submission/DEVPOST-PASTE.md` |
| **Demo video** | YouTube URL from Step 1 |
| **Live URL** | `https://tooltruth-webmcp.vercel.app` |
| **Judge URL** | `https://tooltruth-webmcp.vercel.app/?judge=1` |
| **Repo** | `https://github.com/Morkeeth/tooltruth-webmcp` |
| Built with | React, TypeScript, Vite, WebMCP, Zustand, Render KV |

**Testing instructions** (short): `?judge=1` → Co-shop + tool console → `JUDGE-60s.md` · criteria map: `submission/JUDGES.md`

Click **Submit** before 1pm PDT.

---

## Say once (honest gaps)

- Field crawls = catalog budget only · checkout NOT MEASURED until OAuth
- E1 OAuth Admin↔crawl pairs not done
- `prepare_checkout` never charges a card

---

## Do NOT claim

- Fixed live Shopify checkout
- Full /100 for field crawls
- 16 tools (it's **18**)

---

## After submit

Do not touch repo or re-film until winners announced.
