# Submit-ready checklist — Oscar only (~15 min)

Cloud lane stops here. **You** upload YouTube, paste Devpost, submit. Do not delegate outward acts.

**Deadline:** Wed Sep 3, 2026 · **1pm PDT**  
**Devpost:** https://webmcp.devpost.com/

---

## Before you click Submit (5 min)

```bash
cd tooltruth-webmcp
npm run verify && npm run check:numbers
curl -s https://tooltruth-webmcp.vercel.app/api/v1/rankings | jq '{succeeded,shopCount,avgGtinPct,ucp}'
curl -s https://tooltruth-webmcp.vercel.app/api/v1/tools | jq '.toolCount'
```

| Probe | Expect (re-derive at API) |
|-------|---------------------------|
| Rankings | `succeeded` **78**, `shopCount` **148**, `avgGtinPct` **0**, `ucp.gtinWhereCrawlZero` **11** |
| Tools | `toolCount` **18** |
| Ember & Oak | **70/100** · CAPTCHA on · toggle off → **94** |
| `prepare_checkout` | Refuses with wall citation · never charges |

**Incognito stranger path** (no login):

1. https://tooltruth-webmcp.vercel.app/?view=shop — add item.
2. Connect → Agent tool console → `add_to_order` + `get_order`.
3. Connect → colourpop audit → rankings UCP filter **11**.

Full script: [`../JUDGE-60s.md`](../JUDGE-60s.md) · WebMCP paths: [`../CHATGPT-JUDGE.md`](../CHATGPT-JUDGE.md)

---

## Film / YouTube (O1 · O2)

| Step | Action |
|------|--------|
| Watch | `demo/demo-final.mp4` end-to-end (≤2:30) — **v1 on disk** |
| v2 note | RC-FILM lane may replace with `film/build.sh` output — re-watch before upload |
| Upload | YouTube **unlisted** |
| Incognito | Open video URL in fresh session — must play |
| Title | `ReadyCounter — WebMCP Challenge` (or match Devpost name) |
| Description | Paste [`YOUTUBE-DESCRIPTION.txt`](./YOUTUBE-DESCRIPTION.txt) |
| Captions | Optional: `demo/demo-final.srt` |

**YouTube fields checklist**

- [ ] Visibility: **Unlisted**
- [ ] Video URL copied for Devpost
- [ ] Incognito play confirmed
- [ ] Live URL in description: https://tooltruth-webmcp.vercel.app
- [ ] Repo URL in description: https://github.com/Morkeeth/tooltruth-webmcp

---

## Devpost paste (O4)

Open [`DEVPOST-PASTE.md`](./DEVPOST-PASTE.md) — fields below.

| Devpost field | Paste from |
|---------------|------------|
| Project name | `ReadyCounter` |
| Tagline | `Agent commerce. Now reviewable. Proof.` |
| Elevator pitch | Elevator pitch section |
| Description | Extended description section |
| Built with | Built with section |
| Testing instructions | Testing instructions + link to `JUDGE-60s.md` |
| **Try it out** live URL | `https://tooltruth-webmcp.vercel.app` |
| **Try it out** alt URL | `https://tooltruth-webmcp.vercel.app/?view=merchant&store=neon-matcha` |
| Video URL | YouTube unlisted link from O2 |
| Repo URL | `https://github.com/Morkeeth/tooltruth-webmcp` |

**Devpost checklist**

- [ ] All figures match live API (78/148/0%/11/18) — not stale 34/58 or 16 tools
- [ ] Video URL attached
- [ ] Submit clicked before **Sep 3, 1pm PDT**

---

## Oscar gates status

| Gate | Owner | Status | Done when |
|------|-------|--------|-----------|
| **O1** Film on disk | Oscar | ✅ | `demo/demo-final.mp4` exists (v1; v2 optional from RC-FILM) |
| **O2** YouTube upload | Oscar | ⬜ | Incognito plays |
| **O3** `vercel --prod` | Oscar | ✅ | 2026-09-01 · rankings 78/148 live |
| **O4** Devpost submit | Oscar | ⬜ | Before deadline |
| **O5** Shopify OAuth connect | Oscar | ⬜ | Enables E1 experiment |

---

## Constitution

`prepare_checkout` **never charges a card.**
