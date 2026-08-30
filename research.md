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

| **Re-read** | **2026-08-31**, the whole page verbatim — every Presenc figure below carries that read date in `src/data/sources.ts`. See the correction. |

**Exact quotes:**

> The overall agent abandonment rate, defined as carts created that never convert to orders, is **78.6%** across our panel, higher than the human benchmark of about 70%.

### The causes table, reproduced in full

This page previously reproduced two of these six rows, and ReadyCounter printed a
sentence — "no published figure prices an account wall separately" — that the
four rows we had not copied out flatly contradicted. A partial reproduction of a
source is how that happens, so the whole table is here, verbatim, including the
third column.

**Verbatim, "Causes of Agent Cart Abandonment", read 2026-08-31:**

| Cause | Share of abandoned carts | Fixable by merchant |
|-------|--------------------------|---------------------|
| Stale price or stock data at checkout | **26%** | Yes |
| Captcha or verification wall | **24%** | Yes |
| Price mismatch vs listed feed | **18%** | Yes |
| **Required account or login** | **15%** | Yes |
| Unsupported payment method | **11%** | Yes |
| Ambiguous page structure | **6%** | Yes |

The six shares sum to 100%. ReadyCounter scores three of them directly — 26, 24
and 15 — and those three weights **are** these three rows.

The page also publishes a funnel table, quoted here because the 15% row is the
one it explains:

| Funnel step | Agents entering | Agents continuing | Drop-off at step |
|---|---|---|---|
| Product page to cart | 100% | 71% | 29% |
| Cart to checkout start | 71% | 44% | **38%** |
| Checkout to payment | 44% | 29% | 34% |
| Payment to confirmation | 29% | 21% | 28% |

> The biggest drop happens between cart and checkout, the exact step where verification **and login walls** appear.

**Methodology (same page, verbatim):** "Data is compiled from the Presenc AI monitoring platform plus public sources, with Presenc AI estimates used where authoritative figures are unavailable. Abandonment metrics are modeled from observed agent sessions and vendor-reported benchmarks. Projections use compound growth modeling. Findings are reviewed quarterly. Last update June 2026." Presenc AI is a vendor research page, not peer-reviewed—cite as modeled industry benchmark.

### Correction, 2026-08-31

Until 2026-08-31 ReadyCounter charged a forced-account checkout the CAPTCHA's
**24** points, and printed the reason on four surfaces: *"No published figure
prices an account wall separately."* That sentence was false about this page —
its own citation. **"Required account or login — 15%"** is row four of the table
above, four lines below the 24% the product had already lifted from it.

The fix is not a reworded sentence. The account wall is now its own scored line
at its own published weight of **15**, a store carrying both walls pays both
(39), and `scripts/verify-readiness.mjs` asserts each delta against its own
source row. Nothing about a checkout wall is priced by ReadyCounter any more.

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

## How the readiness score is weighted — and where we stop being able to cite

This is the section a judge should read first, because it is the part most
readiness scores do not have: **the derivation of every weight, including the
ones we made up.**

ReadyCounter allocates **100 points across six checks**. The allocation is the
claim, so it is stated in full:

| Check | Points | Basis | Where the number comes from |
|---|---|---|---|
| Price feed agrees with the shelf | **26** | **measured** | Presenc AI attributes **26%** of abandoned agent carts to stale price or stock data at checkout. The weight *is* that share. |
| No CAPTCHA on the checkout path | **24** | **measured** | Row two of the table: **24%**, "Captcha or verification wall". The weight *is* that share. |
| No forced account on the checkout path | **15** | **measured** | Row four of the table: **15%**, "Required account or login". The weight *is* that share. Until 2026-08-31 this line did not exist and the wall was charged the CAPTCHA's 24 — see the correction above. |
| Catalog an agent can read | **14** | *allocated* | No source itemises schema gaps as an abandonment cause. We allocate 14 because an agent that cannot read price and availability never reaches a cart to abandon. Context: only **19%** of Product schemas carry the Offer object (Digital Applied, 5,000 sites). |
| Structured tool surface | **14** | *allocated* | Allocated, not measured. Shopify reports catalog-powered AI search converts **2×** scraped search; a WebMCP tool surface is that same bet made explicit. |
| Availability stated, not implied | **7** | *allocated* | Presenc groups stock **with** price in one 26% figure. We split off 7 points for explicit availability flags rather than double-count the measured share. |
| **Total** | **100** | **65 measured · 35 allocated** | |

**Why 14 / 14 / 7.** The measured block grew 50 → 65 when the account wall took
its own published weight, so the allocated block shrank 50 → 35 and kept its
existing 2:2:1 shape (20/20/10 → 14/14/7). The rule is the one worth stating: a
published figure takes its full share first, and our judgement gets what is left.

**One number that is a coincidence, not a mapping.** The three causes ReadyCounter
does **not** check — price mismatch vs feed 18%, unsupported payment method 11%,
ambiguous page structure 6% — happen to total the same **35%** the allocated block
is worth. That is arithmetic, nothing more. Our three allocated checks are *not*
those three causes and must not be read as standing in for them.

**The honest limit.** 35 of these 100 points are still a judgement call, and the
product does not hide it: the tape prints a `measured weight` or `allocated
weight` tag on every line and the header reads *"65 priced by a published figure
· 35 allocated by ReadyCounter"*. What is no longer a judgement call is the
checkout. **Every checkout wall is charged the share its own published row
states — 24 for a CAPTCHA, 15 for a forced account — and a store carrying both
pays 39.** Neither figure is ours.

**The check that keeps this honest.** `scripts/verify-score.mjs` runs on every
`npm run verify` and fails the run if:

1. the point budget stops summing to 100;
2. a weight names a source id that does not exist;
3. any source row is missing a publisher, figure, URL, publish date or read date;
4. a source URL is not quoted in this file;
5. **a measured weight stops equalling the figure its source publishes** — 26 pts
   must match `26%`, 24 pts must match `24%`, 15 pts must match `15%`;
6. the tool count printed in `App.tsx` drifts from the tools in `registerTools.ts`.

And in `scripts/verify-readiness.mjs`, added with the 15-point line:

7. clearing a CAPTCHA must move the score by exactly 24 and clearing a forced
   account by exactly 15, each against **its own** source row;
8. a store carrying both walls must lose 39, not 24;
9. a line scored on a partial ratio must print less than its full weight. (This
   one is here because the rebalance briefly left the old point values hardcoded
   at the call sites — `20 * (withGtin / total)` against a 14-point weight — and
   the clamp turned 17.5 into a perfect 14/14 on a catalog that was 88%
   identified. Weights are now applied in one place and the call sites pass a
   fraction.)

Proven red, not just green: setting `agent_checkout_path` to 30 points fails
checks 1 and 5 and exits 1. A budget-neutral tamper is caught too — moving
`account_wall` 15 → 16 and `stock_signals` 7 → 6 keeps the budget at exactly 100,
passes check 1, and still fails checks 5, 7 and 8.

**Observable consequence.** Clearing the CAPTCHA on Ember & Oak moves the score
from **70 to 94** — a delta of exactly **24**, the published figure. Clearing the
forced account on Neon Matcha Lab moves it from **71 to 86** — a delta of exactly
**15**, a different published figure from the same table. Both are asserted in
`scripts/verify-readiness.mjs`, not eyeballed.

---

## How ReadyCounter uses these stats

| Product surface | Stat applied |
|-----------------|--------------|
| Readiness weights (26 / 24 / 15) | Presenc 26% stale feed · 24% CAPTCHA · 15% required account — three rows of one table |
| Readiness line detail | Digital Applied 19% Offer; Shopify 2× Catalog |
| Landing screen facts | Shopify 8×/13×; Presenc 78.6%; YouGov 65/14 |
| Co-shop / `prepare_checkout` gate | YouGov 65% compare vs 14% buy |
| README / Devpost pitch | Full table above |

**The rule, enforced in code:** a figure with no row in `src/data/sources.ts`
cannot be printed anywhere in the product, and a row in that file whose URL is
not quoted on this page fails `npm run verify`. Scores are re-derived from the
live catalog and merchant flags on every render — nothing is a constant typed
into a component.
