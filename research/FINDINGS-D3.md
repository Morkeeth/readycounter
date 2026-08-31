# D3: Agent commerce readiness — field findings

**ReadyCounter · August 2026**  
**Live rankings:** https://tooltruth-webmcp.vercel.app/api/v1/rankings  
**Repo:** https://github.com/Morkeeth/tooltruth-webmcp

---

## Headline

**We crawled 148 curated DTC Shopify storefronts. 78 opened a public feed — every one had 0% GTIN coverage and 0/24 catalog legibility — while sandbox scores would show 60–83/100.**

Agents reading what merchants publish to the open web cannot resolve product identifiers. The abandonment bill (Presenc AI) applies at checkout; the catalog gap applies before an agent ever gets there.

---

## Methodology

1. **Curated sample** — `audits/curated-dtc.json` — beauty, apparel, home, food, wellness, pet, accessories, fun, outdoor, kids (148 unique URLs).
2. **Crawl** — public `/products.json` or JSON-LD via `urlCrawlAdapter` (50 SKU cap per store).
3. **Score** — catalog-only mode in `computeAuditFindings()`; checkout lines labelled **NOT MEASURED**.
4. **Persist** — `npm run audit:batch -- --publish` → Render KV `rc:render:audit-batch:latest`.
5. **Rank** — `GET /api/v1/rankings` + Connect UI (vertical + outcome filters).
6. **Compare** — `POST /api/v1/audit/compare` for crawl vs Shopify Admin (A2).

Reproduce:

```bash
npm run audit:batch -- --publish
curl -s https://tooltruth-webmcp.vercel.app/api/v1/rankings | jq '{shopCount,succeeded,avgGtinPct}'
```

---

## Key stats (v4 batch, 148 URLs — 2026-08-31)

| Metric | Value |
|--------|-------|
| Attempted | **148** |
| Crawled | **78** (53%) |
| Blocked | 70 |
| **GTIN% (crawled)** | **0%** all |
| **Catalog score** | **0/24** all |
| Top blocks | no-feed **45** · 403 **14** · timeout **5** |
| Sandbox score (misleading) | 57–83 |

*Earlier N (R1 16/21 → v2 34/58 → v3 52/102) showed the same 0% GTIN wherever crawl succeeded.*

---

## What this means

| Layer | ReadyCounter role |
|-------|-------------------|
| **Discovery** | Don't fight Shopify scanner on llms.txt — win on field batch |
| **Catalog** | Prove public feeds lack GTIN; OAuth comparison shows Admin delta |
| **Checkout** | Presenc abandonment rows (26/24/18/15/11/6) — journey + co-shop proof |
| **Proof** | WebMCP tools — `simulate_agent_journey` breaks at checkout wall |

**One-liner:** *Shopify brings catalog · Render keeps audit · WebMCP proves the path.*

---

## Limitations

- URL crawl ≠ Admin API ≠ live checkout
- 50 SKU sample per store
- Captcha hints ≠ confirmed checkout CAPTCHA
- OAuth paired comparison needs merchant install

---

## Citations

All cited figures in `src/data/sources.ts` and `research.md` (Presenc AI 2026, Shopify Q1 2026, Checkout.com/YouGov).

---

## Artifacts

| Artifact | Path |
|----------|------|
| Batch JSON | `audits/batch-2026-08-31.json` |
| Experiments | `research/experiments/R1–R4.md` |
| Rankings API | `api/v1/rankings.ts` |
| Compare API | `api/v1/audit/compare.ts` |
| Session log | `SESSION-STATUS.md` |
