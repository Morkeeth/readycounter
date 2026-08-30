# Duet

**Human + agent collaborative gift planning with WebMCP.**

Your agent searches the catalog and stages gifts per recipient. You approve on the same board before anything reaches the cart.

> WebMCP Challenge entry · [Devpost](https://webmcp.devpost.com/)

## Quick start

```bash
npm install
npm run dev
```

Open in Chrome 149+ with `chrome://flags/#enable-webmcp-testing` enabled, or ChatGPT in-app browser.

## WebMCP tools

All tools register via `document.modelContext.registerTool` in `src/webmcp/registerTools.ts`.

| Tool | Purpose | Key inputs |
|------|---------|------------|
| `search_products` | Filter catalog | `recipient`, `max_price`, `tags[]` |
| `get_product` | Product by id | `id` |
| `stage_for_recipient` | Add to staging tray (pending) | `product_id`, `recipient` |
| `get_staging_board` | Full board state | — |
| `approve_staged` | Move staged → cart | `staging_id` |
| `reject_staged` | Remove from staging | `staging_id` |
| `get_budget_status` | Spent / staged / remaining | `recipient` (optional) |

## Local test (judges, no WebMCP required)

1. `npm install && npm run dev`
2. Open http://localhost:5173
3. Expand **Judge / dev tool harness** at the bottom
4. Click **Stage scarf for Mom** — item appears in Mom's yellow staging tray
5. Click **Approve** on the staged card — item moves to green cart
6. Click **Budget status** — JSON shows remaining budget per recipient

With WebMCP available, ask your agent: *"Search gifts for Dad under $100 and stage the earbuds."* The staging column updates live; approve or reject on the board.

## Build

```bash
npm run build
```

## Architecture

- **Vite + React + TypeScript** — single-page app, in-memory state
- **Zustand** — shared store mutated by WebMCP `execute` handlers and human UI
- **Staging loop** — `stage_for_recipient` → human approve → cart (constitution: no silent checkout)

## License

MIT
