# Launch — ReadyCounter (product, not hackathon)

## THE PROMISE (honest v1)

**Merchants:** Run an agent-readiness audit on a catalog you bring. See what blocks shopping assistants — CAPTCHA, login walls, stale feed prices — and get a checklist you can act on.

**Proof:** Co-shop in the same tab so you see what assistants experience. Fixes apply in the sandbox first; connecting your live store is post-gate.

## THE CUSTOMER (v1 — one, not two)

| Primary | Secondary (proof, not GTM) |
|---------|---------------------------|
| Merchant / operator auditing agent readiness | Shopper co-shopping with an assistant |

Do not split acquisition. Every outbound message leads with **merchant audit**; co-shop is the demo of why readiness matters.

## THE NAMED FIRST TEN

| # | Who | Why |
|---|-----|-----|
| 1 | Indie Shopify merchant (coffee, matcha, DTC) | Real catalog import + audit |
| 2 | Shopify partner devrel | Catalog 2× narrative |
| 3 | Agent builder shipping browser commerce | Tool surface + co-shop |
| 4 | Vercel commerce template author | Deploy + fork lineage |
| 5 | WebMCP spec author | Reference implementation |
| 6 | Presenc / agent-commerce researcher | Stat validation |
| 7 | Open-source contributor wanting WebMCP sample | GitHub star |
| 8 | Oscar's commerce network | Distribution |
| 9 | Stranger from URL post | Cold proof |
| 10 | Devpost retail track _(feedback only)_ | Not the customer |

## THE CHANNEL

1. **Live URL post** — X / LinkedIn with opener B: *"Why ~78% of agent carts abandon — audit yours in 5 minutes"*
2. **GitHub README** — "Try it now" (product README, not judge path)
3. **Devpost (Wed)** — live URL + short product recording; submission ≠ roadmap

**Lead mechanic:** Copy cart link (`?co=`). Do **not** lead with live API sessions until KV ships.

## THE GATE

**One reply from a non-Oscar merchant or dev within 72h of URL post** asking to audit their catalog, fork the tools, or try on their store.

Reply type routes post-gate work:

| Reply | Next build |
|-------|------------|
| Developer | Connect docs, FORK.md, tool manifest polish |
| Merchant | Read-only live URL audit spike |
| Either + needs sync | Upstash KV for rooms |

## THE CONTROL ARM

Same URL, two openers (pick one per channel):

- **A (dev):** "Agent-ready storefront — 16 structured tools, import your Shopify catalog"
- **B (merchant):** "Why agent carts abandon — score your catalog in 5 minutes"

Instrument: ask which they are in the post CTA.

## CONSTRAINT

- No login to shop or audit in v1
- Merchant auth is post-gate
- No claiming we fix live checkout — sandbox audit only until OAuth/URL audit ships

## EYES NEXT ACTION

Deploy today → post URL → run stranger eval on **cart link path** → freeze features until gate fires.
