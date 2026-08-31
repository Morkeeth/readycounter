# Agent Commerce Handbook — pressing issues for merchants (2026)

**ReadyCounter field edition · 2026-08-31**  
What agents need to buy from you — and what silently fails today.

Sources: Shopify / Google UCP, OpenAI + Stripe ACP, CatalogScan, Presenc, Digital Applied, plus ReadyCounter’s own DTC crawl (**78/148 stores**, **0% GTIN** on every public feed that opened). Full citations: `research/HANDBOOK-SOURCES-2026-08-31.md`.

---

## The future of commerce in one paragraph

Shopping is moving from **pages humans click** to **catalogs agents resolve**. Shopify and Google’s **Universal Commerce Protocol (UCP)**, OpenAI/Stripe’s **Agentic Commerce Protocol (ACP)**, payment **AP2** mandates, and **MCP** tool transports are the rails. Merchants who treat this as “another SEO checkbox” lose discovery; merchants who treat identifiers, open feeds, and bot policy as **checkout infrastructure** sell inside ChatGPT, Google AI Mode, Gemini, and Copilot. The storefront still matters for brand — the **machine-readable catalog** is what agents actually shop.

---

## Field receipt (ReadyCounter)

| Signal | Our measurement |
|--------|-----------------|
| Stores attempted | **148** (v4 curated) |
| Public feed crawled | **78 (53%)** |
| GTIN in public `products.json` | **0% on 78/78 crawled** |
| Catalog legibility score | **0/24** whenever crawl succeeded |
| Top block reasons | no feed/JSON-LD **30** · HTTP 403 **13** · timeout **4** |
| Worst crawl verticals | pet **17%**, home **25%**, outdoor **29%** |
| Best crawl verticals | beauty **76%**, food **75%**, fun **71%** |

**Conclusion:** Vertical predicts whether an agent can *see* you — not whether your barcodes are filled. Everywhere we could read, GTIN was empty.

---

## The ten most pressing issues

Ranked by “will this stop an agent order this quarter?”

### 1. Empty variant barcodes (GTIN / MPN)

**Why it bites:** Instant Checkout and AI matching keys are identifiers. OpenAI/Stripe feeds expect GTIN or MPN; Shopify stores them on **variant `barcode`**, not product title.

**What fails:** Agent cannot match your SKU to a knowledge graph; feed rows reject or rank last.

**Do this week:** Export products → fill Variant Barcode → re-import → `curl` `/products.json` and check `variants[].barcode`. Aim ≥90% filled.

**Evidence:** OpenAI product feed · Stripe agentic feed · ReadyCounter R1 (0% public GTIN).

---

### 2. Headless cutover killed `/products.json`

**Why it bites:** CatalogScan’s 100-store scan: **~40% of headless DTC** lost the open feed on Hydrogen/Next cutover. Humans still see PDPs; agents get 404.

**What fails:** Bulk discovery never starts — UCP/ACP cannot compensate if nothing ingestible exists.

**Do this week:** `curl -sI https://YOURSTORE.com/products.json` → must be JSON with a `products` array. Proxy Storefront API into the legacy shape if headless.

**Evidence:** CatalogScan shopify-feed signal · ReadyCounter 49% block rate.

---

### 3. CAPTCHA / bot walls at checkout

**Why it bites:** Presenc: CAPTCHA = **31%** of failed agent checkouts; captcha-gated stores complete ~**29%** vs ~**88%** agent-ready.

**What fails:** Agent abandons permanently after a hard challenge.

**Do this week:** Allow-list known agent operators at the WAF; prefer UCP/ACP in-chat checkout so agents never drive the DOM; reserve CAPTCHA for fraud, not catalog browsers.

**Evidence:** Presenc 2026 checkout benchmarks · ReadyCounter R3 (homepage “captcha?” strings are noisy — measure checkout, not HTML).

---

### 4. Product schema without Offer / price

**Why it bites:** Digital Applied 5k audit: **73%** of ecommerce sites emit Product JSON-LD, only **19%** include Offer.

**What fails:** Agents and AI search cannot quote price/availability from structured data.

**Do this week:** Rich Results Test on 5 PDPs; require nested Offer with price, currency, schema.org availability URL, plus gtin/sku.

**Evidence:** Digital Applied 2026 schema audit · Google Product structured data docs.

---

### 5. Protocol fragmentation (UCP · ACP · AP2 · MCP)

**Why it bites:** Different coalitions own different checkout paths. MCP is *transport*; UCP/ACP are *commerce language*; AP2 is *payment proof*. Implementing “MCP” alone is not agentic commerce.

**What fails:** Agent hits legacy `/api/mcp` after UCP rename; merchant live on ChatGPT but invisible in Google AI Mode (or reverse).

**Do this week:** Shopify → enable Agentic Storefronts + channel toggles. Multi-platform → ACP feed **and** UCP profile where applicable. Ask your PSP which AP2/ACP tokens they support.

**Evidence:** Shopify/Google UCP news · OpenAI ACP · AP2 spec · Shopify `/api/ucp/mcp`.

---

### 6. Syndicated Catalog with incomplete data

**Why it bites:** Shopify Catalog + Agentic Storefronts amplify whatever is in Admin — including empty barcodes — into ChatGPT, Copilot, Gemini.

**What fails:** Invisible or unmatchable SKUs at AI scale.

**Do this week:** Complete barcode, type, images, variants; add Knowledge Base returns/shipping FAQs; monitor AI-attributed orders.

**Evidence:** Shopify Agentic Storefronts / Catalog announcements.

---

### 7. Wrong or gated UCP Catalog MCP

**Why it bites:** Storefront Catalog MCP lives at `/api/ucp/mcp` and expects agent profiles. Wrong endpoint or stripped CDN routes look like “store offline.”

**What fails:** Silent negotiation failure; empty tool list.

**Do this week:** Hit `/.well-known/ucp` and `/api/ucp/mcp`; keep Hydrogen standard MCP proxies enabled.

**Evidence:** Shopify Storefront Catalog MCP docs · ReadyCounter UCP probe / compare API.

---

### 8. Instant Checkout policy / eligibility gaps

**Why it bites:** ACP requires search eligibility before checkout eligibility, plus privacy/ToS URLs.

**What fails:** Discoverable products that never become buyable in-chat.

**Do this week:** Publish stable policy URLs; flip search then checkout flags; align feed links with live PDP 200s.

**Evidence:** OpenAI products upload spec · Stripe feed.

---

### 9. Forced account walls

**Why it bites:** Presenc: **22%** of agent checkout failures.

**Do this week:** Keep guest checkout; push account creation post-purchase; prefer protocol checkout.

---

### 10. Price / availability drift

**Why it bites:** Presenc: **17%** of failures — agent quotes feed price, checkout disagrees.

**Do this week:** One inventory source of truth; refresh volatile feeds ≤15–60 min; same flags in `/products.json` and Catalog MCP.

---

## Vertical map — where agents get stuck

From ReadyCounter batch v3 (filter live on Connect → DTC rankings):

| Vertical | Crawl success | GTIN when crawled | Merchant takeaway |
|----------|---------------|-------------------|-------------------|
| Beauty / food / fun | High (~70–76%) | Still **0%** | Fix barcodes first — agents can already reach you |
| Apparel | Medium (~40%) | 0% | Mix of open Liquid + headless blocks |
| Home / outdoor / pet | Low (17–29%) | 0% | Restore `/products.json` or UCP before optimizing GTIN |

---

## 30-minute merchant checklist

1. [ ] `GET /products.json?limit=1` returns products  
2. [ ] Spot-check 20 variants for non-empty `barcode`  
3. [ ] One PDP: Product + Offer JSON-LD validates  
4. [ ] Guest checkout on; CAPTCHA not on cart for known-good bots  
5. [ ] Agentic Storefronts / Catalog channels reviewed  
6. [ ] `/.well-known/ucp` and `/api/ucp/mcp` respond  
7. [ ] Privacy + ToS URLs live and linked in feeds  
8. [ ] Run ReadyCounter URL audit or CatalogScan for a receipt  

Film / demo: `https://tooltruth-webmcp.vercel.app/?film=1&view=integrations`

---

## Protocol cheat sheet

| Layer | Spec | Merchant surface |
|-------|------|------------------|
| Journey contract | **UCP** | `/.well-known/ucp`, Agentic Storefronts |
| In-chat checkout | **ACP** | Product feed + Instant Checkout eligibility |
| Payment mandates | **AP2** | Via payment processor |
| Tool transport | **MCP** | `/api/ucp/mcp` — not a substitute for UCP/ACP |

---

## What ReadyCounter is for

- **Merchant-side scanners** (Admin, CatalogScan) answer: “Is our catalog complete in Shopify?”  
- **ReadyCounter** answers: “What does an *agent* actually retrieve from the public storefront?”  

Those numbers diverge. Our handbook exists because that gap is the default state of DTC in 2026 — not an edge case.

---

*Expand sources: `research/HANDBOOK-SOURCES-2026-08-31.md` · Experiments R1–R6 · `npm run audit:analyze`

**In product:** Connect → Field companion · WebMCP `get_field_companion` / `review_against_field` · `GET /api/v1/companion`*
