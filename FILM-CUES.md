# Film cue cards — Oscar

Timestamped beats. Not a script rewrite — glance at these while recording.  
Full spine: [`DEMO-SCRIPT.md`](./DEMO-SCRIPT.md).

**Live URL:** `https://YOUR-APP.vercel.app` _(Oscar fills after deploy)_  
**Store B URL:** `?store=neon-matcha`

---

## 0:00 — HOOK (5 sec)

| Cue | Action |
|-----|--------|
| Screen | Merchant tab · Ember & Oak · score ~50/100 · CAPTCHA ON |
| Say | "AI traffic is up 8×. Most stores lose agents silently." |
| Don't | Open README. Stay in the product. |

---

## 0:15 — INSTANT USE (10 sec)

| Cue | Action |
|-----|--------|
| Screen | Landing → **Start co-shopping** → add one bag |
| Say | "No signup. One tab. Under ten seconds." |
| Proof | Order panel shows line in <10s |

---

## 0:30 — CO-SHOP (20 sec)

| Cue | Action |
|-----|--------|
| Screen | Judge harness → `add_to_order` → `get_order` |
| Say | "Same order — human and agent. Compare, don't auto-buy." |
| Proof | `addedBy: human` / `agent` badges on both lines |

---

## 0:55 — READINESS A (15 sec)

| Cue | Action |
|-----|--------|
| Screen | Merchant tab · Ember & Oak |
| Point | CAPTCHA check FAIL · stale feed on Brew Scale · GTIN gap |
| Say | "Merchants see *why* agents abandon — not a black box." |

---

## 1:10 — PLATFORM PIVOT (25 sec) ★ new beat

| Cue | Action |
|-----|--------|
| Screen | Header **Demo store** dropdown → Neon Matcha Lab |
| Say | "Two merchants, one fork. Same platform." |
| Run | Harness → `get_readiness_score` on each store |
| Proof | Score drops · failure mode switches CAPTCHA → account wall |
| URL bar | Flash `?store=neon-matcha` |

---

## 1:35 — CHECKOUT GATE (15 sec)

| Cue | Action |
|-----|--------|
| Screen | Ember & Oak · CAPTCHA ON · harness `prepare_checkout` → blocked |
| Toggle | CAPTCHA off → score rises → `prepare_checkout` succeeds |
| Say | "Never charges a card. Human pays." |

---

## 1:55 — SHARE LINK (15 sec)

| Cue | Action |
|-----|--------|
| Screen | Add item → **Copy co-shop link** |
| Say | "Send one URL — friend or agent browser sees the same order." |
| Optional | Incognito paste — order hydrates |

---

## 2:15 — DEV STORY (15 sec)

| Cue | Action |
|-----|--------|
| Screen | `src/webmcp/registerTools.ts` OR badge "WebMCP live · 10 tools" |
| Say | "Ten structured tools. Fork your catalog in five minutes." |
| Point | [`FORK.md`](./FORK.md) in repo |

---

## 2:30 — CLOSE (10 sec)

| Cue | Action |
|-----|--------|
| Screen | Live URL + repo link |
| Say | "ReadyCounter — readiness for merchants, tools for developers, co-shop for humans." |

---

## Pre-flight (run once)

```bash
npm run verify
```

All green → film. Any red → fix before camera.

## Stranger test (4 yes → record)

1. Add item <10s without reading docs?
2. Harness updates same order?
3. Store switch changes score + blocker?
4. One-sentence pitch without saying "MCP" three times?
