# ReadyCounter — launch kit

**Line:** Agent commerce. Now reviewable. Proof.  
**Stranger URL:** https://tooltruth-webmcp.vercel.app/?view=integrations  
**Demo script:** [`DEMO.md`](./DEMO.md) · **Film pack:** [`demo/FILM-AND-SUBMIT.md`](./demo/FILM-AND-SUBMIT.md)

---

## Impact (every figure → `src/data/sources.ts`)

| Headline | Figure | Proof on product |
|----------|--------|------------------|
| AI traffic is already here | 8× sessions · ~13× orders YoY | Landing hero + readiness tape |
| Agents abandon more than humans | **78.6%** agent cart abandon | Six-line bill maps 100 pts to Presenc causes |
| Structured catalog wins | 2× conversion vs scraped AI search | URL audit + OAuth; batch **0% GTIN** on public feeds |
| Shoppers trust compare, not auto-buy | 65% compare · 14% auto-order | Co-shop; `prepare_checkout` never charges |
| Field audit — DTC GTIN gap | **0% GTIN** on crawled Shopify feeds | `research/HANDBOOK.md` + field receipt |
| One wall, measurable recovery | +24 pts when CAPTCHA cleared | ember-oak autopilot 70 → 94 in sandbox |

---

## Stranger path (60s)

1. **Measure** — paste storefront URL → catalog bill + YOU·FIELD + Offer% + policy smoke  
2. **Compare** — rankings **148** width · UCP gap filter · vertical  
3. **Prove** — WebMCP Path A (flag) or Path B (tool console) · co-shop CTA  
4. **Re-measure** — re-audit same URL → delta receipt · copy `?audit_url=` share link

---

## Top merchant actions (Presenc order)

1. **GTIN every SKU** — 0% GTIN on 78/148 crawled DTC public feeds  
2. **Remove CAPTCHA** from agent checkout path (+24 pts in sandbox)  
3. **Guest checkout** — account wall costs 15 pts  
4. **Offer JSON-LD** — only ~19% of Product schema includes Offer (Digital Applied)  
5. **ACP policy URLs** — privacy + terms must HTTP 200 when checkout-eligible

---

## Verify before film

```bash
npm run verify
npm run build
curl -sS -X POST http://localhost:3000/api/v1/audit/url \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://colourpop.com"}' | jq '{offerPct,policySmoke,meta}'
```

---

## Say on close

*Lighthouse for agentic commerce. Not Shopify's rails. Agent-side truth.*
