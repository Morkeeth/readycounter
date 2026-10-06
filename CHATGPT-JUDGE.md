# ChatGPT + Chrome judge path

Hackathon requires judges to test in **ChatGPT’s in-app browser** **or** **Chrome with WebMCP enabled**.

**Live:** https://tooltruth-webmcp.vercel.app  
**Judge mode:** https://tooltruth-webmcp.vercel.app/?judge=1  
**60s script:** [`JUDGE-60s.md`](./JUDGE-60s.md)

ReadyCounter registers tools on **this open tab** (`document.modelContext`). There is no remote MCP server to start.

---

## Path A — Native WebMCP (preferred for hackathon)

Proves humans + agents share one cart through the browser’s assistant.

### ChatGPT in-app browser

1. Open https://tooltruth-webmcp.vercel.app inside ChatGPT’s browser (WebMCP supported when the challenge environment enables it).
2. Go to **Co-shop** (`/?view=shop`) — click **Add to order**.
3. Ask the assistant to call exposed tools: `add_to_order`, then `get_order`.
4. Ask it to run `prepare_checkout` — must **refuse** (wall citation) and **never charge**.
5. Header when native registration succeeds: **WebMCP live · 18 tools**.

### Chrome 149+ with flag

1. Open `chrome://flags/#enable-webmcp-testing` → set **Enabled** → relaunch Chrome.
2. Open https://tooltruth-webmcp.vercel.app
3. Header badge must read: **WebMCP live · 18 tools** (not the offline “Tools ready · Connect to test”).
4. **Co-shop** — human adds an item; assistant calls the same tools → **HUMAN** + **AGENT** chips on one order.
5. Optional deep proof: Connect → `#run-webmcp` shows Path A accent when live.

If the badge stays **Tools ready · Connect to test**, the flag did not take — use **Path B**.

---

## Path B — Agent tool console (no flag)

Works in any browser. Same 18 tool handlers. This is the default 5-minute path when native WebMCP is unavailable (EYES: Path B must be judge-safe).

1. Open https://tooltruth-webmcp.vercel.app/?view=integrations  
   or click **Connect**.
2. Scroll to **Agent tool console** (`#run-webmcp` then the console below).
3. Run sample calls in order:
   - `add_to_order: first SKU`
   - `get_order`
   - `prepare_checkout`
4. **Pass:** one shared order · **HUMAN** / **AGENT** chips · checkout refuses with wall citation · never charges.
5. Continue the timed path in [`JUDGE-60s.md`](./JUDGE-60s.md) (CAPTCHA **70→94**, colourpop audit, UCP filter **11**).

---

## Film / demo deep links

From [`FILM-READY.md`](./FILM-READY.md) — useful for judges who want a specific beat:

| Beat | Deep link |
|------|-----------|
| Hook / bill | `/?film=1&beat=0&store=ember-oak&view=merchant` |
| URL audit | `/?film=1&beat=3&view=integrations&demo=1` |
| Rankings + UCP | `/?film=1&beat=4&view=integrations` |
| Delta | `/?film=1&beat=5&view=integrations&demo=1` |
| Autopilot / CAPTCHA | `/?film=1&beat=6&store=ember-oak&view=merchant` |
| Co-shop | `/?film=1&beat=7&view=shop` |
| Full film mode | `/?film=1&view=integrations&demo=1` |

Non-film judge shortcuts:

| Intent | URL |
|--------|-----|
| Co-shop first | `/?view=shop` · `/?judge=1` |
| Connect + console | `/?view=integrations` |
| Ember CAPTCHA tape | `/?store=ember-oak&view=merchant` |
| Neon second merchant | `/?store=neon-matcha&view=merchant` |

---

## API receipts (no UI)

```bash
curl -s https://tooltruth-webmcp.vercel.app/api/v1/tools | jq '.toolCount'
# expect: 18

curl -s https://tooltruth-webmcp.vercel.app/api/v1/rankings | jq '{succeeded,shopCount,avgGtinPct,ucp:.ucp.gtinWhereCrawlZero}'
# expect: 78, 148, 0, 11

curl -s https://tooltruth-webmcp.vercel.app/api/v1/health | jq '{ok,kv}'
# expect: ok true · kv.backend redis
```

---

## Constitution

`prepare_checkout` **never charges a card.** Human confirms payment in the tab.
