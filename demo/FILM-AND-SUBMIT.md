# ReadyCounter — film in ~12 minutes, then submit

**Line:** Agent commerce. Now reviewable. Proof.  
**Say the product name twice.** ReadyCounter.  
**Length:** ≤2:30 preferred · hard cap <3:00 (Devpost).  
**Live:** https://readycounter.vercel.app  
**Film mode:** `/?film=1&view=integrations&demo=1`  
**Capture (no cue bar):** add `&record=1` or `&cues=0`  
**Deadline:** Wed Sep 3, 2026 · 1pm PDT

---

## Before you hit record (3 min)

1. Do Not Disturb · hide Dock (`⌥⌘D`) · hide bookmarks (`⌘⇧B`)
2. Display **1920×1080** · incognito Chrome · no personal tabs
3. Warm prod: open live URL once · confirm rankings **78/148** · UCP gap filter shows **11**
4. Optional headphones: play `demo/voiceover.mp3` as pace (Kokoro) while you click
5. Open exactly: film mode tab + this teleprompter

```bash
cd ~/CODE/tooltruth-webmcp
curl -s https://readycounter.vercel.app/api/v1/rankings | jq '{succeeded,shopCount,avgGtinPct,ucp}'
# expect: succeeded 78, shopCount 148, avgGtinPct 0, ucp.gtinWhereCrawlZero 11
```

---

## Teleprompter — click + say

**Vibe:** merchant not ready · losing invisible customers · comparison + before/after + width + ease

| t | CLICK / SHOW | SAY |
|---|--------------|-----|
| 0:00 | Landing / ember-oak **70/100** VOID | "Agent commerce. Now reviewable. Proof." |
| 0:06 | Point CAPTCHA **0/24** | "Your store is not ready for agents. They are already shopping. Seventy eight point six percent of carts abandon. Customers you never see." |
| 0:18 | Rankings scroll **148** · vertical chips | "ReadyCounter is the lighthouse. We already parsed one hundred forty eight popular stores. Compare yourself to the field. Width, not a vanity score alone." |
| 0:32 | Paste colourpop → Audit (`?demo=1`) | "Paste a URL. Super sleek WebMCP. One receipt. Ease." |
| 0:42 | Filter **UCP GTIN · scrape empty** · glossier row | "Zero percent barcodes in the scrape. Eleven still have GTIN on UCP. Insights you cannot get from a theme check." |
| 0:55 | Re-audit → **delta receipt** | "Before and after. Fix something. Re-audit. Measure. Act. Re-measure. Proof." |
| 1:05 | Autopilot CAPTCHA **70→94** | "Sandbox preview: seventy becomes ninety four. Live store untouched." |
| 1:15 | Co-shop · **18 tools** | "Eighteen WebMCP tools. Human and agent, one cart. Not Shopify's rails. Agent-side truth." |
| 1:25 | Against the field / companion | "The ambition: every merchant runs this when they ship anything new. Shopify adopts the receipt. Stores go public with their score." |
| 1:38 | Close | "ReadyCounter. Open source. Live now. Lighthouse for agentic commerce. Proof." |

---

## Do NOT say on camera

- "We fixed your live Shopify checkout"
- Crawl scores checkout CAPTCHA (NOT MEASURED)
- "Every store has UCP"
- "Full agent readiness /100" for a field crawl
- Stale **34/58** batch numbers (old) — use **78/148**
- "Sixteen tools" — it is **eighteen**

---

## Path B — automated build (ATA method)

```bash
cd ~/CODE/tooltruth-webmcp
./film/build.sh
```

Outputs `demo/demo-final.mp4`, `demo/voiceover.mp3`, `demo/demo-final.srt`.

Manual Kokoro only:

```bash
cd ~/CODE/voice-generation
./kvenv/bin/python vo.py ~/CODE/tooltruth-webmcp/demo/voiceover.txt \
  -o ~/CODE/tooltruth-webmcp/demo/voiceover.mp3 --preset demo
```

Record screen silent while VO plays in headphones. Mux:

```bash
ffmpeg -y -i ~/Desktop/Screen\ Recording.mov -i demo/voiceover.mp3 \
  -c:v libx264 -preset medium -crf 22 -c:a aac -b:a 128k \
  -shortest demo/demo-final.mp4
```

---

## Upload FIRST (processing lag kills deadlines)

1. Export ≤2:30 · upload YouTube **unlisted or public**
2. Incognito-check the URL plays
3. Paste `DEVPOST.md` into Devpost · attach video URL · submit before Sep 3 1pm PDT

## After deadline

Do not touch repo or video until winners announced.
