# Judge criteria map — WebMCP Challenge

**Use this when writing Devpost, filming, or answering judge questions.**  
Each criterion → evidence → one click.

| Criterion | What judges ask | ReadyCounter proof | One click |
|-----------|----------------|-------------------|-----------|
| **WebMCP Leverage** | Did you use WebMCP skillfully? Non-trivial tools? | **18** `registerTool` handlers · shared co-shop state · `prepare_checkout` constitution | `/?judge=1` → Co-shop tab · or `CHATGPT-JUDGE.md` Path A |
| **Execution** | Complete product, not a POC? | Live URL · verify scripts · film · Playwright e2e · itemised bill UI | `npm run verify` · `JUDGE-60s.md` |
| **Potential Impact** | Real problem, real audience? | **78.6%** agent cart abandon (Presenc) · **0%** scrape GTIN on **78/148** crawled · **11** UCP gaps | `GET /api/v1/rankings` · paste colourpop audit |
| **Creativity & Ambition** | Novel vs existing? | UCP≠scrape insight · Presenc-weighted bill (not invented weights) · delta receipt · field lighthouse | Rankings UCP filter · re-audit delta |

---

## 90-second judge script (live)

1. **`/?judge=1`** — lands Co-shop · add item · banner shows WebMCP paths
2. **Connect → Agent tool console** — `add_to_order` → `get_order` → `prepare_checkout` (refuses)
3. **Readiness** — CAPTCHA off → **70→94** (exactly 24 pts)
4. **Connect** — audit colourpop → filter **UCP GTIN · scrape empty** → **11** rows
5. **Re-audit** — delta receipt

Full timing: [`JUDGE-60s.md`](../JUDGE-60s.md) · native WebMCP: [`CHATGPT-JUDGE.md`](../CHATGPT-JUDGE.md)

---

## Humans + agents together (hackathon thesis)

> What can people and agents do together that was difficult before?

| Before | With ReadyCounter |
|--------|-------------------|
| Merchant sees vanity SEO score | Itemised bill — each line cites Presenc row + our test |
| Agent and human separate carts | **One order** — HUMAN/AGENT chips · same `prepare_checkout` |
| Scrape GTIN assumed truth | **11 stores** return GTIN on UCP while scrape is **0%** |
| Fix invisible | **Re-audit delta** — before/after merchants can share |

---

## Honest limits (say once — builds trust)

- Field URL audit = **catalog budget only** · checkout NOT MEASURED until OAuth
- E1 OAuth Admin↔crawl pairs not done
- `prepare_checkout` **never charges a card**

---

## Devpost paste spine

**Tagline:** Agent commerce. Now reviewable. Proof.

**One sentence:** Lighthouse for agentic commerce — **148** brands parsed, paste your URL, compare to the field, prove checkout with **18 WebMCP tools** in one tab.

**Built with:** React · TypeScript · Vite · WebMCP · Render KV · Vercel
