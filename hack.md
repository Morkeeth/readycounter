# Duet — WebMCP Challenge

## NORTH STAR

A group gift-planning web app where your agent can search and stage items, but **nothing hits the cart until a human approves it on the same page**.

## PROMISE LINE

**You get a shared gift board per recipient with a live staging tray — your agent proposes, you conduct.**

Constraint: every cart mutation flows through `stage_*` → human approve → `commit_*`. No silent checkout.

## OPEN QUESTIONS

- [ ] **Name on Devpost** — working title `Duet`. Oscar rules before submit.
- [ ] **Demo vertical** — group gifts (default) vs trip planning. Gifts unless ruled otherwise.
- [ ] **Deploy host** — Vercel (judge Jude Gao) vs Cloudflare. Default Vercel.

## CONSTITUTION

1. WebMCP tools are the **only** agent path to mutate app state — no DOM scraping fallbacks.
2. Every write tool either stages (pending) or requires an approved proposal id.
3. Human UI always shows pending proposals with approve/reject before commit.
4. Public repo, MIT license, `document.modelContext.registerTool` in source.
5. Outward acts (deploy, Devpost, video) are Oscar's click — cloud ships code + README test instructions.

## PLAN (risk-first)

| Slice | Risk | Done when |
|-------|------|-----------|
| **1** | WebMCP tools actually register and execute in Chrome/ChatGPT browser | `npm run dev` → 6+ tools callable; staging state updates |
| **2** | Human staging UI — per-recipient columns, approve/reject | Visual board reflects tool calls within 1s |
| **3** | Budget + constraint tools | `get_budget_status` blocks overspend staging |
| **4** | Deploy + stranger README | Live URL + 5-step judge test block |
| **5** | Demo polish + video spine doc | `DEMO-SCRIPT.md` <3 min beats |

## NOW

**Slice 3** — Budget enforcement: block `stage_for_recipient` when it would exceed remaining budget; surface overspend in UI.

## LOG

- 2026-08-30 — Repo + hack.md created. Novelty gate PASS. Cloud lane launching.
- 2026-08-30 — **Slice 1+2 shipped.** Vite+React+TS scaffold; 12-product catalog; 7 WebMCP tools via `registerTool`; Zustand shared state; 3-column staging board with approve/reject, budget bars, tool-activity toast, dev harness for judges without WebMCP.
  - **Failed first:** infinite render loop from `getStagingBoard()` / `getBudgetStatus()` in Zustand selectors (new object every tick). Fixed by selecting raw `staged`/`cart` arrays and `useMemo` for derived views.
  - **Not verified:** real Chrome WebMCP agent invocation (no WebMCP flag in this VM). Dev harness + store path verified in browser.
