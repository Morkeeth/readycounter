# Holistic expansion — ReadyCounter

**Date:** 2026-08-31  
**Audience:** Oscar (decision + film) · agents (build queue)  
**Grounded in:** `research/DEEP-DIVE-UNDERSTANDING.md` · field batch v4 (148/78/0%) · `GOAL-LONG-RUN.md`

This is not a feature list. It is the **full rundown** of what “expand ReadyCounter” means when you refuse to confuse layers.

---

## 0. North star (unchanged)

Own the **measurement layer** for agent commerce — cited economics, field rankings, co-shop proof — not another discoverability checklist.

**Expansion test:** every new surface must either (a) tighten a measured claim, (b) close an open unknown from the deep dive, or (c) make the measured claim intelligible to a merchant or judge in &lt;30s. Anything else is scope creep.

---

## 1. Positioning — three sentences

1. **Human:** ReadyCounter prints what an *agent* can actually retrieve from your storefront — as an itemised bill and a field companion.
2. **Agent:** The same handbook and review logic are WebMCP tools (`get_field_companion`, `review_against_field`) and REST (`/api/v1/companion`).
3. **Market:** Shopify Catalog / scanners answer Admin completeness; we answer **agent-side public truth**. The product *is* that gap.

**Tagline options (Devpost-safe):**

- Current: *The counter prints the score — agent readiness, itemised*
- Field-forward: *What agents retrieve — measured against the field*
- Gap-forward: *Admin can look fine. Agents still see 0% GTIN.*

Pick one story per film. Do not narrate all three.

---

## 2. Epistemic map — expand honesty with the product

| Layer | Status | Expansion move |
|-------|--------|----------------|
| **Public GTIN / catalog 0/24** | Locked (78/78) | Keep as headline; refresh N live from rankings |
| **Crawl reach by vertical** | Locked pattern | UI: failure-reason filter + advice branch |
| **Admin ≫ public** | Hypothesis + infra | **Must expand:** OAuth pairs (E1) before gap copy hardens |
| **Checkout walls** | Sandbox + Presenc | Label NOT MEASURED on crawls; optional consented probe later |
| **UCP/ACP adoption** | Probe only | Census on 148 (E3) |
| **WebMCP** | Proof layer | Film as proof, never as score engine |

**Holistic rule:** Expand *coverage of unknowns* as hard as expand *URL count*. More stores without R2 is vanity N.

---

## 3. Product expansion (human surfaces)

### 3.1 Field companion (shipped — deepen)

| Gap | Expand to |
|-----|-----------|
| Hardcoded receipt (148/78) | Live stats from `GET /api/v1/rankings` |
| Issues are static | After URL audit → auto `review_against_field` pinned under bill |
| Guidelines are checkboxes | Link each item → issue + “open audit” CTA |
| Research lane cites files | One-line field receipt per R# + link to rankings filtered |

### 3.2 Rankings (shipped — deepen)

| Gap | Expand to |
|-----|-----------|
| Vertical filter only | **Failure taxonomy** chips: crawled / no-feed / 403 / timeout |
| Flat table | Per-filter headline: “beauty: 20/26 crawled · 0% GTIN” |
| Blocked rows opaque | Collapse reason to CatalogScan-aligned labels (headless?, WAF?, empty) |

### 3.3 Audit → bill → companion (the loop)

```
URL → crawl score (0/24) → review_against_field → 3 do-this-week steps
                ↓
         optional OAuth compare (Admin delta)
                ↓
         optional journey (sandbox) / WebMCP prepare_checkout
```

**Expansion priority:** close this loop in UI before adding stores.

### 3.4 Sandbox stores

Keep as **teaching instruments** (paradise / chaos / walls). Do not expand sandbox count for film — six is enough. Expand *labels* so judges never confuse sandbox 100 with field 0/24.

---

## 4. Agent expansion (WebMCP + API)

| Surface | Now | Expand |
|---------|-----|--------|
| Tools | 18 (incl. companion) | `get_field_rankings` (vertical + failure filter); keep Admin sync out of WebMCP without session |
| REST | companion, rankings, compare, audit | Document as **Agent Science API**: discover → review → compare |
| Co-shop | Proof of shared cart | One film beat only; not the expansion spine |
| Manifest | Honest count | Badge “18 tools · handbook included” |

**Holistic agent story:** An assistant should be able to (1) pull pressing issues, (2) audit a URL via your API, (3) review against field, (4) explain the bill — without reading `research/HANDBOOK.md` from disk.

---

## 5. Research expansion (the science program)

Ordered by what the deep dive says is unfinished:

| # | Work | Why holistic |
|---|------|----------------|
| **E1** | 3–10 OAuth crawl↔Admin pairs | Locks or kills “Admin holds barcodes” narrative |
| **E3** | UCP/MCP census on curated 148 | Separates scrape death from protocol life |
| **E6** | One vertical autopsy (pet or home) | Explains 10–37% crawl rates causally |
| **E4** | Barcode depth (page 1 vs later) | Bounds 50-SKU cap artifact |
| **E7** | Random `.myshopify.com` n=30 | Bounds curated-list bias |
| **E5** | Captcha hint precision | Stops overselling homepage strings |

**Publish cadence:** Update `FINDINGS-D3.md` → v4 stats; keep R-docs as provenance; one `FIELD-RECEIPT.md` as single source for N/GTIN%.

**External dialogue:** CatalogScan / Presenc / Digital Applied stay *cited empirics*, not competitors to dunk on — R5 complementarity is the frame.

---

## 6. Narrative expansion (film · Devpost · stranger)

### 6.1 One film spine (90s)

| t | Beat | Show | Say (honest) |
|---|------|------|----------------|
| 0:00 | Bill | ember-oak tape | Published abandonment weights, itemised |
| 0:15 | Companion | Issue #1 GTIN | Field: 78 stores crawled, 0% public GTIN |
| 0:35 | Audit | colourpop | Catalog 0/24 — what agents retrieve |
| 0:50 | Review | do-this-week | Same handbook agents get via WebMCP |
| 1:05 | Rankings | vertical filter | Reach differs; GTIN doesn’t |
| 1:20 | Proof | WebMCP / journey | Tools prove the path; they don’t invent the score |

Update `DEMO.md` stats from 34/58 → **78/148**.

### 6.2 Devpost expansion (copy layers)

1. **Problem:** Agent carts abandon; merchants can’t see agent-side failure.
2. **Method:** Presenc-weighted bill + public crawl field study.
3. **Finding:** 78/78 crawled DTC → 0% GTIN; ~half unreachable.
4. **Product:** Companion + rankings + compare + WebMCP proof.
5. **Honest limit:** Checkout NOT MEASURED on crawls; Admin gap pending OAuth pairs.

### 6.3 Stranger test expansion

Incognito checklist: companion intelligible? audit→review clear? rankings not confused with sandbox? No insider URL knowledge.

---

## 7. Merchant journey (holistic, not only Connect)

```
Awareness (field receipt / Devpost)
    → Diagnose (URL audit)
    → Interpret (companion review)
    → Prioritize (vertical + failure reason)
    → Fix (barcode / products.json / guest / UCP)
    → Re-measure (re-audit + optional OAuth)
    → Prove (journey / WebMCP co-shop on fixed sandbox)
```

Expand docs (`HANDBOOK.md`) so each step has **one** primary CTA in product. Today A–C are strong; D–F are thin.

---

## 8. Ops · security · trust (guard the expansion)

| Concern | Holistic move |
|---------|----------------|
| SSRF on audit URL | https-only + private IP block before more crawl volume |
| Rate limits | KV-backed before marketing “audit any URL” |
| OAuth tokens | Encrypt at rest; never to client; state/HMAC |
| Citation drift | Companion live from rankings; handbook cites FIELD-RECEIPT |
| Verify | Keep `npm run verify` as constitution — no uncited Presenc remixes |

Trust is part of the product: a measurement layer that lies once dies.

---

## 9. What *not* to expand

- More sandbox SKUs / novelty stores for film padding  
- Competing with CatalogScan on Admin completeness  
- Claiming WebMCP “powers” GTIN findings  
- Random protocol encyclopedias without a census  
- Magic-link / multi-tenant SaaS before E1 + SSRF  
- Purple redesigns — Counter identity stays  

---

## 10. Holistic expansion roadmap (slices)

Objective: *ReadyCounter is the intelligible measurement layer for agent-side commerce — field-proven, companion-guided, honesty-guarded.*

1. **Live field receipt + audit→review loop** — done when: companion header matches rankings API; post-audit shows ≤3 handbook steps · size: M · risk: UX clarity · **SHIPPED 2026-08-31**
2. **Rankings failure-reason filter** — done when: chips for crawled/no-feed/403; filter stats line · size: S · risk: low · **SHIPPED 2026-08-31**
3. **DEMO/FILM/FINDINGS sync to v4 (148/78/0%)** — done when: no 34/58 left in demo path · size: S · **SHIPPED 2026-08-31**
4. **E1 OAuth pairs (3+ stores)** — done when: R2 table with Admin vs crawl GTIN · size: L · risk: needs merchant OAuth  
5. **SSRF + KV rate limit on audit** — done when: private IPs rejected; verify case · size: M · risk: edge redirects  
6. **E3 UCP census script on curated list** — done when: % with `/.well-known/ucp` or `/api/ucp/mcp` · size: M  
7. **Devpost + stranger pass** — done when: Oscar films + submits; stranger notes in `audits/` · size: L · risk: human schedule  

**Step 1 is the highest leverage product expansion.** Step 4 is the highest leverage *epistemic* expansion — do not skip it if the gap story is the Devpost climax.

---

## 11. One-page scoreboard (keep updated)

| Metric | v4 now | Target after holistic slice 1–3 |
|--------|--------|----------------------------------|
| Curated URLs | 148 | 148 (hold) |
| Crawled | 78 | live-displayed |
| Public GTIN | 0% | 0% (expect hold) |
| Companion ↔ audit | separate | **looped** |
| Rankings filters | vertical | vertical + failure |
| OAuth pairs (R2) | 0 | ≥3 |
| UCP census | probe only | % of 148 |
| Film stats | stale 34/58 risk | **78/148** |

---

## 12. Bottom line

**Technically** you already have crawl, score, rankings, companion, WebMCP, compare API.

**Holistically** expansion means:

1. Make the **loop** (measure → interpret → act) one experience.  
2. Close the **unknowns** that your narrative leans on (Admin gap, UCP).  
3. Keep **epistemic discipline** so judges trust the 0% finding.  
4. Align **film/Devpost/docs** to v4 field truth.  
5. Harden **security** so open crawl stays defensible.

That is the full rundown. Build slice 1 next unless Oscar prioritizes E1 for the gap climax.

---

*Related:* `DEEP-DIVE-UNDERSTANDING.md` · `HANDBOOK.md` · `GOAL-LONG-RUN.md` · `WHY-WEBMCP.md`
