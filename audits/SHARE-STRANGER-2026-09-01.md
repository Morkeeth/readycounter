# Share stranger pass — production incognito

**Run:** 2026-09-01T06:25:00Z (UTC)  
**URL:** https://tooltruth-webmcp.vercel.app  
**Method:** Playwright fresh browser context (incognito-equivalent) · `e2e/share-stranger.spec.ts`  
**Runner:** automated + manual path verification

---

## What I did

1. Opened **Connect** on production (no login, no prior localStorage in guest context).
2. Expanded **Import JSON manually** and pasted a one-SKU Shopify export (`Stranger Tea Co` / `Stranger Matcha Tin`).
3. Clicked **Import catalog** — store appeared in **Switch store** after focus (`import-stranger-tea-co`).
4. **Co-shop** tab → **Add** → line item visible in order panel.
5. **Copy cart link** → clipboard URL contains `?co=` and `store=import-stranger-tea-co`.
6. Opened link in a **new browser context** (incognito-equivalent).

---

## What I saw (guest context)

| Check | Result |
|-------|--------|
| `?co=` param present | **PASS** |
| Store name in switcher | **PASS** — Stranger Tea Co |
| Product in order | **PASS** — Stranger Matcha Tin visible |
| Catalog embedded (v2 payload) | **PASS** — guest did not need prior visit or localStorage |
| Live session button | **N/A** — removed on branch (was misleading on serverless) |

**Command:**

```bash
PLAYWRIGHT_BASE_URL=https://tooltruth-webmcp.vercel.app npx playwright test e2e/share-stranger.spec.ts
# exit 0 · 1 passed (2026-09-01)
```

---

## Verdict

**Share link is the demo.** Imported catalog + cart survives incognito via `?co=` v2 embed. No fix required for catalog carry on this path.

---

## Notes

- Import clears the textarea on success — **Import catalog** disables again; that is expected.
- Builtin demo stores (`ember-oak`) share without v2 embed; judges testing **import** path should use Connect import or URL audit (custom `storeId`).
- Branch removes **Start live session** — KV rooms are not judge-safe on serverless cold starts.
