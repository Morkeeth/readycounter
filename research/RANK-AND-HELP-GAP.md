# Rank + help gap — is ReadyCounter holistic?

**Date:** 2026-08-31 · **Question:** Do we **rank and help** across the full agentic commerce journey, or only a slice?  
**Inputs:** `ONBOARDING.md`, `HOLISTIC-EXPANSION.md`, `DEEP-DIVE-UNDERSTANDING.md`, `HANDBOOK.md`, `E3b-ucp-vs-crawl.md`, `field-companion.ts`, `RankingsPanel`, `FieldReviewPanel`, `DEVPOST.md` + primary sources below.

---

## 1. Verdict

**Partial — strong agent-side catalog rank, thin journey rank, help stops at advice.** ReadyCounter holistically owns *what an unauthenticated agent retrieves from a public storefront* (feed reach → GTIN/schema catalog 0/24 → field ranking + ≤3 handbook steps). It does **not** yet rank or prove the rest of the agentic journey (live checkout walls, payments, ACP eligibility/policy, Admin↔public delta) nor close the merchant loop past “do this week” into verified re-measure. Calling it a full “rank + help” agentic commerce product oversells layers the deep dive already marks NOT MEASURED or evidence-thin.

---

## 2. Rank coverage matrix

| Journey slice | Rank today? | What we actually score | Gap |
|---------------|-------------|------------------------|-----|
| **Discovery feed** (`/products.json` / homepage JSON-LD) | **Yes** | Crawl outcome + catalog budget (~24); rankings by vertical + failure taxonomy | Curated 148, not random Shopify; 50-SKU cap |
| **Identifiers (GTIN/MPN)** | **Yes (public)** | `gtinPct` → `page_structure`; field 78/78 @ 0% | No Admin GTIN (E1=0 pairs); MPN / `identifier_exists` not scored |
| **Schema (Product + Offer)** | **Partial** | Offers/gtin in scraped structure; handbook cites Digital Applied | No Rich Results–style PDP Offer audit at scale |
| **UCP / Catalog MCP** | **Yes (joined)** | E3 census in rankings: UCP GTIN col + filter; E3b gap count on header; compare API | Live re-probe on every request (snapshot); Admin still E1 |
| **ACP feed / Instant Checkout** | **No (checklist only)** | Issue #8 + handbook copy | No feed validator, no `is_eligible_*` measurement |
| **Checkout walls** | **Sandbox yes / field no** | Presenc-weighted flags on demos; crawls **NOT MEASURED** | Homepage captcha hints ≠ walls (R3) |
| **Payments (agent-completable)** | **Sandbox only** | 11-pt line on declared methods | No live PSP / ACP checkout session test |
| **Policy / eligibility** | **Advice only** | Checklist: Privacy + ToS URLs | No HTTP check that policy URLs resolve / feed-link |

**Locked rank claim (keep):** wherever this crawler opened a public DTC catalog, GTIN was absent → **0/24**.  
**Unsafe rank claim:** “full agent readiness out of 100” for live DTC (checkout lines unknown).

---

## 3. Help coverage matrix

Merchant journey from `HOLISTIC-EXPANSION.md` §7:

| Step | Shipped? | Evidence | Missing |
|------|----------|----------|---------|
| **Diagnose** | **Yes** | URL audit → catalog bill; sandbox full bill | Live checkout / payment diagnose |
| **Prioritize** | **Yes (thin)** | `reviewAgainstField` → ≤3 flags; vertical advice in handbook | Auto-branch: low-crawl → feed/UCP first vs high-crawl → barcodes (logic in docs, weak in UI) |
| **Fix steps** | **Yes (static)** | `PRESSING_ISSUES[].doThisWeek` + `FieldReviewPanel` | No store-specific deep links (Admin barcode CSV, Agentic channel toggles, feed row diffs) |
| **Re-measure** | **Partial** | Re-run URL audit manually; rankings batch ops | No “fix applied → delta receipt”; OAuth pair re-score unused in field |
| **Prove** | **Sandbox / WebMCP only** | Journey + `prepare_checkout` (never charges) | No consented live proof; co-shop ≠ merchant fix proof |

Help is a **handbook projector**, not a remediation engine. Checklist items (guest, Agentic, UCP, policy) are not auto-verified after the crawl.

---

## 4. Peer comparison (complement, don’t compete)

| Peer | Owns | ReadyCounter owns | Overlap risk |
|------|------|-------------------|--------------|
| **CatalogScan** ([signals](https://catalogscan.com/signals/), [products.json](https://catalogscan.com/signals/shopify-feed/)) | Multi-signal Admin/storefront checklist (~15–18), GTIN ≥90% scoring, headless feed death (~40%) | Field **distribution** of agent-side emptiness + Presenc-priced bill | Competing on “scan my Shopify” loses; cite CatalogScan for feed death |
| **Presenc** ([abandonment causes](https://presenc.ai/research/agent-cart-abandonment-statistics-2026)) | Funnel abandon economics; monitoring / agent-payable readiness | Weight table → itemised tests; sandbox journeys | Do not claim we measured their 78.6% / 26–24–18… on field DTC |
| **Shopify Admin Agentic** ([requirements](https://help.shopify.com/en/manual/online-sales-channels/agentic-storefronts/requirements), [how it works](https://www.shopify.com/blog/how-agentic-commerce-works)) | Catalog syndication + channel toggles + policies | Public agent retrieval vs Admin/Catalog path | We don’t flip channels or certify Catalog eligibility |
| **ACP feed validators** ([OpenAI products](https://developers.openai.com/commerce/specs/file-upload/products), [Stripe feed](https://docs.stripe.com/agentic-commerce/product-feed), [checkout spec](https://developers.openai.com/commerce/specs/checkout)) | Row schema, `gtin`/`mpn`, `is_eligible_search`→`checkout`, privacy/ToS if checkout | Narrative + checklist pointing at those gates | No upload lint / Instant Checkout conformance |

**Frame:** scanners answer Admin completeness; protocols answer channel rails; **ReadyCounter answers agent-side public truth + field companion.**

---

## 5. Research findings that should change product

1. **UCP can hold GTINs when scrape is empty (E3b).** Rankings that show crawl GTIN alone **understate** agent-reachable identity on UCP stores — compare must be first-class in UI, not API-only. Artifact: `research/experiments/E3b-ucp-vs-crawl.md`.
2. **ACP treats identifiers + eligibility as gates, not SEO.** OpenAI: provide valid `gtin` or `mpn` when `identifier_exists` is yes/omitted; `is_eligible_checkout` requires `is_eligible_search=true`; privacy/ToS URLs required when checkout eligible — [products feed](https://developers.openai.com/commerce/specs/file-upload/products). Stripe: `gtin` recommended; **`mpn` required if GTIN missing** — [product feed](https://docs.stripe.com/agentic-commerce/product-feed). Help copy that only says “fill barcode” without MPN/`identifier_exists` is incomplete.
3. **Checkout is the cliff we don’t measure.** Presenc: 78.6% agent abandonment; causes 26/24/18/15/11/6; cart→checkout drop 38% — [abandonment stats](https://presenc.ai/research/agent-cart-abandonment-statistics-2026). Separate CAPTCHA-as-%-of-failed-checkouts figures live on other Presenc pages — **don’t collapse slices in copy** (deep dive §3).
4. **Offer schema is a discovery lever we barely instrument.** Digital Applied: Product on **73%** of ecommerce, Offer on **19%** — [5k audit](https://www.digitalapplied.com/blog/schema-markup-adoption-5k-site-audit-2026). Crawl Offer completeness should become an explicit rank line, not only handbook citation.
5. **Shopify Agentic Storefronts amplify Admin, not public scrape.** Eligible Catalog + policies + channel settings — [Shopify agentic overview](https://www.shopify.com/blog/how-agentic-commerce-works). Until E1 OAuth pairs, film/Devpost must say “public feeds empty,” not “merchants forgot barcodes in Admin.”
6. **CatalogScan floor signal remains the discovery story.** Public `products.json` death on ~40% headless DTC — [shopify-feed signal](https://catalogscan.com/signals/shopify-feed/). Our failure chips should stay CatalogScan-aligned (already the expansion intent).

---

## 6. Minimal gaps before claiming “rank and help full holistic”

Falsifiable, ordered:

1. **Rankings show UCP GTIN beside crawl GTIN** for the 148 — **DONE** (2026-08-31): `GET /api/v1/rankings` joins `src/data/ucp-census.json`; RankingsPanel columns + filter **UCP GTIN · scrape empty**.
2. **E1 ≥3 OAuth crawl↔Admin pairs** — done when: R2 table with Admin vs public GTIN; gap narrative either locked or killed.
3. **Help loop: re-audit after claimed fix** — done when: same URL twice yields delta receipt (gtinPct / catalog / UCP) in UI, not only fresh crawl.
4. **Offer/schema line measured on crawl path** — done when: % Product nodes with Offer+price+availability on sampled PDPs or feed; not handbook-only.
5. **ACP eligibility smoke (non-upload)** — done when: store-level checks for live privacy/ToS URLs + documented eligibility flags (or honest “not measurable without partner feed”).
6. **One consented live checkout probe class (or permanent label)** — done when: either N≥5 measured walls *or* product never shows full /100 for field crawls (already mostly true — enforce in Devpost/film).
7. **MPN / identifier_exists in help + optional score** — done when: companion issue #1 and review flags mention OpenAI/Stripe identifier rules, not barcode-only.

Until 1–3 + 6: **do not** claim full holistic rank+help.

---

## 7. What NOT to claim

- “Full agent readiness” / holistic rank across discovery→pay for **live** DTC.
- “We measure checkout abandonment” (Presenc weights ≠ our field tests).
- “Admin holds barcodes; agents don’t” without E1 pairs.
- “WebMCP powers the score / GTIN finding” (proof plane only).
- Parity with CatalogScan’s multi-signal Admin checklist or ACP feed certification.
- That sandbox 57–100 scores generalize to colourpop-class crawls.
- That public 0% GTIN proves Instant Checkout / Catalog rejection for stores on private Shopify Catalog rails (unmeasured).

---

*Related:* `DEEP-DIVE-UNDERSTANDING.md` · `HOLISTIC-EXPANSION.md` §7–9 · `HANDBOOK.md` · `field-companion.ts`
