# Duet

**Human + agent collaborative gift planning with WebMCP.**

Your agent searches the catalog and stages gifts per recipient. You approve on the same board before anything reaches the cart.

> WebMCP Challenge entry · [Devpost](https://webmcp.devpost.com/)

## Status

🚧 Slice 1 in progress — cloud build running.

## Quick start

```bash
npm install
npm run dev
```

Open in Chrome 149+ with `chrome://flags/#enable-webmcp-testing` or ChatGPT in-app browser.

## WebMCP tools

| Tool | Purpose |
|------|---------|
| `search_products` | Search catalog by recipient, budget, tags |
| `get_product` | Product details by id |
| `stage_for_recipient` | Stage item for a recipient (pending approval) |
| `get_staging_board` | Full board + staging state |
| `approve_staged` | Move staged item to cart |
| `reject_staged` | Remove from staging |
| `get_budget_status` | Budget remaining per recipient |

## License

MIT
