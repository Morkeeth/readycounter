# ReadyCounter — research citations

Primary sources for every stat in `hack.md` DATA ANCHORS.  
**Date accessed:** 2026-08-30 (UTC).

---

## Shopify: AI traffic 8× YoY; AI orders ~13× (Q1 2026)

| Field | Value |
|-------|-------|
| **Primary source** | [AI-referred shoppers convert better and spend more (2026) — Shopify Enterprise](https://www.shopify.com/enterprise/blog/ai-search-insights) |
| **Alternate primary** | [Shopify Q1 2026 earnings call transcript](https://stockanalysis.com/stocks/shop/transcripts/555081-q1-2026/) (Harley Finkelstein, Shopify President) |
| **Published** | Shopify blog: 2026-05-11; earnings: Q1 2026 |

**Exact quotes (Shopify blog):**

> Referral sessions from AI chatbots—specifically clicks originating from ChatGPT, Perplexity, Google Gemini, Microsoft Copilot, Claude, Grok, and similar tools—**grew more than 8x year-over-year** on Shopify storefronts as of Q1 2026, according to Shopify's Q1 2026 commerce data.

> **AI-referred orders grew nearly 13x year-over-year** over the same period, making it one of the fastest-growing acquisition channels in ecommerce.

**Earnings call (Finkelstein):**

> AI-driven traffic to Shopify stores has grown **8x year-over-year**, while orders from AI-powered searches have increased **nearly 13 x**.

---

## Shopify Catalog: AI searches convert 2× vs scraped data

| Field | Value |
|-------|-------|
| **Primary source** | [Shopify Q1 2026 earnings call transcript](https://stockanalysis.com/stocks/shop/transcripts/555081-q1-2026/) |
| **Corroborating** | [AI-referred shoppers convert better — Shopify Enterprise](https://www.shopify.com/enterprise/blog/ai-search-insights) (Catalog / structured data narrative) |

**Exact quote (earnings call):**

> Traffic from **catalog-powered AI searches converts 2x more** than traffic from general AI searches, where the agent is working from scraped or often outdated information from across the web.

**Note:** Shopify Q2 2026 earnings (Aug 2026) repeats the same 2× claim for Catalog vs scraped data (Finkelstein).

---

## Adobe: AI conversion 38% worse → 42% better (12 months)

| Field | Value |
|-------|-------|
| **Primary source** | [AI traffic grows but retail sites lag in AI search visibility — Adobe Business Blog](https://business.adobe.com/blog/ai-traffic-surge-retail-sites-not-machine-readable) |
| **Report** | Adobe Digital Insights Quarterly AI Traffic Report, Q1 2026 (published 2026-04-16) |
| **Secondary cite** | [Digital Applied analysis of Adobe Q1 2026 data](https://www.digitalapplied.com/blog/ai-traffic-converts-42-percent-better-2026-channel-strategy) (points to Adobe as origin; not a substitute for Adobe) |

**Exact quote (Adobe blog):**

> In March 2026, AI traffic converted **42% better** (a new record high). This is a major reversal from a year ago, where in March 2025, AI traffic converted **38% worse**. Rising consumer trust has played a factor, with Adobe's survey showing that 66% of respondents believe AI tools provide accurate results.

**Scope note:** Adobe compares AI-referred traffic to **non-AI traffic** (paid search, email, affiliate, organic combined)—not Google organic alone.

---

## Presenc AI: agent cart abandon ~78.6%; stale price 26%; CAPTCHA 24%

| Field | Value |
|-------|-------|
| **Primary source** | [Agent Cart Abandonment Statistics 2026 — Presenc AI](https://presenc.ai/research/agent-cart-abandonment-statistics-2026) |
| **Published / updated** | June 2026 |

**Exact quotes:**

> The overall agent abandonment rate, defined as carts created that never convert to orders, is **78.6%** across our panel, higher than the human benchmark of about 70%.

| Cause | Share of abandoned carts |
|-------|--------------------------|
| Stale price or stock data at checkout | **26%** |
| Captcha or verification wall | **24%** |

**Methodology (same page):** "Abandonment metrics are modeled from observed agent sessions and vendor-reported benchmarks." Presenc AI is a vendor research page, not peer-reviewed—cite as modeled industry benchmark.

---

## DigitalApplied: ~81% of product pages lack Product + Offer schema

| Field | Value |
|-------|-------|
| **Primary source** | [Schema Markup Adoption: 5,000-Site Audit and Findings — Digital Applied](https://www.digitalapplied.com/blog/schema-markup-adoption-5k-site-audit-2026) |
| **Published** | 2026-04-26 |

**Exact quote:**

> **73% of ecommerce sites** in the sample emit Product schema — a big number on its surface, but only 41% of those Product schemas pair with an Organization schema, and **only 19% include the Offer object** that Google requires for the price-and-availability rich result.

**Derivation for hack.md "81%":** Among ecommerce sites emitting Product schema, **100% − 19% = 81%** do not include the Offer object required for agent-readable price/availability. ReadyCounter uses "81% lack Product+Offer" as shorthand for this gap—not a standalone headline number in the audit.

**Audit scope:** 5,000 production sites, stratified sample, April 2026; validated via Google Rich Results Test.

---

## Checkout.com / YouGov: 65% trust compare · 14% auto-buy (51pt gap)

| Field | Value |
|-------|-------|
| **Primary source (US retail trust)** | [American trust in AI for retail: Consumer sentiment in 2025 — YouGov](https://yougov.com/en-us/articles/53808-american-trust-in-ai-for-retail-consumer-sentiment-in-2025) |
| **Commission / partner context** | Checkout.com agentic-commerce research program (YouGov fieldwork) |
| **Corroborating (merchant expectation gap)** | [Consumer demand for AI shopping… trust still catching up — Checkout.com Newsroom](https://www.checkout.com/newsroom/consumer-demand-for-ai-shopping-is-forming-fast-but-trust-for-agentic-commerce-is-still-catching-up) |

**Exact quote (YouGov US, key findings):**

> About **65% trust AI to compare prices**, but only **14% trust it to place orders on their behalf**.

**Body text:**

> The most widely trusted function is comparing prices across stores, which **65% of Americans** say they are comfortable with. … only **14%** are comfortable with AI placing orders for them.

**51-point gap:** 65% − 14% = **51 percentage points** (ReadyCounter "trust gap" metric).

**Methodology (YouGov):** 1,287 US adults online, 2025-12-04; weighted; ±3pp MOE.

**UK corroboration (YouGov UK):** [Consumer trust in AI for retail — Britain](https://yougov.com/en-gb/articles/53807-consumer-trust-in-ai-for-retail-remains-low-in-britain-especially-among-older-adults): **66%** compare prices; **11%** place orders.

---

## How ReadyCounter uses these stats

| Product surface | Stat applied |
|-----------------|--------------|
| Merchant readiness checks | Presenc 26% stale / 24% CAPTCHA |
| Readiness cite block | Shopify 2× Catalog; Adobe 38→42% |
| Co-shop / `prepare_checkout` gate | YouGov 65% compare vs 14% buy |
| README / Devpost pitch | Full table above |

Do not hardcode figures in UI without linking here. Re-derive scores from live catalog + merchant flags at runtime.
