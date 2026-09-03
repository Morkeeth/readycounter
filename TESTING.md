# Testing ReadyCounter

No signup, no install, no API key. Everything below runs against production.

**Live:** <https://readycounter.vercel.app/?judge=1>

---

## 60 seconds — the WebMCP proof

1. Open **<https://readycounter.vercel.app/?judge=1>**
2. Click **Add to order** on any product. The line appears in the Co-shop order
   tagged **`HUMAN`**.
3. Open **Connect → For developers and judges → Agent tool console**.
4. Run **`add_to_order`**. A second line appears in *the same order*, tagged
   **`AGENT`**. One cart, two participants.
5. Run **`prepare_checkout`**. It validates the total and **refuses**, naming the
   CAPTCHA and citing the published share it comes from. **No card is ever
   charged** — the agent proposes, the person pays.

That is the whole thesis. Everything else is evidence for it.

---

## 20 seconds — watch a real model do it

On the **Co-shop** tab, under the products: **Test the store with a real model**.

Pick a goal and press **Run one trial**. GPT-5.6 Terra receives eight commerce
tool definitions and decides the calls; this page executes them through
`document.modelContext`. It typically searches, reads a product, adds one, then
hits the CAPTCHA and says so in its own words. Press **Repeat 3×** to compare
three independent receipts instead of relying on one run.

The direct OpenAI API key is server-side. The client cannot pick the model,
inject assistant history, change the system prompt or return results for unknown
call ids. The goal is capped at 200 characters, the loop at 8 steps, and only
the 8 shopping tools are exposed. Each receipt records store, source, model,
prompt version, calls, blocker and timestamp in Render Key Value.

If `OPENAI_API_KEY` is absent, the deployment can use `OPENROUTER_API_KEY` as a
fallback. If neither exists, the endpoint returns `agent_unconfigured` and every
other path still works.

---

## Native WebMCP (Path A)

The tool console above uses the same handlers with no flag. To exercise the
browser's own API instead:

1. Chrome 149 or newer → `chrome://flags/#enable-webmcp-testing` → **Enabled** →
   relaunch.
2. Reload ReadyCounter. The header changes to **WebMCP live · 18 tools** — it
   only says that when `document.modelContext` actually exists.
3. In DevTools:

```js
const mc = document.modelContext;
const tools = await mc.getTools();
tools.length;                                   // 18

const search = tools.find(t => t.name === 'search_catalog');
await mc.executeTool(search, '{"query":"espresso"}');
// {"count":1,"products":[{"id":"sku-espresso","name":"House Espresso Blend",...

const add = tools.find(t => t.name === 'add_to_order');
await mc.executeTool(add, '{"product_id":"sku-espresso","quantity":1}');
// {"ok":true,"lineId":"line-..."}   ← watch the AGENT chip appear in the cart

const checkout = tools.find(t => t.name === 'prepare_checkout');
await mc.executeTool(checkout, '{}');
// {"ok":false,"blocked":true,"reason":"Checkout blocked: CAPTCHA required. 24% of
//  abandoned agent carts stop at a CAPTCHA or verification wall (Presenc AI...)"}
```

> **Arguments go in as a JSON string.** Passing an object fails with
> `Failed to parse input arguments`. This is Chrome's API surface, not ours, and
> it is the single thing most likely to make a reviewer think the tools are
> broken when they are not.

Verified on Chrome 152: **all 18 tools execute** through native
`document.modelContext` against the live site.

---

## The product, in three tabs

**Connect** — the census wall. 148 real storefronts, one tile each: 70 grey
(asked, nothing came back), 67 hollow (a feed with no barcode), 11 blue (a
barcode on Shopify's Catalog MCP but not on their own storefront). Below it, the
blank barcode: what an agent actually reads off a product page.

Paste any real domain and press **Score my store**. Try:

```
colourpop.com
```

It scores 0 of 24 catalogue points at 0% scrape GTIN, and prints a fix list
where every line names its source. Your tile joins the wall.

**Readiness** — the itemised bill. Open any line: it prints the check, the
arithmetic, the fix, and the publisher, publication date and read date of the
weight. Nothing on the tape is a number we typed in.

**Co-shop** — the shared cart above.

---

## Verify the claims instead of trusting them

```bash
# the field batch behind every number on the front page
curl -s https://readycounter.vercel.app/api/v1/rankings \
  | jq '{succeeded,shopCount,avgGtinPct,ucp}'
# {"succeeded":78,"shopCount":148,"avgGtinPct":0,
#  "ucp":{"available":81,"withGtin":13,"gtinWhereCrawlZero":11}}

# the 18 tool definitions
curl -s https://readycounter.vercel.app/api/v1/tools | jq 'length'

# integrations: Shopify OAuth, Shopify Catalog MCP, Render Key Value
curl -s https://readycounter.vercel.app/api/v1/health | jq '.integrations'
curl -s https://readycounter.vercel.app/api/v1/render/status | jq '{partner,kv,lastAuditBatch}'

# score any storefront yourself
curl -s -X POST https://readycounter.vercel.app/api/v1/audit/url \
  -H 'content-type: application/json' -d '{"url":"https://colourpop.com"}' | jq '.score'
```

From a clone:

```bash
git clone https://github.com/Morkeeth/readycounter && cd readycounter && npm ci
npm run verify        # 15 scripts: arithmetic, citations, limits, agent receipts
npx playwright test   # 15 e2e tests, against production
```

---

## What we do not claim

- Field crawls score the **catalogue budget only** (0–24). Checkout lines read
  `NOT MEASURED` until Shopify OAuth. The full `/100` appears only on sandbox
  stores where checkout is declared.
- The 148 are curated DTC brands, not a census of Shopify.
- Presenc AI's shares are a modelled panel, quoted as an industry benchmark, and
  every line that uses one says so.
- We charged the forced-account-wall 24 points until 2026-08-31, when a re-read
  of the cited table showed it has its own row at 15%. The weight changed; the
  note is still on the line.
