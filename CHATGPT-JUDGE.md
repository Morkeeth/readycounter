# ChatGPT + WebMCP judge path

Hackathon accepts **ChatGPT in-app browser** **or** Chrome with `chrome://flags/#enable-webmcp-testing`.

ReadyCounter registers **18 tools** on `document.modelContext` in the open tab. Path A lets a native assistant call them; Path B runs the **same handlers** in Connect without any flag.

**5-minute click path:** [`JUDGE-60s.md`](./JUDGE-60s.md)  
**Film deep links:** [`FILM-READY.md`](./FILM-READY.md)

---

## Path A — native WebMCP (assistant in the tab)

### Option 1 · ChatGPT in-app browser

1. Open the live URL inside ChatGPT (browse / in-app browser).
2. Co-shop tab (`/?view=shop`) — add a human line.
3. Ask the assistant to call **`add_to_order`**, then **`get_order`** — same cart, `human` + `agent` chips.
4. Ask for **`prepare_checkout`** while Ember & Oak CAPTCHA is on — refusal names the wall; **never charges**.

No Chrome flag. Tools register when the page loads in a WebMCP-capable client.

### Option 2 · Chrome flag (local or any browser)

1. `chrome://flags/#enable-webmcp-testing` → **Enabled** → relaunch.
2. Open https://tooltruth-webmcp.vercel.app/?view=shop
3. Header badge should read **WebMCP live · 18 tools** (re-derive: `curl -s …/api/v1/tools | jq '.toolCount'`).
4. Use the page assistant or co-shop — same 18 tools as Path B.

Connect tab also shows **Status now: WebMCP live · 18 tools registered** under **3 · Prove with WebMCP**.

---

## Path B — no flag (console fallback)

**Default for most judges** — same tools, explicit console.

1. **Connect** tab (default on first visit, or `/?view=integrations`).
2. Scroll to **Path B — Agent tool console** (bottom of Connect).
3. Run **`add_to_order: first SKU`** → **`get_order`** → **`prepare_checkout`**.
4. Output JSON in the panel — same code paths as Path A.

Badge without flag: **Tools ready · Connect to test**.

---

## Prove humans + agents together (EYES checklist)

| Step | Path A | Path B |
|------|--------|--------|
| Human adds SKU | Co-shop **Add** button | same |
| Agent adds SKU | Assistant calls `add_to_order` | Console **`add_to_order: first SKU`** |
| Shared state | `get_order` shows both lines | Console **`get_order`** |
| Checkout gate | `prepare_checkout` refuses with citation | Console **`prepare_checkout`** |
| Fix sandbox wall | Readiness → CAPTCHA off → **70 → 94** | same |

---

## Field + rankings beat (Connect)

After co-shop proof:

1. Paste `https://colourpop.com` → **Audit storefront**.
2. Scroll **DTC rankings** → filter **UCP GTIN · scrape empty** (**11** rows at API object).
3. Batch width: **78 / 148** crawled · **0%** scrape GTIN (`avgGtinPct`).

```bash
curl -s https://tooltruth-webmcp.vercel.app/api/v1/rankings | jq '{succeeded,shopCount,avgGtinPct,ucp}'
```

---

## Film mode deep links (from `FILM-READY.md`)

Base film URL:

```text
https://tooltruth-webmcp.vercel.app/?film=1&view=integrations&demo=1
```

| Beat | Deep link |
|------|-----------|
| 0 — Hook | `/?film=1&beat=0&store=ember-oak&view=merchant` |
| 1 — Stake | `/?film=1&beat=1&store=ember-oak&view=merchant` |
| 2 — Bill | `/?film=1&beat=2&store=ember-oak&view=merchant` |
| 3 — URL audit | `/?film=1&beat=3&view=integrations&demo=1` |
| 4 — Rankings + UCP | `/?film=1&beat=4&view=integrations` |
| 5 — Delta | `/?film=1&beat=5&view=integrations&demo=1` |
| 6 — Journey / autopilot | `/?film=1&beat=6&store=ember-oak&view=merchant` |
| 7 — Co-shop | `/?film=1&beat=7&view=shop` |
| 8 — Ambition | `/?film=1&beat=8&view=integrations` |
| 9 — Close | `/?film=1&beat=9` |

---

## Do not claim

- Fixed live Shopify checkout (sandbox toggles only).
- URL audit scores CAPTCHA / checkout walls (catalog budget only).
- **34/58** batch or **16 tools** (live batch is **78/148**, **18** tools).
- OAuth Admin↔crawl pairs (E1 not done).

---

## Constitution

**`prepare_checkout` never charges a card.**
