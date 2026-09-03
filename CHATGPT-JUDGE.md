# ChatGPT + Chrome judge path

Hackathon requires judges to test in **ChatGPT in-app browser** or **Chrome with WebMCP enabled**.

**Live:** https://readycounter.vercel.app

---

## Path A — Native WebMCP (preferred for hackathon)

### ChatGPT in-app browser

1. Open the live URL inside ChatGPT's browser (WebMCP supported out of the box)
2. Go to **Co-shop** tab (`/?view=shop`)
3. Add a product → confirm order panel updates
4. Ask the assistant to call `add_to_order` via exposed tools
5. Run `prepare_checkout` — must refuse without charging

### Chrome 149+ with flag

1. `chrome://flags/#enable-webmcp-testing` → **Enabled** → relaunch
2. Open https://readycounter.vercel.app
3. Header badge: **Assistant tools active · 18 connected**
4. Co-shop tab → human + agent edit same order

---

## Path B — Tool console (no flag required)

Works in any browser. Proves the same 18 tools without native WebMCP.

1. Open https://readycounter.vercel.app/?view=integrations
2. Scroll to **Agent tool console**
3. Run `add_to_order` → `get_order` → `prepare_checkout`
4. **Pass:** one order, HUMAN/AGENT chips, checkout refuses with wall citation

---

## 5-minute proof sequence

| Step | URL / action |
|------|----------------|
| 1 Co-shop | `/?view=shop` — add item |
| 2 Tools | Connect → Agent tool console → `add_to_order` |
| 3 Sandbox | `/?store=ember-oak&view=merchant` — CAPTCHA off → **70→94** |
| 4 Field | Connect → audit colourpop → rankings UCP filter (**11** gaps) |

Full timing: [`JUDGE-60s.md`](../JUDGE-60s.md)

---

## API receipts (no UI)

```bash
curl -s https://readycounter.vercel.app/api/v1/tools | jq '.toolCount'    # 18
curl -s https://readycounter.vercel.app/api/v1/rankings | jq '{succeeded,shopCount,ucp:.ucp.gtinWhereCrawlZero}'
```

---

## Constitution

`prepare_checkout` **never charges a card.**
