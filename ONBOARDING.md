# Onboarding — ReadyCounter (for Claude / agents)

**Repo:** `Morkeeth/tooltruth-webmcp`  
**Live:** https://tooltruth-webmcp.vercel.app  
**Hackathon:** WebMCP Challenge — Devpost deadline **Wed Sep 3, 2026 1pm PDT**

## What this is

Agent-side commerce readiness: Presenc-weighted bill + public crawl field study + WebMCP proof layer. **Not** an Admin catalog scanner.

## Read first (in order)

1. `research/DEEP-DIVE-UNDERSTANDING.md` — what is locked vs stretch  
2. `research/HOLISTIC-EXPANSION.md` — expansion roadmap (slices 1–3 shipped)  
3. `research/HANDBOOK.md` + `WHY-WEBMCP.md`  
4. `GOAL-LONG-RUN.md` · `DEMO.md` · `FILM-READY.md`

## Field receipt (v4)

**148** curated URLs · **78** crawled · **0% GTIN** on all crawled · catalog **0/24**.  
Live: `GET /api/v1/rankings` · analysis locally via `npm run audit:analyze` (batch JSON is gitignored under `audits/`).

## Product map

| Tab | Job |
|-----|-----|
| Connect | 1 Measure (audit) → 2 Against the field → How to run WebMCP (A/B) → rankings |
| Readiness | Bill + field review + journey + compare |
| Co-shop | Shared cart / WebMCP proof |

## Commands

```bash
npm run verify && npm run build
npm run test:e2e
npm run audit:batch -- --publish   # long
npm run audit:analyze
curl -s https://tooltruth-webmcp.vercel.app/api/v1/rankings | jq '{shopCount,succeeded,avgGtinPct}'
```

Deploy: local `npm run build` then `vercel --prod` (API `.js` must be bundled; `.ts` excluded via `.vercelignore`).

## Next slices (holistic)

4. E1 OAuth pairs — script ready (`npm run audit:oauth-pairs`); needs Oscar to connect a shop  
5. ~~SSRF + KV rate limits~~ shipped (`src/server/ssrf.ts`, `checkRateLimitAsync`)  
6. ~~E3 UCP census + E3b vs crawl~~ **81/148 UCP; 11 brands with UCP GTIN where scrape is 0%**  
7. Oscar: film + Devpost · E1 when a shop is OAuth-connected  

Start here: this file. Branch: `night/gates-that-lie-2026-08-31` (pushed).

## Constitution

- `prepare_checkout` never charges  
- Cited figures → `sources.ts` + `research.md`  
- Crawl ≠ checkout measured; sandbox ≠ field  
- WebMCP = proof, not the score engine  
- Brand is **ReadyCounter** / the counter — not “Field companion”
