# Merchant handbook sources — pressing issues in agentic / AI commerce (2026)

**Date:** 2026-08-31  
**Purpose:** Primary-source brief for a merchant handbook on agentic commerce readiness.  
**Companion field data:** `research/FINDINGS-D3.md`, `research/experiments/R1-gtin-gap.md`, `research/RESEARCH-AGENT-2026-08-31.md`

---

## Top 8 pressing issues (ranked by urgency)

| Rank | Issue | Why urgent now |
|------|--------|----------------|
| 1 | **GTIN / identifier gap blocks Instant Checkout** | OpenAI + Stripe feed rules treat identifiers as matching keys; public DTC feeds show ~0% GTIN (ReadyCounter R1/D3). |
| 2 | **Headless cutovers kill `/products.json`** | CatalogScan: ~40% of headless DTC lost the open feed; agents lose bulk ingest before UCP/ACP help. |
| 3 | **CAPTCHA / bot walls abort agent checkout** | Presenc: CAPTCHA = 31% of failed agent checkouts; captcha-gated tier completes only ~29%. |
| 4 | **Schema.org Product without Offer / identifiers** | Digital Applied 5k audit: 73% of ecommerce emit Product, but only **19%** include Offer — agents can't price/match. |
| 5 | **Protocol fragmentation (UCP vs ACP vs AP2 vs MCP)** | Merchants face multiple rails (Google/Shopify UCP, OpenAI/Stripe ACP, AP2 payment mandates, MCP transport) with different onboarding. |
| 6 | **Agentic Storefronts / Catalog data quality lag** | Shopify syndicates once via Catalog, but empty barcodes and weak metafields still mean invisible or unmatchable SKUs. |
| 7 | **UCP / Storefront Catalog MCP discovery friction** | Official MCP at `/api/ucp/mcp` requires agent profiles + capability negotiation; agents probing wrong endpoints fail silently. |
| 8 | **Checkout policy / eligibility gaps for ACP** | Instant Checkout needs search+checkout flags, seller ToS/privacy URLs, stable `item_id` — incomplete policy pages kill eligibility. |

---

## Pressing issues (detailed)

### 1. GTIN / product-identifier gap (ACP Instant Checkout)

**Why it matters for merchants**  
ChatGPT Instant Checkout and Stripe agentic product feeds use GTIN (or MPN when GTIN is absent) to match and rank products. Blank barcodes mean weak discovery and failed checkout eligibility even when the store is “on” Agentic Storefronts.

**What agents actually fail on**  
Unresolved product identity across retailers; inability to enrich from GS1/review databases; feed validation rejecting rows when `identifier_exists` expects a GTIN/MPN; lookup by barcode returning empty.

**Evidence / sources**  
- OpenAI product feed: provide valid `gtin` or `mpn` when `identifier_exists` is omitted/`yes` — https://developers.openai.com/commerce/specs/file-upload/products  
- Stripe agentic product feed: `gtin` Recommended; `mpn` **Required if GTIN is missing** — https://docs.stripe.com/agentic-commerce/product-feed  
- Shopify variant `barcode` (ISBN/UPC/GTIN) — https://shopify.dev/docs/api/storefront/2026-04/objects/ProductVariant  
- ReadyCounter field crawl: **0% GTIN** on public feeds across crawled DTC sample — `research/FINDINGS-D3.md`, `research/experiments/R1-gtin-gap.md`

**Practical fix (merchant action)**  
1. Audit every sellable variant’s **Barcode** field (Admin → Product → Inventory / variant barcode).  
2. Prefer GS1 GTIN-12/13/14; if none exists, set manufacturer MPN and (for OpenAI feeds) only set `identifier_exists=no` when truly identifier-less.  
3. Keep `item_id` / SKU stable over time (OpenAI: changing `item_id` = new product).  
4. Re-publish to Shopify Catalog / Agentic Storefronts after backfill; verify a sample via feed diagnostics.

---

### 2. Headless storefronts killing public `products.json`

**Why it matters for merchants**  
`/products.json` is still the fastest bulk-ingest surface many agents use. Moving to Hydrogen/Next.js without proxying that path makes PDPs look fine to humans while agents see 404/HTML — discovery dies before checkout protocols matter.

**What agents actually fail on**  
`GET /products.json` → 404, password HTML, empty `products: []`, or non-JSON; pagination broken on custom proxies; robots.txt `Disallow: /products.json`.

**Evidence / sources**  
- CatalogScan 100-store launch scan: **~40% of headless DTC** accidentally killed the feed — https://catalogscan.com/signals/shopify-feed/  
- ReadyCounter v3 batch: ~49% crawl blocked (403 / no-feed / timeout) on curated DTC list — `research/RESEARCH-AGENT-2026-08-31.md`  
- CatalogScan ChatGPT Shopping notes (headless examples) — https://catalogscan.com/shopify-chatgpt-shopping/

**Practical fix (merchant action)**  
1. `curl -sI https://YOURSTORE.com/products.json?limit=1` — expect JSON `products` array.  
2. On Hydrogen/Next: add a route that proxies Storefront API and returns the legacy shape (CatalogScan documents `products[.]json.tsx` / App Router patterns).  
3. Do **not** disallow `/products.json` in robots.txt; rate-limit at CDN instead.  
4. Prefer also exposing UCP Catalog MCP (`/api/ucp/mcp`) so agents have a standards path as scrape surfaces shrink.

---

### 3. CAPTCHA / bot walls blocking agent checkout

**Why it matters for merchants**  
Anti-bot stacks built for scrapers now challenge legitimate shopping agents. Merchants “win” security and lose agent-mediated orders; abandonment after a CAPTCHA is usually permanent for the agent.

**What agents actually fail on**  
Turnstile / Akamai / HUMAN challenges at cart or checkout; forced login walls; sessions that never produce an order confirmation the agent can parse.

**Evidence / sources**  
- Presenc Agent Checkout Success Rate Benchmarks 2026: CAPTCHA/bot = **31%** of failed checkouts; captcha-gated merchants **28.7%** completion vs **88.4%** agent-ready — https://presenc.ai/research/agent-checkout-success-rate-benchmarks-2026  
- Presenc market readiness: anti-bot as largest merchant-side gap — https://presenc.ai/research/agentic-commerce-market-readiness-2026  
- Presenc blog (policy framing) — https://presenc.ai/blog/bot-protection-is-blocking-your-best-customer  
- ReadyCounter R3: homepage captcha *hints* are noisy (~87% HTML strings) vs measured checkout walls — `research/experiments/R3-captcha-hints.md`

**Practical fix (merchant action)**  
1. Allow-list verified agent operator IP ranges / bot categories (OpenAI, Google, Anthropic, etc.) at WAF.  
2. Prefer lightweight JS challenges over hard CAPTCHA for unknown agent-like traffic; reserve CAPTCHA for high-risk fraud.  
3. Prefer protocol checkout (UCP / ACP Instant Checkout / Shopify Agentic Storefronts) so purchase doesn’t require DOM automation.  
4. Log agent-identified sessions separately and measure challenge rate on those sessions.

---

### 4. Schema.org Product / Offer / GTIN gaps

**Why it matters for merchants**  
Agents and AI search still scrape PDPs. Product JSON-LD without nested Offer (price, currency, availability) or without identifiers fails rich results and weakens AI citation/matching — even if Admin data is complete.

**What agents actually fail on**  
Missing `offers`; bare `"InStock"` instead of `https://schema.org/InStock`; no `gtin*` / `sku` / `mpn`; price mismatches between HTML and JSON-LD.

**Evidence / sources**  
- Digital Applied 5,000-site audit (2026): ecommerce Product adoption high (**73%**), but only **19%** include the Offer object Google needs for price/availability rich results — https://www.digitalapplied.com/blog/schema-markup-adoption-5k-site-audit-2026  
- Digital Applied merchant prep (GTIN + Offer checklist) — https://www.digitalapplied.com/blog/product-data-ai-shopping-merchant-prep-guide  
- Schema.org Product type — https://schema.org/Product  
- Google Search Central Product structured data (canonical requirements) — https://developers.google.com/search/docs/appearance/structured-data/product

**Practical fix (merchant action)**  
1. Validate a sample of PDPs in Google Rich Results Test.  
2. Ensure every PDP emits `Product` + nested `Offer` with `price`, `priceCurrency`, and full availability URL.  
3. Emit `gtin13`/`gtin12` (or `mpn`+`sku`) from the same source of truth as Admin barcodes.  
4. Fix theme/app overrides that strip JSON-LD on mobile or headless renders.

---

### 5. Protocol fragmentation: UCP vs ACP vs AP2 vs MCP

**Why it matters for merchants**  
2026 commerce is multi-rail. Google/Shopify push **UCP** for full journey + MCP binding; OpenAI/Stripe push **ACP** for in-chat Instant Checkout; **AP2** covers payment authorization mandates; **MCP** is the tool transport, not a commerce language. Choosing one surface leaves money on the others.

**What agents actually fail on**  
Calling legacy `/api/mcp` tools after UCP rename; missing `meta.ucp-agent.profile`; expecting ACP Shared Payment Tokens on a UCP-only merchant; merchants implementing “MCP” without publishing `/.well-known/ucp` or ACP feeds.

**Evidence / sources**  
- Google UCP announcement (Jan 11, 2026) — compatible with A2A, AP2, MCP — https://blog.google/products/ads-commerce/agentic-commerce-ai-tools-protocol-retailers-platforms/  
- Shopify UCP + Agentic Storefronts / Catalog — https://www.shopify.com/news/ai-commerce-at-scale · https://www.shopify.com/ucp  
- UCP spec overview — https://ucp.dev/draft/specification/overview/  
- UCP Catalog MCP binding — https://ucp.dev/2026-04-08/specification/catalog/mcp/  
- OpenAI Agentic Commerce product feed / Instant Checkout — https://developers.openai.com/commerce/specs/spec  
- Stripe Agentic Commerce product feed — https://docs.stripe.com/agentic-commerce/product-feed  
- AP2 spec (payment mandates; complementary to UCP) — https://ap2-protocol.org/ap2/specification/index.md  
- Shopify Storefront Catalog MCP (`/api/ucp/mcp`) — https://shopify.dev/docs/agents/catalog/storefront-catalog  
- Changelog: Storefront Catalog MCP implements UCP (breaking; old tools until Jun 15, 2026) — https://shopify.dev/changelog/storefront-catalog-mcp-now-implements-ucp

**Practical fix (merchant action)**  
1. **Shopify merchants:** enable Agentic Storefronts; toggle ChatGPT / Copilot / Google channels in Admin; keep Catalog fields complete.  
2. **Non-Shopify / multi-channel:** publish ACP-compliant feed (Stripe/OpenAI path) **and** UCP profile at `/.well-known/ucp` where applicable.  
3. Treat layers separately: **MCP** = how tools are called; **UCP/ACP** = commerce semantics; **AP2** = proof of payment authorization.  
4. Ask payment/processor partners which mandate (AP2) and token (ACP SPT) paths they already accept — don’t rebuild all three from scratch.

---

### 6. Agentic Storefronts / Shopify Catalog enrichment lag

**Why it matters for merchants**  
Shopify’s pitch is “set up once, sell in ChatGPT, Copilot, Google AI Mode, Gemini.” Catalog LLMs enrich and cluster products — but they cannot invent accurate GTINs, policies, or variant structure merchants never entered. Syndication amplifies bad data at AI scale.

**What agents actually fail on**  
Wrong category clustering; missing variant options; stale inventory/price relative to storefront; agents answering policy questions incorrectly without Knowledge Base content.

**Evidence / sources**  
- Shopify Agentic Storefronts (Winter ’26) — https://www.shopify.com/news/winter-26-edition-agentic-storefronts  
- Shopify agentic commerce at scale (UCP + Catalog Agentic plan) — https://www.shopify.com/news/ai-commerce-at-scale  
- Shopify blog: Agentic Commerce how-to (2026) — https://www.shopify.com/blog/agentic-commerce  
- Storefront Catalog MCP tools — https://shopify.dev/docs/agents/catalog/storefront-catalog

**Practical fix (merchant action)**  
1. Complete Catalog-facing fields: title, description, images, type/vendor/collections/tags, **barcode**, structured variants.  
2. Add Knowledge Base policies/FAQs for returns, shipping, subscriptions.  
3. Toggle channels deliberately; monitor AI-attributed orders in Admin.  
4. For non-Shopify brands: evaluate Shopify **Agentic plan** to list into Catalog without migrating the storefront.

---

### 7. UCP / WebMCP endpoint & agent-profile friction

**Why it matters for merchants**  
Even when Catalog MCP is live on every Shopify domain, agents that omit UCP agent profiles or hit deprecated tool names get incomplete tool lists or negotiation failures — merchants look “offline” to that agent.

**What agents actually fail on**  
Requests to `/api/ucp/mcp` without `meta.ucp-agent.profile`; using pre-UCP tool names after the Apr 2026 breaking change; missing `/.well-known/ucp` on custom stacks; Hydrogen stacks that disable standard MCP proxy routes.

**Evidence / sources**  
- Storefront Catalog MCP requires agent profile on every call — https://shopify.dev/docs/agents/catalog/storefront-catalog  
- Agent profiles & UCP negotiation — https://shopify.dev/docs/agents/profiles  
- UCP MCP catalog binding — https://ucp.dev/2026-04-08/specification/catalog/mcp/  
- Digital Applied: Hydrogen MCP proxy guidance — https://www.digitalapplied.com/blog/shopify-hydrogen-2026-1-4-mcp-proxy-setup-guide

**Practical fix (merchant action)**  
1. Confirm `https://{store}/.well-known/ucp` and `https://{store}/api/ucp/mcp` respond.  
2. Headless: keep Hydrogen `proxyStandardRoutes` / `/api/mcp` proxy enabled; don’t strip agent routes at CDN.  
3. For custom agents you operate: host a valid platform profile URL and send it on every tool call.  
4. Watch Shopify changelog for UCP tool deprecations (old catalog tools sunset June 15, 2026).

---

### 8. ACP Instant Checkout eligibility & policy URL gaps

**Why it matters for merchants**  
Identifier quality alone is not enough: OpenAI requires `is_eligible_search` before `is_eligible_checkout`, plus seller privacy/ToS URLs when checkout is enabled. Missing policy pages keep products discoverable-only or rejected.

**What agents actually fail on**  
Checkout flag ignored because search is false; missing `seller_privacy_policy` / `seller_tos`; unstable URLs; marketing copy in feed `description` causing rejection (secondary feed hygiene).

**Evidence / sources**  
- OpenAI products upload spec (`is_eligible_checkout` requires `is_eligible_search`; privacy/ToS conditional) — https://developers.openai.com/commerce/specs/file-upload/products  
- OpenAI product feed spec overview — https://developers.openai.com/commerce/specs/spec  
- Stripe feed: shipping, availability, brand, identifiers — https://docs.stripe.com/agentic-commerce/product-feed

**Practical fix (merchant action)**  
1. Publish stable HTTPS policy URLs (privacy, terms, returns) and map them into the ACP/Stripe feed.  
2. Set search eligibility on the SKUs you want sold in-chat, then enable checkout.  
3. Align feed `link` / `url` with live PDP 200s (no auth walls).  
4. Shopify path: ensure Admin policies + Agentic Storefronts channel toggles mirror the same truth as any direct ACP feed.

---

### 9. Forced account / login walls (adjacent checkout issue)

**Why it matters for merchants**  
Second-largest agent checkout failure mode after CAPTCHA (Presenc: **22%** of failures). Guest checkout is an agent readiness feature.

**What agents actually fail on**  
Mandatory account creation mid-funnel; OAuth/social login that agents cannot complete; session cookies that don’t transfer into agent sandboxes.

**Evidence / sources**  
- https://presenc.ai/research/agent-checkout-success-rate-benchmarks-2026  

**Practical fix (merchant action)**  
Keep guest checkout; push account creation post-purchase; prefer in-chat ACP/UCP checkout that never hits the account wall.

---

### 10. Price / availability mismatch at checkout

**Why it matters for merchants**  
Presenc: **17%** of agent checkout failures. Agents that quote stale feed prices lose trust and abandon.

**What agents actually fail on**  
Feed vs PDP vs checkout total divergence; `available: true` in JSON while inventory is zero; sale windows not reflected in schema/`sale_price`.

**Evidence / sources**  
- https://presenc.ai/research/agent-checkout-success-rate-benchmarks-2026  
- Stripe feed availability/price rules — https://docs.stripe.com/agentic-commerce/product-feed  

**Practical fix (merchant action)**  
Single inventory source of truth; refresh feeds ≤15–60 minutes for volatile SKUs; ensure `/products.json` and Catalog MCP read live inventory flags.

---

## Protocol map (merchant cheat sheet)

| Layer | Spec | Owners / surfaces | Merchant asks |
|-------|------|-------------------|---------------|
| Discovery + cart + order lifecycle | **UCP** | Google, Shopify + 20+ | `/.well-known/ucp`, Agentic Storefronts, Merchant Center |
| In-chat Instant Checkout | **ACP** | OpenAI, Stripe | Product feed + checkout config + policy URLs |
| Payment authorization proof | **AP2** | Google-initiated; UCP-compatible | Processor support for mandates |
| Tool transport | **MCP** | Anthropic-origin; used by UCP bindings | Don’t confuse with commerce semantics |

---

## Additional curated Shopify DTC brand URLs (audit list candidates)

Prefer brands widely known to run on Shopify (or Shopify-adjacent DTC). **Exclude overlaps** with `audits/curated-dtc.json` v3 where possible. Grouped by vertical (≥30 total).

### Beauty (8)
- https://www.rhode.com  
- https://www.glowrecipe.com  
- https://www.summerfridays.com  
- https://www.soldejaneiro.com  
- https://www.theordinary.com  
- https://www.iliabeauty.com  
- https://www.meritbeauty.com  
- https://www.jonesroadbeauty.com  

### Apparel (8)
- https://vuori.com  
- https://girlfriend.com  
- https://www.onequince.com  
- https://knix.com  
- https://www.cupshe.com  
- https://www.tracksmith.com  
- https://www.rhone.com  
- https://www.puravida.com  

### Home (6)
- https://fromourplace.com  
- https://www.carawayhome.com  
- https://www.ruggable.com  
- https://www.cozyearth.com  
- https://www.eightsleep.com  
- https://buffy.co  

### Food (5)
- https://www.chamberlaincoffee.com  
- https://mudwtr.com  
- https://www.foursigmatic.com  
- https://www.deathwishcoffee.com  
- https://www.olipop.com *(note: Drink Olipop already in curated as drinkolipop.com — confirm canonical)*  

### Wellness (4)
- https://drinkag1.com  
- https://www.livemomentous.com  
- https://www.careof.com  
- https://www.levelshealth.com  

### Pet (4)
- https://www.ollie.com  
- https://www.nomnomnow.com  
- https://www.spotandtango.com  
- https://www.tryfi.com  

### Outdoor (4)
- https://www.outdoorresearch.com  
- https://www.topodesigns.com  
- https://www.mysteryranch.com  
- https://www.keenfootwear.com  

### Kids (4)
- https://kytebaby.com  
- https://www.littlesleepies.com  
- https://www.teacollection.com  
- https://monicaandandy.com  

### Accessories (5)
- https://www.cuyana.com  
- https://www.dagnedover.com  
- https://baggu.com  
- https://www.monos.com  
- https://www.awaytravel.com *(also tagged headless-suspect in curated v3)*  

**Count:** 48 URLs listed (use 30+ net-new after de-dupe against `audits/curated-dtc.json`).

---

## Source index (primary-first)

| Topic | URL |
|-------|-----|
| Shopify UCP news | https://www.shopify.com/news/ai-commerce-at-scale |
| Shopify UCP landing | https://www.shopify.com/ucp |
| Shopify Agentic Storefronts | https://www.shopify.com/news/winter-26-edition-agentic-storefronts |
| Shopify Storefront Catalog MCP | https://shopify.dev/docs/agents/catalog/storefront-catalog |
| Shopify agent profiles | https://shopify.dev/docs/agents/profiles |
| Google UCP announcement | https://blog.google/products/ads-commerce/agentic-commerce-ai-tools-protocol-retailers-platforms/ |
| Google Developers UCP under the hood | https://developers.googleblog.com/under-the-hood-universal-commerce-protocol-ucp/ |
| UCP specification | https://ucp.dev/draft/specification/overview/ |
| UCP Catalog MCP | https://ucp.dev/2026-04-08/specification/catalog/mcp/ |
| OpenAI product feed (file upload) | https://developers.openai.com/commerce/specs/file-upload/products |
| OpenAI product feed spec | https://developers.openai.com/commerce/specs/spec |
| Stripe agentic product feed | https://docs.stripe.com/agentic-commerce/product-feed |
| AP2 specification | https://ap2-protocol.org/ap2/specification/index.md |
| Digital Applied 5k schema audit | https://www.digitalapplied.com/blog/schema-markup-adoption-5k-site-audit-2026 |
| CatalogScan products.json | https://catalogscan.com/signals/shopify-feed/ |
| Presenc checkout benchmarks | https://presenc.ai/research/agent-checkout-success-rate-benchmarks-2026 |
| Schema.org Product | https://schema.org/Product |

---

## Method notes

- Prefer first-party docs (Shopify, Google, OpenAI, Stripe, UCP.dev, AP2) over secondary explainers.  
- CatalogScan / Digital Applied / Presenc are **audit/vendor research**, not standards bodies — cite as empirical market evidence.  
- ReadyCounter D3/R1/R3 are **first-party field measurements** for this repo’s merchant handbook narrative.  
- Today’s date context for this memo: **2026-08-31**.
