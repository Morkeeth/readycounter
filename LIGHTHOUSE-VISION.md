# Lighthouse for agentic commerce

**One sentence:** ReadyCounter is the receipt merchants run before every ship — compare your storefront to **148** parsed DTC brands, paste any URL, re-audit for delta, and prove the agent path in one tab with WebMCP.

---

## The problem — invisible customer loss

Agents are already shopping. Shopify reports AI-referred sessions to storefronts grew **8×** year over year and AI-referred orders nearly **13×** ([`shopify_ai_traffic`](./src/data/sources.ts)). Yet **78.6%** of agent carts abandon — against a human benchmark near 70% ([`presenc_abandon`](./src/data/sources.ts)). Merchants do not see the leak: the shopper never becomes a customer, the cart never becomes a support ticket.

**65%** of US adults trust AI to compare prices; only **14%** trust it to place the order ([`yougov_trust_gap`](./src/data/sources.ts)). The gap is not demand — it is whether the catalog an agent retrieves can survive to checkout.

Our field batch makes the pre-checkout leak visible: **148** curated DTC URLs, **78** crawled, **0%** GTIN on every public feed that opened (`GET /api/v1/rankings`, 2026-08-31). Sandbox scores on those same stores would read 57–83/100 — a vanity number with no field context.

---

## The product — compare · width · delta · WebMCP

| Capability | What a stranger gets | Proof |
|------------|----------------------|-------|
| **Compare** | YOU · FIELD · DELTA strip after URL audit | `FieldCompareStrip` + percentile join vs **148**-store batch |
| **Width** | Rankings by vertical, crawl outcome, UCP GTIN column | **78/148** crawled · **81/148** UCP MCP · **11** with UCP GTIN where scrape is **0%** |
| **Delta** | Same URL twice → catalog / GTIN / SKU receipt | `AuditDeltaReceipt` — honest catalog budget only, never /100 for field crawls |
| **WebMCP** | **18** tools; human + agent co-shop one cart | `prepare_checkout` never charges; dev console works without `chrome://flags` |

**Not Shopify rails.** We do not flip Agentic channel toggles or certify Catalog eligibility. We measure **what an unauthenticated agent retrieves** from the public web — `products.json`, JSON-LD, UCP Catalog MCP — and price checkout friction from published research (Presenc **26/24/18/15/11/6**, all rows in [`sources.ts`](./src/data/sources.ts)).

**Ease:** paste URL · no signup · no JSON upload · live at https://tooltruth-webmcp.vercel.app

---

## The ambition — lighthouse on every deploy

**2027:** Every merchant runs ReadyCounter when they ship anything new. Parse features. Chase a perfect score. **Go public with the receipt** — Lighthouse, not lecture.

**Success after submit (honest):**
- Shopify adopts the receipt as the default agent-readiness artifact beside UCP/ACP
- Merchants pin scores in CI and Agentic Storefronts checklists
- Public scoreboards name who is agent-ready — with cited math, not vibes

**Gaps we name, not hide** ([`research/RANK-AND-HELP-GAP.md`](./research/RANK-AND-HELP-GAP.md)):
- E1 OAuth pairs (**0** today) — cannot claim “Admin holds barcodes agents miss” without paired tables
- Checkout walls on live DTC: **NOT MEASURED** on crawl; Presenc weights apply in sandbox + journey only
- ACP feed validation and Offer-schema rank line: handbook + checklist, not yet measured at scale

---

## Close line (film · Devpost · partners)

> **Lighthouse for agentic commerce. Not Shopify's rails. Agent-side truth.**

Film pack: [`demo/FILM-AND-SUBMIT.md`](./demo/FILM-AND-SUBMIT.md) · ambition locked: [`demo/AMBITION.md`](./demo/AMBITION.md) · partner brief: [`SHOPIFY-PARTNER-BRIEF.md`](./SHOPIFY-PARTNER-BRIEF.md)
