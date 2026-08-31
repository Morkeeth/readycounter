# Ambitious builds — what ships next

Ordered by launch impact. Each slice is independently verifiable.

---

## Shipped (this session)

| Slice | Done when |
|-------|-----------|
| Research launch kit | `LAUNCH.md`, `DEMO.md`, `verify:launch`, Connect UI |
| Render partnership | `render.yaml`, `/api/v1/render/status`, KV batch |
| Honest WebMCP framing | `WHY-WEBMCP.md`, in-app panel |
| Merchant journey UI | Audit → Bill → Preview → Prove flow |

---

## Wave A — conversion (merchant wedge)

| # | Build | Impact | Size |
|---|-------|--------|------|
| A1 | **Post-audit auto-route** — after URL audit, land on Readiness with scroll to top finding | Removes dead-end after Connect | S |
| A2 | **OAuth vs crawl comparison** — same store: public feed score vs Admin API score side-by-side | Proves Shopify value; Devpost gold | M |
| A3 | **GTIN fix checklist** — exportable CSV of SKUs missing barcode from audit | Merchant leaves with an action list | M |
| A4 | **Weekly audit digest** — Render cron email/webhook with batch delta | Render partnership story | M |

---

## Wave B — proof (WebMCP + co-shop)

| # | Build | Impact | Size |
|---|-------|--------|------|
| B1 | **One-click agent journey** — button runs `simulate_agent_journey`, prints tape diff | Judges see path break without console | S |
| B2 | **prepare_checkout refusal card** — full-screen when agent hits wall, cites Presenc row | Makes 24% tangible | S |
| B3 | **WebMCP tool activity reel** — last 5 tool calls on Shop tab (already have toast; extend) | Shows live co-shop | S |
| B4 | **Multi-tab room demo** — open `?room=` in two windows, edit cart | Render KV proof for partners | M |

---

## Wave C — ambition (production)

| # | Build | Impact | Size |
|---|-------|--------|------|
| C1 | **Merchant magic-link** — return to dashboard without re-import | Slice 5 in hack.md | M |
| C2 | **Custom domain + Sentry** | Production ops | S |
| C3 | **Rate limits + abuse guard on /audit/url** | Scale batch audits | S |
| C4 | **Shopify App Store listing** — OAuth app as distribution | Real merchants | L |

---

## Wave D — research depth

| # | Build | Impact | Size |
|---|-------|--------|------|
| D1 | **Re-run batch after OAuth** — compare GTIN% crawl vs Admin for 3 willing stores | Field study write-up | L |
| D2 | **Checkout probe worker** — headless `prepare_checkout` against live Shopify (with consent) | Unlocks 26+24+15+11 lines on real stores | L |
| D3 | **Publish findings paper** — batch + methodology on Substack/GitHub | Outbound credibility | M |

---

## Pick one for tonight

**A2 + B1** — OAuth vs crawl comparison plus one-click agent journey. That is the story: *research bill, real catalog, proved path* — in under three clicks.
