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

| Check | Points | Row it is charged from | What the check actually is |
|---|---|---|---|
| What the agent was shown survives to checkout | **26** | "Stale price or stock data at checkout — **26%**" | Every SKU the catalog surfaces is run through the real order path (`src/lib/orderMath.ts`, the same functions checkout calls). A SKU survives only if the store still accepts it *and* bills exactly the price the catalog record quoted. The source's one sentence about this row: *"When the price or availability the agent saw differs from checkout, the agent halts rather than guessing."* Both halves are asserted. **Stated limit:** in the two shipped fixtures the price half cannot fail — the catalog record and the order path read the same field — so the half that discriminates here is availability. The price half is not decoration: tamper `chargeForLine` to bill `feedPrice` and both stores drop 23/26 → 20/26 with `verify-stores` red. |
| No CAPTCHA on the checkout path | **24** | "Captcha or verification wall — **24%**" | The merchant config declares whether a CAPTCHA stands on the checkout path. All of it or none of it. |
| Price feed agrees with the shelf | **18** | "Price mismatch vs listed feed — **18%**" | Per SKU, the feed price equals the shelf price. **This line used to carry the 26.** It detected a feed mismatch and charged it the stale-data row's price — billing one cause at another cause's rate while calling the weight published. Corrected 2026-08-31: it takes the row that names the defect it detects, and never adds the 26 on top. |
| No forced account on the checkout path | **15** | "Required account or login — **15%**" | The merchant config declares whether an account is forced before payment. Until 2026-08-31 this line did not exist and the wall was charged the CAPTCHA's 24 — see the correction above. |
| A payment method an agent can complete | **11** | "Unsupported payment method — **11%**" | All-or-nothing: at least one method the store accepts must complete a prepared agent order with no step only a human at the device can take. A stored credential passes; a per-transaction 3-D Secure step-up, a device biometric, a redirect to another site's login and a manual invoice approval do not. **The classification is ours** — the source prices the cause and never says which methods qualify — so it is printed on the line and in `src/types/commerce.ts`. |
| Product records an agent can read | **6** | "Ambiguous page structure — **6%**" | We read back the JSON-LD the page actually emits (`emittedProductRecords` walks the output of `catalogJsonLd`, the same function `ShopView` writes into `<script type="application/ld+json">`) and require each record to carry `name`, `sku`, a resolvable `gtin13`, and an `Offer` with `price`, `priceCurrency` and `availability`. **The field list is ours** and it is the whole definition — the source gives this row no prose anywhere on the page. A store-local SKU resolves to nothing for an agent that has never seen the store; a GTIN does. Context: only **19%** of Product schemas carry an Offer object at all (Digital Applied, 5,000 sites). |
| *Structured tools the score is measured through* | *0* | *no published row* | Reported, never charged. 16 typed tools against a floor of 6. A tool surface is not a cause of cart abandonment on anybody's table — it is the instrument the six lines above are read through — so it is printed at zero rather than given a weight we invented. It used to be an allocated 14. |
| **Total** | **100** | **six rows, six shares** | **100 measured · 0 allocated** |

**The claim this licenses, and the one it does not.** Every *weight* is
published. Every *test* is ours. The Presenc table names six causes and defines
none of them — the page was fetched raw again on 2026-08-31 and the only prose
about any row is one FAQ sentence about the 26 — so the tape marks each line
`published weight · our stated test` rather than letting an all-measured bill
imply the tests are published too. Claiming more than the source carries is the
mistake that charged an account wall the CAPTCHA's 24 for a day.

**What changed on 2026-08-31, wave 4.** Three lines used to carry weights we
allocated ourselves — catalog schema 14, tool surface 14, availability 7, 35 in
total. Availability folded into the 26 row, where the source itself puts stock
(*"stale price **or stock** data at checkout"*). Catalog schema folded into the 6
row, rebuilt as an emitted-markup test. The tool surface became a reported line
worth zero. The allocated block is now **0**.

**On the arithmetic we did not assert.** Before this build, 35 points were
allocated by us, and the three then-unscored rows — 18 + 11 + 6 — also totalled
35%. Those two numbers had nothing to do with one another: the 35 was a
remainder, left over because the measured block was 65. Writing that they
"lined up" would have been two correct numbers placed side by side to claim a
relation nobody had checked. Earlier waves of this file did write a version of
it, then withdrew it, then withdrew the withdrawal because its member set was
also wrong (the 18% row *was* being detected, just billed at the 26's price).
The build settles it: the three rows are scored at their own published shares,
there is no remainder left to explain, and no relation is claimed.

**The fixture rule.** Both demo stores are written to EXERCISE the checks, never
to land a score. Ember & Oak carries a CAPTCHA and a card on file; Neon Matcha
carries a forced account, three payment methods that all need a human, and six
SKUs with no GTIN. The totals — 70 and 65, read from `npm run verify` on
2026-08-31 — are whatever falls out. Ember & Oak scored 70 before this rebuild
too, out of an entirely different composition of lines; that is a coincidence and
is recorded as one.

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

Proven red, not just green, all run on 2026-08-31:

| Tamper | What goes red |
|---|---|
| `agent_checkout_path` 24 → 30 | `verify-score` checks 1 and 5, exit 1 |
| Budget-neutral: `payment_method` 11 → 12 **and** `page_structure` 6 → 5, still summing to exactly 100 | budget check still passes; **five** assertions fail across `verify-score` and `verify-readiness` |
| `chargeForLine` bills `feedPrice` instead of the price the agent was shown | the 26-point probe prints 20/26 on both stores while the verifier recomputes 23 — `verify-stores` exit 1 |
| `gtin13` quietly dropped from the machine-legibility field list | both stores print a perfect 6/6 they did not earn — four assertions red |
| A charged line stops being a published weight (6 pts with no row) | `every charged line is a published weight — nothing allocated` — 94 measured · 6 allocated, exit 1 |

**Observable consequence.** Clearing the CAPTCHA on Ember & Oak moves the score
from **70 to 94** — a delta of exactly **24**, the published figure. Clearing the
forced account on Neon Matcha Lab moves it from **65 to 80** — exactly **15**.
Giving Neon one method a prepared agent order can complete on moves it from
**65 to 76** — exactly **11**. Three different rows of one table. Precisely what
is asserted, because the distinction matters: `scripts/verify-readiness.mjs`
pins each of the three **deltas** (24, 15, 11) against its own source row on the
default-store fixture, and `verify-stores.mjs` recomputes every line of both
stores outside the product. The two Neon *totals* (80 and 76) were read from a
run on 2026-08-31; no assertion pins those two numbers, only the weights that
produce them. Saying "each asserted separately" without that split would be the
same shape as the defects this file records.

---

## How ReadyCounter uses these stats

| Product surface | Stat applied |
|-----------------|--------------|
| Readiness weights (26 / 24 / 18 / 15 / 11 / 6) | All six rows of Presenc's causes table, each line charged its own published share |
| Readiness line detail | Digital Applied 19% Offer; Shopify 2× Catalog |
| Landing screen facts | Shopify 8×/13×; Presenc 78.6%; YouGov 65/14 |
| Co-shop / `prepare_checkout` gate | YouGov 65% compare vs 14% buy |
| README / Devpost pitch | Full table above |

**The rule, enforced in code:** a figure the product *cites* — a share, a
multiple, a survey result — cannot be printed without a row in
`src/data/sources.ts`, and a row in that file whose URL is not quoted on this
page fails `npm run verify`. Figures the product *measures* off the store (SKU
counts, GTIN coverage, points earned) are computed live and cite nothing; they
are not claims about the world, and saying "every figure" without that split was
itself an overclaim, corrected 2026-08-31. Scores are re-derived from the
live catalog and merchant flags on every render — nothing is a constant typed
into a component.
