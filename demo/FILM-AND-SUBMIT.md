# ReadyCounter — film in ~12 minutes, then submit

**Line:** Agent commerce. Now reviewable. Proof.  
**Say the product name twice.** ReadyCounter.  
**Length:** ≤2:30 preferred · hard cap <3:00 (Devpost).  
**Live:** https://tooltruth-webmcp.vercel.app  
**Film mode:** https://tooltruth-webmcp.vercel.app/?film=1&view=integrations&demo=1  
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
curl -s https://tooltruth-webmcp.vercel.app/api/v1/rankings | jq '{succeeded,shopCount,avgGtinPct,ucp}'
# expect: succeeded 78, shopCount 148, avgGtinPct 0, ucp.gtinWhereCrawlZero 11
```

---

## Teleprompter — click + say

| t | CLICK / SHOW | SAY |
|---|--------------|-----|
| 0:00 | Landing / ember-oak tape **70/100** CHECKOUT VOID | "Agent commerce. Now reviewable. Proof." |
| 0:08 | Point CAPTCHA **0/24** | "Agents already shop Shopify. Traffic up eight-x. Seventy eight point six percent of agent carts still abandon. Merchants cannot see which door is locked." |
| 0:22 | Expand readiness bill | "So we print the bill. ReadyCounter. Seventy out of one hundred. Every point is a published abandonment share. Captcha twenty four. Stale data twenty six. Nothing invented." |
| 0:38 | Connect → Audit colourpop (`?demo=1`) | "Paste a real storefront. We read the public catalog agents get. Catalog score only. Checkout not measured until you connect. That honesty is the product." |
| 0:52 | Rankings · filter **UCP GTIN · scrape empty** | "One forty eight brands. Seventy eight crawled. Zero percent GTIN in the scrape. Eleven still return GTIN on UCP. Scrape is not the protocol." |
| 1:08 | Re-audit same URL OR show delta receipt if prior | "Fix something. Re-audit. We print the delta. Measure. Act. Re-measure. Proof." |
| 1:18 | Journey on ember-oak → Autopilot CAPTCHA → **70→94** | "One click walks the path. Blocked at captcha. Autopilot: seventy becomes ninety four. Live Shopify untouched." |
| 1:32 | Co-shop · WebMCP badge / tool console | "Eighteen WebMCP tools. Human and agent, one cart. Prepare checkout never charges." |
| 1:42 | Against the field / companion OR close hero | "Next: Admin pairs, Offer at scale, ACP eligibility smoke, an open receipt standard for every merchant." |
| 1:55 | Close on brand | "ReadyCounter is live. Open source. Shopify catalog. Render audit. WebMCP proof. Agent commerce. Now reviewable. ReadyCounter. Proof." |

---

## Do NOT say on camera

- "We fixed your live Shopify checkout"
- Crawl scores checkout CAPTCHA (NOT MEASURED)
- "Every store has UCP"
- "Full agent readiness /100" for a field crawl
- Stale **34/58** batch numbers (old) — use **78/148**
- "Sixteen tools" — it is **eighteen**

---

## Path B — silent capture + Kokoro (ATA method)

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
