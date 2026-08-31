# Deep-dive understanding — ReadyCounter / tooltruth-webmcp

**For:** Oscar · **Date:** 2026-08-31 · **Sources:** `research/HANDBOOK.md`, `FINDINGS-D3.md`, `RESEARCH-AGENT-2026-08-31.md`, R1–R6, `audits/analysis-latest.json`, `src/lib/readiness.ts`, `audit-findings.ts`, `src/server/url-audit.ts`, `src/data/field-companion.ts`, `WHY-WEBMCP.md`, `DEMO.md`

---

## 1. What this product actually is

ReadyCounter is an **agent-side commerce readiness instrument**: it prices six published agent-cart-abandonment causes (Presenc), measures what an unauthenticated client can pull from a public storefront (`/products.json` or homepage JSON-LD), and optionally proves a checkout path via sandbox flags / WebMCP tools. It is **not** a Shopify Admin catalog scanner, not Instant Checkout itself, and not a claim that WebMCP “makes” the score. The durable asset is the **gap narrative** — merchants may hold barcodes in Admin while agents reading the open web get empty identifiers — plus a field companion (`src/data/field-companion.ts`) that turns that into ranked merchant actions.

---

## 2. The thesis — and what would falsify it

**Thesis (careful):** Autonomous buyers resolve catalogs, not pages. On curated DTC Shopify storefronts, **public agent-discoverable feeds systematically lack GTIN/barcode**, so catalog legibility collapses wherever crawl succeeds; **vertical mainly predicts whether crawl succeeds at all**, not barcode quality. Merchant-side scanners and agent-side crawl therefore diverge; ReadyCounter’s job is the agent-side receipt.

**Falsifiers:**

| Claim | Would be false if… |
|-------|---------------------|
| Public feeds lack GTIN | A non-trivial share of crawled stores show `variants[].barcode` / JSON-LD gtin ≥ ~50% under the same scraper (`url-audit.ts`) |
| Vertical → reach, not GTIN | Crawl rates converge across verticals *or* some verticals show high public GTIN while others stay zero |
| Admin ≫ public (R2) | Paired OAuth compares show Admin GTIN ≈ public GTIN |
| Crawl ≠ checkout walls (R3) | Homepage captcha strings predict live checkout blocks at useful precision |
| Complementary to scanners (R5) | CatalogScan/Admin health and ReadyCounter catalog scores move together on the same URLs |

R2 and R5 are **method-complete, evidence-thin** (OAuth paired runs and scanner API still pending). Treat those halves as hypotheses with infrastructure, not field facts.

---

## 3. What we measured vs what we infer

| Layer | Measured | Inferred / borrowed |
|-------|----------|---------------------|
| Public catalog fields | `products.json` / JSON-LD ≤50 SKUs; GTIN from `barcode` or schema gtin* (`url-audit.ts`) | That empty public barcode ⇒ empty Admin barcode (explicitly *not* claimed; R2 open) |
| Crawl reach | HTTP status / empty feed / timeout taxonomy (`analysis-latest.json`) | CatalogScan’s “~40% headless killed feed” as causal explanation for our blocks |
| Catalog score | `scrapedCatalogLegibility` → `page_structure` (+ feed_price_match budget) (`audit-findings.ts`) | Full 100-pt “readiness” of a live merchant |
| Checkout walls | HTML keyword hints only on crawl; sandbox config flags on demos | Presenc abandonment shares; homepage hint ⇒ checkout CAPTCHA |
| Journey | `simulate_agent_journey` on imports / demo stores (R4) | Live WAF / real payment / real guest checkout |
| Protocol surface | UCP endpoint probe exists (R5) | UCP/ACP *adoption* rates in the wild |

Epistemic rule already in code: crawls mark checkout lines **NOT MEASURED** (`audit-findings.ts` `unknownLine`). Sandbox scores 57–100 that assume declared CAPTCHA/account/payment flags **must not** be quoted as field readiness for crawled DTC.

**Internal tension:** Presenc weights in `readiness.ts` are 26/24/18/15/11/6 (abandonment *causes* table). Field companion / handbook sometimes cite different Presenc shares (e.g. CAPTCHA **31%** of failed checkouts, account **22%**). Same vendor, different slices — do not collapse them in copy.

---

## 4. Anatomy of a score

### Full bill (sandbox / OAuth import) — `readiness.ts`

100 points = six Presenc rows; **tests are ours**, weights are published:

| pts | id | Test (ours) |
|-----|-----|-------------|
| 26 | `checkout_freshness` | Order-path probe: accept + bill = catalog price |
| 24 | `agent_checkout_path` | `checkoutRequiresCaptcha` flag |
| 18 | `feed_price_match` | `feedPrice === price` per SKU |
| 15 | `account_wall` | `checkoutRequiresAccount` flag |
| 11 | `payment_method` | ≥1 `agentCompletable` method |
| 6 | `page_structure` | Emitted JSON-LD: name, sku, gtin13, Offer |

`webmcp_tools` is **reported at 0 pts** (instrument floor ≥6 tools) — not charged.

### Crawl path — `audit-findings.ts` + `url-audit.ts`

1. Prefer `GET {origin}/products.json` (≤3 pages, **cap 50** SKUs); else homepage JSON-LD Product nodes.
2. Merchant flags default **false** (captcha/account off) — so full-bill math would lie; crawls **do not** use it as full score.
3. Charged/gradable: `page_structure` from scraped fields; `feed_price_match` often **single-source** → max still counted in catalog budget, points 0, confidence unknown.
4. Catalog budget ≈ **24** (18+6). Missing GTIN ⇒ `page_structure` 0 → **0/24** everywhere crawled so far.
5. Checkout four lines: NOT MEASURED (hints only for captcha/account).

### OAuth / compare

Same weights, Admin adapter vs crawl (`R2`, `POST /api/v1/audit/compare`). Intended to show Admin GTIN delta; **no completed merchant paired N in-repo**.

---

## 5. Field map: 148 → 78 → 0% — what it means and does not

From `audits/analysis-latest.json` / `FIELD_RECEIPT` in `field-companion.ts` (newer than handbook’s 102/52):

| Number | Meaning |
|--------|---------|
| **148** | Curated DTC URLs attempted (not a random panel of Shopify, not “all ecommerce”) |
| **78 (53%)** | Crawl returned ≥1 product via public feed or homepage JSON-LD |
| **0%** | Of those 78, **zero** sampled SKUs had GTIN/barcode in the public payload |
| **0/24** | Catalog legibility under crawl scoring — driven by required gtin (+ Offer fields) |

**Does NOT mean:**

- Merchants have no barcodes in Admin
- Agents cannot buy via ChatGPT/UCP/ACP channels that use private Catalog
- Checkout CAPTCHA rate is ~95% (that’s homepage string rate on successful crawls)
- The other ~47% “failed readiness” — many simply **refused discovery** (45 no-feed, 14×403, timeouts/429)
- Sample is unbiased (curated + “headless-suspects” tags; beauty/food over-represented among successes)

Older artifacts (R1 16/21, FINDINGS-D3 34/58, R6 52/102) are the same finding at smaller N — useful for provenance, not conflicting claims if you cite the batch.

---

## 6. Vertical patterns — causal hypotheses

`analysis-latest.json` crawl rates (attempted → crawled): food **81%**, beauty **77%**, fun/kids **63%**, accessories **60%**, outdoor **50%**, apparel **38%**, home **37%**, wellness **33%**, pet **10%**. GTIN **0%** in every vertical that crawled.

**Hypotheses (not proven):**

1. **Theme / architecture, not category physics.** Beauty/food DTC often still on classic Liquid with open `products.json`; apparel/outdoor/pet skew headless, bot-hardened, or CDN 403 — matches CatalogScan’s headless-feed story and our failure mix (no-feed dominant).
2. **Barcode emptiness is platform default, not vertical culture.** Once the feed opens, GTIN is uniformly absent → Shopify public JSON + merchant hygiene, not “beauty cares less about GS1.”
3. **Captcha hint % tracks bot-defense product installs**, correlated with crawl-success verticals that still serve HTML we can parse — almost useless as a checkout predictor (R3).
4. **`headless-suspects` is a tagging artifact**, not an independent population (R6 caveat); do not treat its 67% crawl rate as a natural experiment.

If hypothesis (1) is right, merchant advice splits: high-crawl verticals → **fill barcodes this week**; low-crawl → **restore feed / UCP before optimizing GTIN** (`HANDBOOK.md` vertical map).

---

## 7. Open unknowns

1. **Admin GTIN?** R2 infrastructure exists; field paired compares do not. Entire “Admin holds what public lacks” story hangs on this.
2. **Real checkout walls?** No consented live checkout probe. Sandbox journeys prove the *scoring model*; they do not measure DTC checkout. R3 says homepage hints overstate.
3. **UCP / ACP adoption?** Probe discovers endpoints; we lack population rates (“how many of 148 speak UCP?”) and whether Catalog MCP exposes GTINs when `products.json` does not.
4. **Selection bias.** Curated list + expansion toward known brands / headless suspects may inflate block rates or concentrate zero-GTIN themes.
5. **50-SKU cap / homepage JSON-LD bias.** First pages may omit barcodes that appear deeper; JSON-LD path may miss PDP-only schema.
6. **Presenc slice confusion.** Causes table vs failure-mode % — product copy must pick one and cite it.
7. **Whether public 0% GTIN blocks Instant Checkout** for stores that syndicate via Shopify Catalog (private path) — handbook asserts matching keys matter; we have not measured channel acceptance.

---

## 8. Where WebMCP fits

`WHY-WEBMCP.md` split is accurate:

- **Audit plane:** Presenc bill, crawl, OAuth, KV batch, rankings — works without WebMCP.
- **Proof plane:** in-tab `document.modelContext` tools (`prepare_checkout`, field companion, co-shop) — same handlers as REST/dev console, shared cart state.
- **Fallback:** Agent tool console / `invokeToolLocally` for judges without the Chrome flag.

WebMCP does **not** produce the 0% GTIN finding. It demonstrates *why the bill matters* (journey breaks at the charged wall). Claiming “WebMCP-powered readiness” would be marketing; claiming “WebMCP proves the path” matches the architecture.

---

## 9. Implications — what improving the product requires understanding first

1. **Decide the primary customer question.** Agent-side public crawl (current strength) vs Admin completeness (scanner competition) vs live checkout survival (Presenc-aligned but unmeasured). Mixing them inflates scores or false certainty.
2. **Close R2 before leaning on Admin-gap messaging.** Without paired GTIN deltas, film/Devpost should say “public feeds empty,” not “merchants forgot barcodes in Shopify.”
3. **Keep catalog score and full score visually divorced** on crawl results (already in findings). Demo sandbox 70→94 Autopilot must never be narrated as “colourpop fixes.”
4. **Treat vertical as a routing rule for advice**, not a GTIN story — product UX should branch on crawl success first.
5. **Instrumentation debt:** failure taxonomy is in `analysis-latest.json`; checkout probe and scanner pairing are still research backlog (`RESEARCH-AGENT-2026-08-31.md`).
6. **Handbook numbers lag FIELD_RECEIPT** (102/52 vs 148/78) — one source of truth or citations will drift.

---

## 10. Recommended next experiments (small, falsifiable)

| ID | Experiment | Falsifier | Done when |
|----|------------|-----------|-----------|
| E1 | **3–10 OAuth pairs** on crawled stores with known-empty public GTIN (`R2`) | Admin GTIN also ~0% | Compare API rows + table in R2 |
| E2 | **3–5 OAuth pairs on 403/no-feed stores** | Admin also unreachable / empty | Shows whether block is feed-only or catalog-empty |
| E3 | **UCP probe census on same 148** | &lt;5% expose `/.well-known/ucp` or `/api/ucp/mcp` *or* UCP returns GTIN where JSON does not | Adoption % + GTIN-on-UCP boolean |
| E4 | **Barcode depth check:** page 1 vs pages 2–3 vs full Admin | Later pages show GTIN | Cap artifact quantified |
| E5 | **Captcha precision study:** 10 stores with hint true/false × manual or consented checkout probe | Hint precision &lt;0.5 for real wall | R3 upgraded from methodology to measured |
| E6 | **One vertical deep dive (pet or home):** classify each block (Hydrogen, WAF, app proxy, true 404) | Failures are random HTTP noise | Causal note replaces CatalogScan citation alone |
| E7 | **Random Shopify subdomain sample (n=30)** vs curated | Curated 0% GTIN fails to replicate | Selection-bias bound |

Prefer E1 + E3: they falsify or lock the two claims the product most often stretches.

---

*Skeptical bottom line:* The field result that is solid is narrow and strong — **wherever this crawler could read a public DTC catalog, GTIN was absent and catalog scored 0/24; reach varies by vertical.** Almost everything else (Admin fullness, checkout abandonment, UCP as fix, WebMCP as necessity) is either borrowed research, sandbox proof, or unfinished measurement.
