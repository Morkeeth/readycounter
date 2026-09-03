# Lighthouse for agentic commerce

**One sentence:** ReadyCounter is the lighthouse merchants run when they ship — paste a URL, compare against **148** parsed DTC brands, re-audit after a fix, and publish the receipt. Not Shopify's rails. Agent-side truth.

**Tagline:** Agent commerce. Now reviewable. Proof.

---

## The invisible loss

Agents are already shopping Shopify storefronts. AI-referred sessions grew **8×** year over year; AI-referred orders nearly **13×** ([`shopify_ai_traffic`](./src/data/sources.ts)). Yet **78.6%** of agent carts abandon — against a human benchmark near 70% ([`presenc_abandon`](./src/data/sources.ts)). Merchants do not see those carts. They see theme checks and channel toggles. They do not see what an unauthenticated agent actually retrieves from `products.json`, JSON-LD, or UCP Catalog MCP.

**65%** of US adults trust AI to compare prices; only **14%** trust it to place the order ([`yougov_trust_gap`](./src/data/sources.ts)). The gap is not demand — it is proof that the path works.

---

## What ReadyCounter is

| Layer | What it does |
|-------|----------------|
| **Compare** | You vs **148** curated DTC brands — not a score alone |
| **Width** | Field batch: **78/148** crawled, scrape GTIN **0%**, **81** with UCP MCP, **11** with UCP GTIN where scrape is empty ([`FIELD_RECEIPT`](./src/data/field-companion.ts), live [`GET /api/v1/rankings`](https://readycounter.vercel.app/api/v1/rankings)) |
| **Delta** | Same URL twice → catalog / GTIN / SKU delta receipt (local prior + server persist) |
| **Bill** | Six Presenc abandonment rows priced at published shares — 26/24/18/15/11/6 — sandbox checkout proof via **18** WebMCP tools; `prepare_checkout` never charges |
| **WebMCP** | Proof plane: human and assistant share one cart in one tab ([`WHY-WEBMCP.md`](./WHY-WEBMCP.md)) |

**Not us:** flipping Shopify UCP toggles, Catalog channels, or Agentic setup checklists. We measure **what agents retrieve**, not Admin settings we did not open.

---

## Lighthouse ambition (2027)

Every merchant runs ReadyCounter when they ship anything new:

1. Parse features (crawl + UCP join, not scrape alone)
2. Chase a perfect score on the layers we can measure
3. Go **public** with the signed receipt — CI pin, partner page, Agentic Storefronts checklist

**Success after submit:** Shopify adopts the receipt format · merchants use it in public · they announce their score.

**Public scores (honest):** catalog budget and field rankings today; full journey /100 only where checkout is measured (sandbox demos, OAuth path later). Field crawls stay **never /100** for checkout lines — labelled NOT MEASURED ([`research/RANK-AND-HELP-GAP.md`](./research/RANK-AND-HELP-GAP.md)).

---

## Field receipt (re-derived at object — 2026-08-31)

```bash
curl -s https://readycounter.vercel.app/api/v1/rankings | jq '{shopCount,succeeded,avgGtinPct,ucp}'
```

Expected: `shopCount` **148**, `succeeded` **78**, `avgGtinPct` **0**, `ucp.gtinWhereCrawlZero` **11**.

Earlier batch sizes (34/58, 52/102) are stale — always read the live API.

---

## Gaps we name out loud

| Gap | Status |
|-----|--------|
| E1 OAuth crawl↔Admin GTIN pairs | **0 pairs** — do not claim "Admin holds barcodes agents miss" without E1 |
| Offer schema line on crawl path | Handbook cites **19%** Offer ([`schema_offer_gap`](./src/data/sources.ts)); not a ranked crawl line yet |
| ACP feed / Instant Checkout conformance | Checklist + handbook; no upload validator |
| Live checkout walls on field DTC | NOT MEASURED on URL crawl |

---

## Stranger path (60 seconds)

**Live:** https://readycounter.vercel.app/?view=integrations

1. **Open Connect** — field receipt shows **78/148 · 0% GTIN scrape · 11 UCP gaps**
2. **Paste URL** → Audit → catalog bill + YOU·FIELD·DELTA strip
3. **Scroll rankings** — filter **UCP GTIN · scrape empty** → re-audit same URL → **delta receipt**

Film + Devpost: [`demo/FILM-AND-SUBMIT.md`](./demo/FILM-AND-SUBMIT.md) · [`DEVPOST.md`](./DEVPOST.md)

**Close line:** *Lighthouse for agentic commerce. Not Shopify's rails. Agent-side truth.*
