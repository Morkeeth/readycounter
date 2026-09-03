# Onboarding — ReadyCounter (for builders & agents)

**Repo:** `Morkeeth/readycounter`  
**Branch:** `night/gates-that-lie-2026-08-31`  
**Live:** https://readycounter.vercel.app  
**Pitch:** `demo/PITCH-TOMORROW.md` · **Ambition:** `demo/AMBITION.md`  
**Hackathon:** WebMCP Challenge — Devpost **Wed Sep 3, 2026 1pm PDT**

## What this is

**Lighthouse for agentic commerce** — not Shopify's rails. Agent-side truth:

- Presenc-weighted readiness bill (six published rows → 100 pts)
- Field crawl of **148** curated DTC brands (**78** crawled, **0% scrape GTIN**)
- WebMCP proof layer (**18 tools**) — same cart, same bill

## Stranger path (60s, no signup)

1. `/?view=integrations` — lighthouse hero, paste URL
2. Audit → YOU·FIELD·DELTA + Offer% + policy chips
3. Rankings **148** wide · filter **UCP GTIN · scrape empty**
4. **Prove in co-shop** or Agent tool console (Path B)
5. Re-audit same URL → delta receipt

## Agent builder path (<2 min)

### REST (no WebMCP flag)

```bash
# Field batch
curl -s https://readycounter.vercel.app/api/v1/rankings | jq '{shopCount,succeeded,avgGtinPct,avgOfferPct,ucp}'

# Audit a storefront
curl -sS -X POST https://readycounter.vercel.app/api/v1/audit/url \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://colourpop.com"}' | jq '{score,meta:{offerPct,policySmoke,gtinPct}}'

# Crawl vs UCP vs OAuth headline
curl -sS -X POST https://readycounter.vercel.app/api/v1/audit/compare \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://www.glossier.com"}' | jq '{headline,crawl,ucp}'

# Handbook desk
curl -s 'https://readycounter.vercel.app/api/v1/companion?topic=issues' | jq '.issues[:3]'
```

### WebMCP (in-tab)

| Path | How |
|------|-----|
| **A** | Chrome `chrome://flags/#enable-webmcp-testing` → reload → header shows *WebMCP live* |
| **B** | Connect → Agent tool console — same handlers |

**Start here:** `search_catalog` → `add_to_order` → `get_readiness_score` → `prepare_checkout` (never charges) → `get_field_companion`

Tool list: `GET /api/v1/tools` · manifest: `src/webmcp/toolManifest.ts`

### Connect arc (product)

```
1 · MEASURE   → POST /audit/url
2 · COMPARE   → GET /rankings + field compare strip
3 · PROVE     → WebMCP tools / co-shop
4 · RE-MEASURE → same URL → delta in localStorage + UI
```

## Read first (depth)

1. `demo/PITCH-TOMORROW.md` — film + Devpost beats  
2. `LIGHTHOUSE-VISION.md` — narrative north star  
3. `WHY-WEBMCP.md` — proof plane vs audit plane  
4. `research/RANK-AND-HELP-GAP.md` — honest scope limits  

## Commands

```bash
npm run verify && npm run build
npm run test:e2e
npm run audit:batch -- --curated --publish   # needs REDIS_URL in .env.local
```

Deploy: `vercel --prod` (Oscar gate — branch may lead prod).

## Constitution

- `prepare_checkout` never charges  
- Cited figures → `sources.ts` + `research.md`  
- Field crawl = catalog budget only — never /100  
- WebMCP = proof, not the score engine  
- **Not us:** Shopify Admin rails — we measure agent-side retrieval

## Blocked on Oscar

- E1 OAuth Admin↔crawl pairs (needs connected shop)  
- Film · prod deploy · Devpost submit
