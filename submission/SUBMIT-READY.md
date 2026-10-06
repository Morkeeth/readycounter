# Oscar — 15-minute Devpost submit

**Deadline:** Wed Sep 3, 2026 · **1pm PDT** (22:00 Paris)  
**Tier (EYES):** TOP-25 base · TOP-10 stretch if native WebMCP Path A is shown in film

**Oscar-only gates:** **O2** YouTube upload · **O4** Devpost submit  
**Already done:** **O1** film ✅ · **O3** prod + KV ✅

---

## Pre-flight (2 min)

```bash
curl -s https://tooltruth-webmcp.vercel.app/api/v1/rankings | jq '{succeeded,shopCount,avgGtinPct,ucp:.ucp.gtinWhereCrawlZero}'
# MUST show: 78, 148, 0, 11 — if rankings empty, run: npm run render:publish-audit

curl -s https://tooltruth-webmcp.vercel.app/api/v1/health | jq '.kv'
# MUST show: backend redis · redisOk true

cd ~/CODE/tooltruth-webmcp && git pull && npm run verify && npm run check:numbers
```

Open `demo/demo-final.mp4` — watch **end to end** (v2 on disk: ~94.6s, co-shop early).  
Incognito-check the live judge path: [`../JUDGE-60s.md`](../JUDGE-60s.md) · [`../CHATGPT-JUDGE.md`](../CHATGPT-JUDGE.md).

---

## Step 1 · YouTube (5 min) — O2 Oscar-only

| Field | Value |
|-------|-------|
| **File** | `demo/demo-final.mp4` |
| **Title** | `ReadyCounter — WebMCP Challenge` |
| **Description** | Paste entire `submission/YOUTUBE-DESCRIPTION.txt` |
| **Captions** | Upload `demo/demo-final.srt` (if YouTube accepts) |
| **Visibility** | **Unlisted** (or Public) |
| **Category** | Science & Technology |
| **Tags (optional)** | WebMCP, agent commerce, Shopify, readiness |

**Incognito verify:** paste the YouTube URL in a private window — must play with audio end-to-end.

Copy the YouTube URL: `________________________`

---

## Step 2 · Devpost (8 min) — O4 Oscar-only

URL: https://webmcp.devpost.com/

| Field | Paste from / value |
|-------|--------------------|
| **Project name** | `ReadyCounter` |
| **Tagline** | `Agent commerce. Now reviewable. Proof.` |
| **Elevator + description** | `submission/DEVPOST-PASTE.md` (all paste sections) |
| **Demo video** | YouTube URL from Step 1 |
| **Website / live demo** | `https://tooltruth-webmcp.vercel.app` |
| **Judge / testing URL** | `https://tooltruth-webmcp.vercel.app/?judge=1` |
| **GitHub repo** | `https://github.com/Morkeeth/tooltruth-webmcp` |
| **Built with** | React, TypeScript, Vite, WebMCP, Zustand, Render KV, Vercel |

**Testing instructions** (short paste):

```text
1. Open https://tooltruth-webmcp.vercel.app/?judge=1
2. Co-shop → Add to order → Connect → Agent tool console → add_to_order → get_order → prepare_checkout (never charges)
3. Readiness (ember-oak): CAPTCHA off → 70→94
4. Connect: audit colourpop.com → rankings filter “ucp gtin · scrape empty” → 11
Full: JUDGE-60s.md · ChatGPT/Chrome native: CHATGPT-JUDGE.md · criteria: submission/JUDGES.md
```

Click **Submit** before **1pm PDT**.

---

## Oscar gate status

| ID | Gate | Status | Exact action |
|----|------|--------|--------------|
| **O1** | Film | ✅ | `demo/demo-final.mp4` on disk (v2 · ~94.6s). RC-FILM may still land a later cut — re-watch before upload. |
| **O2** | YouTube | Oscar | Step 1 above — upload + incognito play |
| **O3** | Prod + KV | ✅ | `vercel --prod` 2026-09-01 · `curl …/api/v1/health` → `kv.backend: redis` |
| **O4** | Devpost | Oscar | Step 2 above — paste pack + video URL + submit |

---

## Say once (honest gaps)

- Field crawls = catalog budget only · checkout NOT MEASURED until OAuth
- E1 OAuth Admin↔crawl pairs not done
- `prepare_checkout` never charges a card

---

## Do NOT claim

- Fixed live Shopify checkout
- Full /100 for field crawls
- **16 tools** (it is **18**)
- Stale **34/58** batch (it is **78/148**)
- “Start shopping” / “Start live session” (UI is **Co-shop** · **Copy cart link**)

---

## After submit

Do not touch repo or re-film until winners announced.
