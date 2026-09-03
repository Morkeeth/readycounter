# ReadyCounter — pitch pack (Tue Sep 1 morning)

**Branch:** `night/gates-that-lie-2026-08-31`  
**Live (may lag branch):** https://readycounter.vercel.app  
**Deadline:** Devpost Wed Sep 3, 2026 · 1pm PDT  
**Tagline:** Agent commerce. Now reviewable. Proof.

---

## 30-second elevator

> **Lighthouse for agentic commerce — not Shopify's rails.**  
> We already parsed **148** DTC brands. **78** opened a public feed at **0% scrape GTIN**; **11** still return GTIN via UCP where scrape is empty.  
> Paste your URL → see your catalog bill vs the field → re-audit for a delta → prove checkout with **18 WebMCP tools** in the same tab.  
> **Agent commerce. Now reviewable. Proof.**

---

## 90-second demo beats (film or live)

| Time | Beat | Show | Say |
|------|------|------|-----|
| 0:00 | Hook | Landing tape **70/100** ember-oak, VOID stamp | Agents abandon **78.6%** of carts — merchants can't see the leak |
| 0:15 | Width | Connect lighthouse hero **148 parsed · 78 crawled · 0% GTIN** | We measured the field so you're not alone |
| 0:30 | Measure | Paste **colourpop.com** → catalog **0/24** · YOU·FIELD strip | Catalog budget only — honest about what crawl can't see |
| 0:45 | Compare | Rankings filter **UCP GTIN · scrape empty** (11 stores) | Scrape ≠ agent protocol |
| 0:55 | Insights | Offer% + policy chips after audit | ACP needs Offer schema + live privacy/ToS |
| 1:05 | Prove | **Prove in co-shop** or WebMCP tool console | Same cart, same bill — `prepare_checkout` never charges |
| 1:15 | Re-measure | Re-audit → delta receipt | Before/after merchants can share |
| 1:25 | Close | Sandbox CAPTCHA **70→94** (ember-oak) | Fix one wall, bill moves — traced to Presenc row |

**Teleprompter:** `demo/voiceover.mp3` (~102s) · `demo/FILM-AND-SUBMIT.md`

**Film URL:** `?film=1&view=integrations&demo=1&audit_url=https://colourpop.com`

---

## Judge hooks (show on camera)

1. **Comparison** — you vs 148, not a solo score
2. **Before/after** — re-audit delta + sandbox 70→94
3. **Width** — rankings, UCP×scrape columns, 78/148
4. **Insights** — 0% GTIN, 11 UCP gaps, Offer%, policy smoke
5. **Ease** — paste URL, no signup, no JSON

---

## Connect arc (product story)

```
1 · MEASURE   → paste URL → catalog bill + YOU·FIELD + handbook flags
2 · COMPARE   → 148 rankings · UCP gap filter · vertical
3 · PROVE     → WebMCP (flag or tool console) · co-shop CTA
4 · RE-MEASURE → delta receipt · ?audit_url= share link
```

---

## Deep links (bookmark bar)

| Link | Purpose |
|------|---------|
| https://readycounter.vercel.app/?view=integrations&demo=1 | Connect cold start |
| https://readycounter.vercel.app/?store=ember-oak&view=merchant | CAPTCHA sandbox 70→94 |
| https://readycounter.vercel.app/?store=neon-matcha&view=merchant | Account wall sandbox |
| https://readycounter.vercel.app/api/v1/rankings | Field receipt JSON |
| https://readycounter.vercel.app/api/v1/render/status | KV + batch stats |

---

## Morning checklist (Oscar gates)

| # | Task | Command / artifact |
|---|------|-------------------|
| 1 | **Pull branch** | `git pull && npm run verify` |
| 2 | **Deploy prod** | `vercel --prod` (lighthouse hero + Offer chips go live) |
| 3 | **Record film** | `demo/FILM-AND-SUBMIT.md` → `demo/demo-final.mp4` ≤2:30 |
| 4 | **Upload video** | YouTube unlisted · incognito plays |
| 5 | **Devpost** | Paste from `DEVPOST.md` · tagline ≤60 chars |
| 6 | **Submit** | Before Wed Sep 3 1pm PDT |

---

## Say / don't say

| ✅ Say | ❌ Don't |
|--------|----------|
| Lighthouse for agentic commerce | We fix your Shopify checkout |
| Agent-side truth · catalog budget | Full /100 on field crawls |
| 78/148 crawled · 0% scrape GTIN | Stale 34/58 batch |
| 18 WebMCP tools | 16 tools |
| NOT MEASURED until OAuth/journey | We audited your checkout live |
| Co-shop proof · human confirms payment | Agent charges your card |
| 2027: run on every ship, public receipt | We're replacing Shopify Admin |

---

## Q&A honest gaps

| Question | Answer |
|----------|--------|
| OAuth vs crawl? | E1 pairs not done — need connected shop. Compare API shows UCP vs scrape today. |
| Full checkout audit? | Crawl = catalog legibility. Checkout walls need OAuth or agent journey. |
| Shopify competitor? | No — we measure what agents retrieve; Shopify owns rails/toggles. |
| Open source? | Yes — fork `stores.ts`, run locally, `npm run verify` is the contract. |
| WebMCP without flag? | Path B tool console — same 18 handlers. |

---

## Overnight ship receipt (2026-08-31)

**Slices landed on branch:**

- RC-A/B/C/W complete · B7 Offer% rankings · C8 ONBOARDING · E2 compare doc
- Connect arc · offerPct + policySmoke · co-shop prove CTA

**Verify:** `npm run verify && npm run build` green on `869e6df`

**Cloud lanes:** RC-A/B/C/W all FINISHED

**Optional morning:** `npm run audit:batch -- --curated --publish` — backfill Offer% in rankings KV

---

## One-liner close

*"Lighthouse for agentic commerce. Not Shopify's rails. Agent-side truth."*
