# Devpost submission copy — ReadyCounter

Paste-ready fields for the [WebMCP Challenge](https://webmcp.devpost.com/).
Every figure below that is *cited* — every share, multiple and survey result —
resolves to a row in [`src/data/sources.ts`](./src/data/sources.ts) and a quoted
sentence in [`research.md`](./research.md). `npm run verify` fails the build if a
cited figure loses its source. Scores and catalog counts are *measured* off the
shipped fixtures and cite nothing.

**Oscar: this is final — nothing left to fill in.** Deploy is live; the remaining
clicks are the video and the Devpost submit.

---

## Live demo

```text
https://tooltruth-webmcp.vercel.app
https://tooltruth-webmcp.vercel.app/?view=merchant&store=neon-matcha
```

_Live. Second link opens the second merchant's readiness bill directly._

---

## Project name

ReadyCounter

---

## Tagline (≤60 characters)

The counter prints the score — agent readiness, itemised

*(55 characters)*

---

## Elevator pitch

Agent traffic to Shopify storefronts is up **8× year over year** and **78.6% of
agent carts are abandoned** — and merchants cannot see why. **ReadyCounter**
scores a storefront out of 100 for agent shoppers and prints the score as an
**itemised bill**: every point traced to a named check, its arithmetic, its one-line
fix, and the page the weight came from — publisher, date published, date read.
Three of the six weights are published shares of abandoned agent carts — three
rows of one table — and the other three are ours, which the receipt says on the
line rather than in a footnote. **No checkout wall is priced by us:** a CAPTCHA
costs 24 and a forced account 15, because those are the two figures the source
publishes.
The store itself exposes **16 WebMCP tools**, so a human and an agent co-edit one
order in one tab, and `prepare_checkout` never charges a card.

---

## Description (extended)

### The problem

Merchants are told agents are coming. Nobody tells them **which door is locked**.

| Signal | Figure | Source (read 2026-08-30; the Presenc page re-read in full 2026-08-31) |
|--------|--------|--------|
| AI-referred sessions to Shopify storefronts, YoY | **8×**; orders **13×** | [Shopify Enterprise, 2026-05-11](https://www.shopify.com/enterprise/blog/ai-search-insights) |
| Catalog-powered AI search vs scraped | **2× conversion** | [Shopify Q1 2026 earnings call](https://stockanalysis.com/stocks/shop/transcripts/555081-q1-2026/) |
| AI traffic conversion, Mar 2025 → Mar 2026 | **−38% → +42%** | [Adobe Digital Insights, 2026-04-16](https://business.adobe.com/blog/ai-traffic-surge-retail-sites-not-machine-readable) |
| Agent cart abandonment | **78.6%** — stale feed **26%**, CAPTCHA **24%**, required account **15%** (all six rows in `research.md`) | [Presenc AI, 2026-06](https://presenc.ai/research/agent-cart-abandonment-statistics-2026) |
| Product schemas carrying the Offer object | **19%** | [Digital Applied, 5,000-site audit, 2026-04-26](https://www.digitalapplied.com/blog/schema-markup-adoption-5k-site-audit-2026) |
| Trust AI to compare prices vs to place the order | **65% vs 14%** | [YouGov US for Checkout.com, 2025-12-04](https://yougov.com/en-us/articles/53808-american-trust-in-ai-for-retail-consumer-sentiment-in-2025) |

### What we built

**A readiness score you can audit line by line, on a store an agent can actually use.**

1. **The tape.** The score is not a gauge — it is a printed receipt. Six line
   items, a measured column and an allocated column, a total, and a red
   **CHECKOUT VOID** stamp when the agent path is walled. Open any line and it
   prints the check, the arithmetic, the fix, and the source with its dates.
2. **A weighting that admits what it does not know — and shows you the table.**
   100 points: **26** for a stale price feed, **24** for a CAPTCHA, **15** for a
   forced account, because those are three rows Presenc AI publishes. Every
   deduction the checkout can take is priced by that table, not by us, and a
   store with both walls pays 39. The remaining **35** we allocated ourselves,
   and every surface that prints the score says so. All six rows of the source
   table are reproduced in `research.md` — see *What we got wrong* for why that
   matters.
3. **Co-shop.** 16 WebMCP tools; a human and an agent edit the same order in the
   same tab. `prepare_checkout` validates and returns totals — it never charges.
4. **Two merchants, two failure modes, one point apart.** Ember & Oak Coffee
   scores **70/100**, blocked by a CAPTCHA worth 24. Neon Matcha Lab scores
   **71/100**, blocked by a forced account worth 15, with a catalog agents mostly
   cannot identify (**4/14**). Almost the same total for completely different
   reasons — and each wall is priced from the same published table, not by us.
5. **Agent tool console.** Under **Connect** — invoke every tool without `chrome://flags`.
6. **Instant use.** No signup. Order survives refresh. `?co=` share links,
   live API rooms on Vercel, `?view=` deep-links a tab.

### Why the score is defensible

Most readiness scores are a number with a nice ring around it. This one ships
its own audit:

- **A figure the product cites cannot be printed without a row in
  `src/data/sources.ts`.** Nine rows, each with publisher, figure, URL, publish date,
  read date, and the honest limit of the source (Presenc is a vendor page and
  says its metrics are modelled; the "81% lack Offer" line is our subtraction).
- **`scripts/verify-score.mjs`** fails `npm run verify` if the budget stops
  summing to 100, a weight names a source that does not exist, a source is
  under-cited, a URL is not quoted in `research.md`, the tool count in the UI
  drifts from `registerTools.ts`, or — the important one — **a measured weight
  stops equalling the figure its source publishes.**
- **Observable consequence:** clearing the CAPTCHA moves Ember & Oak from
  **70 to 94** — a delta of exactly **24**, Presenc AI's 24%. Clearing the forced
  account moves Neon Matcha from **71 to 86** — exactly **15**, a *different*
  published figure from the same table. `scripts/verify-readiness.mjs` fails the
  build if either is ever anything else, and a budget-neutral tamper
  (`account_wall` 15→16 with `stock_signals` 7→6, still summing to 100) still
  goes red on three assertions.

### What we got wrong

For most of this build an account wall was charged the CAPTCHA's **24** points,
and four surfaces printed the reason: *"No published figure prices an account
wall separately."*

That sentence was false about our own citation. The Presenc AI table has **six**
rows and **"Required account or login — 15%"** is one of them, four lines below
the 24% we had already lifted from it. We had reproduced two rows of a six-row
table in `research.md` and then reasoned from the gap we had made ourselves.

The fix was not a reworded sentence. The account wall is now its own scored line
at its own published weight of 15; all six rows are reproduced; and
`verify-readiness.mjs` asserts each wall's delta against its own source row, so
the next person to re-tune one without re-reading the page gets a red build. A
second defect fell out of the rebalance and is worth naming too: the call sites
still multiplied by the old point values, and `Math.min` clamped the result into
a *perfect* score on an imperfect catalog. Weights are now applied in exactly one
place and there is a check that a partial ratio can never print a full line.

### WebMCP tools (16)

| Tool | Role |
|------|------|
| `search_catalog` | Agent product discovery |
| `get_product` | Full SKU record |
| `add_to_order` | Co-shop cart |
| `update_line_quantity` | Line quantity edits |
| `remove_line` | Remove line |
| `get_order` | Shared order state |
| `get_delivery_quote` | Shipping quote |
| `prepare_checkout` | Validate — **never charges** |
| `get_readiness_score` | Score /100 with itemised checks |
| `get_merchant_config` | CAPTCHA / account flags |
| `validate_catalog_feed` | Feed issues an agent would hit |
| `export_shopify_catalog` | Shopify-shaped catalog export |
| `create_coshop_room` | Live shared room via the REST API |
| `apply_readiness_fix` | Apply a sandbox fix and reprint the bill |
| `simulate_agent_journey` | Walk the whole path and report where it breaks |
| `import_shopify_catalog` | Bring your own catalog and score it |

### Fork path

Duplicate one entry in `src/data/stores.ts`, open `?store=your-id`, and your
store gets its own bill. Five-minute guide: [`FORK.md`](./FORK.md).

### Human-in-the-loop constraint

`prepare_checkout` validates the order and returns totals. **It never charges a
card.** When a wall is up it refuses and the refusal names the wall, its point
cost, and the page that priced it — a diagnosis, not a dead end.

---

## Built with

React 19 · TypeScript · Vite · Zustand · WebMCP `document.modelContext.registerTool`
· Vercel serverless functions for live co-shop rooms · MIT.

---

## Testing instructions (judges)

```bash
git clone https://github.com/Morkeeth/tooltruth-webmcp.git
cd tooltruth-webmcp
npm install
npm run build && npm run verify   # both exit 0
npm run dev
```

Open `http://localhost:5173`. **No API keys. No WebMCP flag required.**
Fast path: [`JUDGE-60s.md`](./JUDGE-60s.md).

### 5-minute judge path

1. **The tape** — landing screen shows Ember & Oak at **70/100** with a
   CHECKOUT VOID stamp. Click any line: arithmetic, fix, source, dates.
2. **Co-shop** — *Start shopping* → add an item → **Connect → Agent tool
   console** → `add_to_order`, then `get_order`. One order, `HUMAN`/`AGENT` chips.
3. **The refusal** — *Prepare checkout*. It refuses and cites Presenc AI.
4. **The fix** — **Readiness** → uncheck CAPTCHA (or use Readiness autopilot) →
   **70 → 94**, a delta of exactly 24.
5. **Second merchant** — `?store=neon-matcha` → **71/100**, account wall (15 pts), 4/14 catalog.
6. **The audit** — `npm run verify`, or the *Every source this tape can cite*
   panel. Try changing a weight in `src/lib/readiness.ts` and re-run verify.

### Optional: native WebMCP

Chrome 149+ → `chrome://flags/#enable-webmcp-testing` → the header badge reads
**Assistant tools active · 16 connected**.

---

## Demo video spine

Full one-take script with the exact numbers: [`DEMO-SCRIPT.md`](./DEMO-SCRIPT.md).

| Time | Beat |
|------|------|
| 0:00 | The tape — Ember & Oak, 70/100, CHECKOUT VOID |
| 0:25 | Open a line: 0/24, measured, Presenc AI, read 2026-08-31 |
| 0:55 | Co-shop — human item + `add_to_order` in one order |
| 1:20 | `prepare_checkout` refuses, and says exactly why |
| 1:45 | Clear the CAPTCHA — 70 → 94, a delta of exactly 24 |
| 2:10 | Neon Matcha — 71/100, account wall worth 15, 4/14 catalog |
| 2:30 | Nine sources, every one dated |

---

## Links

- Repo: https://github.com/Morkeeth/tooltruth-webmcp
- Score derivation + every weight: [`research.md`](./research.md)
- Fork guide: [`FORK.md`](./FORK.md)
- Screenshots (1440px + 390px): [`docs/shots/`](./docs/shots/)
- Design rulings + open decisions: [`DECISIONS.md`](./DECISIONS.md)
- Challenge: https://webmcp.devpost.com/
