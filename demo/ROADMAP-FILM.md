# ReadyCounter — ambitious roadmap (say on film, ship after)

**North star:** Every merchant gets a stamped, re-runnable **agent-readiness receipt** — ranked against the field, fixed against a handbook, proven with a delta.

## Shipped (film these)

| Capability | Proof |
|------------|--------|
| Itemised bill priced by Presenc shares | ember-oak **70 → 94** |
| Public URL audit (catalog-only) | colourpop · never /100 |
| Field rankings **78/148 · 0% GTIN** | `GET /api/v1/rankings` |
| UCP × scrape join · **11** gap brands | filter *UCP GTIN · scrape empty* |
| Re-audit delta receipt | same URL twice |
| Handbook + MPN / identifier_exists | Against the field |
| Co-shop · **18** WebMCP tools | prepare_checkout never charges |
| Render KV persistence | audit link tomorrow |

## Next 30 days (say as ambition, not done)

1. **E1 Admin pairs** — ≥3 OAuth crawl↔Admin GTIN tables (locks or kills the “Admin holds barcodes” story)
2. **Offer schema line** — % Product nodes with Offer+price+availability on crawl path
3. **ACP smoke** — live privacy + ToS URL checks; honest “not measurable” elsewhere
4. **Public receipt API** — signed JSON receipt merchants pin in CI / Agentic Storefronts checklist
5. **Stranger onboarding** — one-path Connect: audit → field → delta → handbook in under 90 seconds

## Next quarter (winner trajectory)

- Rank the **full journey** (discovery → eligibility → checkout walls) without lying about unmeasured lines
- Merchant deep links into Shopify Admin barcode CSV / channel toggles
- Continuous field census (weekly cron) with public changelog of agent-side emptiness
- Open protocol: ReadyCounter receipt as the default “am I agent-ready?” artifact beside UCP/ACP

## Kill conditions

- If E1 shows Admin also empty on the same SKUs, drop the Admin-gap climax and lead with feed/UCP
- If UCP GTIN collapses to crawl GTIN on re-census, rewrite the 11-brand beat
- If judges need Admin scanners, partner/cite CatalogScan — do not compete on Admin completeness
