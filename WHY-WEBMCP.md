# Why WebMCP — honest split

ReadyCounter is **not** "only possible with WebMCP." Most of the product is research, crawl, OAuth, and persistence. WebMCP is the **proof layer**: the assistant shops the same cart the human sees, in the same tab, without a separate MCP server.

---

## Three planes

```
┌─────────────────────────────────────────────────────────────────┐
│  AUDIT PLANE (no WebMCP)                                         │
│  Presenc weights · URL crawl · Shopify OAuth · readiness tape    │
│  Render KV · batch findings · verify scripts                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  PROOF PLANE (WebMCP-native path)                                │
│  18 tools · field companion · co-shop · prepare_checkout refusal │
│  get_field_companion · review_against_field · document.modelContext │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  FALLBACK PLANE (no browser flag)                                │
│  Agent tool console · invokeToolLocally · GET /api/v1/tools      │
│  ?co= share links · REST rooms                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## What does **not** need WebMCP

| Capability | Stack |
|------------|--------|
| Itemised abandonment bill (26/24/18/15/11/6) | `readiness.ts` + `research.md` + `verify-score.mjs` |
| URL audit + GTIN gap findings | `url-audit.ts` + `audit-findings.ts` |
| Shopify OAuth catalog sync | Admin API + Render `rc:store:*` |
| Persist audit across deploys | Render Key Value |
| Batch DTC audits | `audit:shops` → `rc:render:audit-batch:latest` |
| Judge / dev testing | Connect → **Agent tool console** (same handlers, no flag) |
| API discovery | `GET /api/v1/tools` + `openapi.yaml` |

**Launch claim:** *"We priced agent abandonment from published research and measured real storefronts."* — WebMCP optional.

---

## What WebMCP **uniquely** enables

| Without WebMCP | With WebMCP (in-tab) |
|----------------|----------------------|
| Stand up a remote MCP server + auth | Store **is** the tool server |
| Wire an external agent to your REST API | Browser assistant discovers tools from the page |
| Human and agent in different contexts | **One order, one tab** — shared Zustand state |
| Demo co-shop via copy-paste console | Native `add_to_order` / `prepare_checkout` from the assistant |

WebMCP registers tools on `document.modelContext`:

```typescript
// src/webmcp/registerTools.ts
await modelContext.registerTool({
  name: 'prepare_checkout',
  description: 'Validate checkout; blocked if CAPTCHA/account wall. Never charges.',
  execute: () => store.prepareCheckout('agent'),
});
```

When Chrome exposes WebMCP, the shopping assistant calls the **same** functions the dev console calls — but in the merchant's live session.

**Launch claim:** *"WebMCP is how we prove the bill — not how we wrote it."*

---

## Alternatives (and why we still ship WebMCP)

| Approach | Works? | Cost |
|----------|--------|------|
| **Remote MCP server** | Yes | Extra deploy, merchant auth, discovery |
| **REST only** | Yes | Agent must be wired externally; judges need docs |
| **Playwright / scrape** | Fragile | Not merchant-facing; breaks on CAPTCHA |
| **WebMCP in-page** | Yes, when flag on | Zero extra infra; co-shop is the demo |

We ship **all three**: REST for integrators, dev console for judges, WebMCP for the native assistant path.

---

## Copy that is defensible

| Say | Don't say |
|-----|-----------|
| "Research-priced bill + real catalog audit" | "Only WebMCP can score readiness" |
| "18 tools on the store; WebMCP registers them in-tab" | "WebMCP powers our Redis layer" |
| "Judges can test every tool without the flag" | "You must enable chrome://flags" |
| "Co-shop proves the agent path" | "We fixed your Shopify checkout" |

---

## One-liner (partnerships)

> **Shopify** brings the catalog. **Render** keeps the audit. **WebMCP** lets an assistant shop the cart you're looking at. Everything else is cited math and crawled evidence.

---

## In the product

- **Connect → 1 Measure** — URL audit (+ against-the-field review)
- **Connect → 2 Against the field** — issues / guidelines / research
- **Connect → How to run WebMCP** — Path A (Chrome flag) · Path B (tool console)
- **Connect → Path B console** — same handlers, no flag
- **Shop → Share cart** — proof path; badge when `modelContext` is live
- **Tape → webmcp_tools line** — reported at **0 pts** (instrument, not a scored weight)

See also: `LAUNCH.md`, `USE-CASE.md`, `PARTNERSHIP-RENDER.md`.
