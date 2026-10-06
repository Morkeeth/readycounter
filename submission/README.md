# ReadyCounter — WebMCP Challenge submission pack

**Start here** before Devpost paste, YouTube upload, or film tweaks.

| Asset | Path |
|-------|------|
| **Oscar 15-min checklist** | [`SUBMIT-READY.md`](./SUBMIT-READY.md) |
| **Film (automated)** | `./film/build.sh` → `demo/demo-final.mp4` |
| **Film (manual)** | `demo/FILM-AND-SUBMIT.md` teleprompter |
| **Flipbook cards** | `demo/flipbook.html` · `demo/readycounter-flipbook.json` |
| **Voice script** | `demo/voiceover.txt` → Kokoro `demo/voiceover.mp3` |
| **Devpost paste** | [`DEVPOST-PASTE.md`](./DEVPOST-PASTE.md) (from root `DEVPOST.md`) |
| **60-second judge path** | [`../JUDGE-60s.md`](../JUDGE-60s.md) |
| **ChatGPT / Chrome Path A·B** | [`../CHATGPT-JUDGE.md`](../CHATGPT-JUDGE.md) |
| **Morning pitch** | [`../demo/PITCH-TOMORROW.md`](../demo/PITCH-TOMORROW.md) |

- **Deadline:** Wed Sep 3, 2026 · **1pm PDT**
- **Devpost:** https://webmcp.devpost.com/
- **Live:** https://tooltruth-webmcp.vercel.app
- **Judge:** https://tooltruth-webmcp.vercel.app/?judge=1
- **Repo:** https://github.com/Morkeeth/tooltruth-webmcp

---

## Oscar gates

| ID | Gate | Status | Exact steps |
|----|------|--------|-------------|
| **O1** | Film | ✅ | `demo/demo-final.mp4` on disk (v2 · ~94.6s · co-shop early). RC-FILM may land another cut — re-watch before YouTube. |
| **O2** | YouTube upload | **Oscar-only** | [`SUBMIT-READY.md`](./SUBMIT-READY.md) Step 1 — unlisted upload · paste `YOUTUBE-DESCRIPTION.txt` · upload `.srt` · **incognito play** |
| **O3** | Prod + KV | ✅ | Deployed 2026-09-01 · `curl -s https://tooltruth-webmcp.vercel.app/api/v1/health \| jq .kv` → `backend: redis` |
| **O4** | Devpost submit | **Oscar-only** | [`SUBMIT-READY.md`](./SUBMIT-READY.md) Step 2 — paste [`DEVPOST-PASTE.md`](./DEVPOST-PASTE.md) · attach YouTube + live + repo · submit before 1pm PDT |

Cloud agents must **not** perform O2/O4 (outward acts = Oscar’s click).

---

## Live probe (re-check before film / submit)

```bash
curl -s https://tooltruth-webmcp.vercel.app/api/v1/rankings | jq '{succeeded,shopCount,avgGtinPct,ucp}'
# expect: succeeded 78, shopCount 148, avgGtinPct 0, ucp.gtinWhereCrawlZero 11

curl -s https://tooltruth-webmcp.vercel.app/api/v1/tools | jq '.toolCount'
# expect: 18

curl -s https://tooltruth-webmcp.vercel.app/api/v1/health | jq '.kv'
# expect: backend redis
```

| Probe | Expect |
|-------|--------|
| Landing ember-oak | **70/100** · CHECKOUT VOID |
| Rankings UCP filter | **11** stores · scrape GTIN **0%** |
| URL audit colourpop | catalog score · NOT MEASURED checkout |
| Re-audit same URL | delta receipt |
| Autopilot CAPTCHA clear | **70 → 94** sandbox |
| `prepare_checkout` | refuses · never charges |
| Share `?co=` | cart survives fresh context ([`audits/SHARE-STRANGER-2026-09-01.md`](../audits/SHARE-STRANGER-2026-09-01.md)) |

---

## Film pipeline (ATA method)

```bash
cd ~/CODE/tooltruth-webmcp
chmod +x film/build.sh
./film/build.sh
```

Produces:

| File | Role |
|------|------|
| `demo/seg-intro.mp4` | Flipbook title card (5s) |
| `demo/seg-browser.mp4` | Live prod walkthrough (~96s) |
| `demo/seg-outro.mp4` | Close card (4s) |
| `demo/voiceover.mp3` | Kokoro narration (cue-aligned) |
| `demo/demo-final.srt` | YouTube captions |
| `demo/demo-final.mp4` | **Upload this** |

Film mode URL: `https://tooltruth-webmcp.vercel.app/?film=1&view=integrations&demo=1`

Beat deep links: [`../FILM-READY.md`](../FILM-READY.md)

**Film note:** v1 automated cut exists; **v2** (co-shop-first, ~94.6s) is on disk as `demo/demo-final.mp4`. RC-FILM lane owns further film edits — do not rebuild from submit-doc lanes.

---

## Submit checklist

1. [ ] Watch `demo/demo-final.mp4` end to end (≤2:30) — **O1 ✅** if file already good
2. [ ] Upload **unlisted** YouTube · incognito-check URL plays — **O2 Oscar**
3. [ ] Paste [`DEVPOST-PASTE.md`](./DEVPOST-PASTE.md) into Devpost — **O4 Oscar**
4. [ ] Attach video URL · live URL · repo URL
5. [ ] Submit before **Sep 3, 1pm PDT**

---

## Say on camera / in copy

- **ReadyCounter** (twice)
- **Agent commerce. Now reviewable. Proof.**
- **78 / 148** crawled · **0%** scrape GTIN · **11** UCP gaps
- **18** WebMCP tools
- **70 → 94** CAPTCHA sandbox proof
- Field crawls = **catalog budget only** · checkout NOT MEASURED until OAuth

## Do NOT claim

- Fixed live Shopify checkout
- URL audit scores CAPTCHA / checkout walls
- UCP on every store
- Full /100 for field crawls
- Stale **34/58** or **16 tools**
- OAuth Admin↔crawl pairs (E1 not done)
- “Start shopping” / “Start live session” (UI: **Co-shop** · **Copy cart link**)

---

## Honest gaps (say once, move on)

| Gap | Status |
|-----|--------|
| E1 OAuth pairs | Not done — say "public feeds empty" |
| ACP feed certification | Deferred |
| `Start live session` | Removed — **Copy cart link** only |

---

## Constitution

`prepare_checkout` **never charges a card.**
