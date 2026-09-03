# Judge path — 60 seconds

No API keys. **Path B** works without WebMCP flag. **Path A:** [`CHATGPT-JUDGE.md`](./CHATGPT-JUDGE.md)

**Live:** https://readycounter.vercel.app

---

## 0:00–0:20 · Co-shop (WebMCP proof)

1. Open `/?view=shop`
2. **Add to order** on any product
3. **Connect** tab → **Agent tool console**
4. Run **`add_to_order`** → **`get_order`**

**Pass:** same order · HUMAN + AGENT chips · `prepare_checkout` refuses (never charges).

---

## 0:20–0:35 · Readiness sandbox

1. **Readiness** tab (ember-oak) — **70/100** · CAPTCHA **ON**
2. Toggle CAPTCHA **off** (or Autopilot) → **70 → 94**

**Pass:** delta = exactly **24** (Presenc CAPTCHA row).

---

## 0:35–0:50 · Field width

1. **Connect** → paste **colourpop.com** → **Audit**
2. Rankings → filter **UCP GTIN · scrape empty**

**Pass:** **78/148** crawled · **0%** scrape GTIN · **11** UCP gaps.

---

## 0:50–1:00 · Delta

1. **Re-audit** same URL → delta receipt

**Pass:** before/after catalog lines print.

---

## Optional +30s

| Action | Why |
|--------|-----|
| `?store=neon-matcha` | Second merchant **65/100** |
| Native WebMCP flag | Badge **18 connected** — see CHATGPT-JUDGE.md |
| `npm run verify` | Automated proof |

---

## 18 WebMCP tools

`GET /api/v1/tools` · source: `src/webmcp/registerTools.ts`

**Constitution:** `prepare_checkout` never charges a card.
