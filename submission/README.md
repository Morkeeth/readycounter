# ReadyCounter — WebMCP Challenge submission pack

**Start here** before Devpost paste, YouTube upload, or film tweaks.

| Asset | Path |
|-------|------|
| **Film (automated)** | `./film/build.sh` → `demo/demo-final.mp4` |
| **Film (manual)** | `demo/FILM-AND-SUBMIT.md` teleprompter |
| **Flipbook cards** | `demo/flipbook.html` · `demo/readycounter-flipbook.json` |
| **Voice script** | `demo/voiceover.txt` → Kokoro `demo/voiceover.mp3` |
| **Devpost paste** | [`DEVPOST-PASTE.md`](./DEVPOST-PASTE.md) (from root `DEVPOST.md`) |
| **60-second judge path** | [`../JUDGE-60s.md`](../JUDGE-60s.md) |
| **Morning pitch** | [`../demo/PITCH-TOMORROW.md`](../demo/PITCH-TOMORROW.md) |

- **Deadline:** Wed Sep 3, 2026 · **1pm PDT**
- **Devpost:** https://webmcp.devpost.com/
- **Live:** https://readycounter.vercel.app
- **Repo:** https://github.com/Morkeeth/readycounter

---

## Live probe (re-check before film / submit)

```bash
curl -s https://readycounter.vercel.app/api/v1/rankings | jq '{succeeded,shopCount,avgGtinPct,ucp}'
# expect: succeeded 78, shopCount 148, avgGtinPct 0, ucp.gtinWhereCrawlZero 11

curl -s https://readycounter.vercel.app/api/v1/tools | jq 'length'
# expect: 18
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

Film mode URL: `https://readycounter.vercel.app/?film=1&view=integrations&demo=1`

Beat deep links: [`../FILM-READY.md`](../FILM-READY.md)

---

## Submit checklist

1. [ ] `./film/build.sh` — watch `demo/demo-final.mp4` end to end (≤2:30)
2. [ ] Upload **unlisted** YouTube · incognito-check URL plays
3. [ ] Paste [`DEVPOST-PASTE.md`](./DEVPOST-PASTE.md) into Devpost
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
