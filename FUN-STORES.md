# Fun sandbox stores

Six built-in merchants — each a **different Presenc abandonment row**. Tap a card on **Connect → Sandbox stores** or use `?store=` deep links.

| Store | Score* | Profile | What breaks |
|-------|--------|---------|-------------|
| **Agent Paradise Co.** | 100 | ✨ golden-path | Nothing — control group |
| **Midnight Vinyl Club** | ~82 | 📡 feed-drift | Feed price ≠ shelf (18% row) |
| **Ember & Oak Coffee** | 70 | 🧱 captcha-wall | CAPTCHA (24% row) |
| **Neon Matcha Lab** | 65 | 🔐 account-wall | Forced account (15% row) |
| **Ghost Goods** | ~58 | 👻 stale-shelf | 5/8 SKUs OOS (26% row) |
| **Chaos Pets Supply** | ~28 | 💥 multi-wall | CAPTCHA + account + no payment |

\*Scores computed live — `npm run verify` asserts all six are unique.

## Deep links

```text
/?store=agent-paradise&view=merchant   # film the happy path
/?store=chaos-pets&view=merchant       # film the disaster
/?store=midnight-vinyl&view=merchant   # autopilot sync feed prices
/?store=ghost-goods&view=merchant      # stale checkout row
```

## Test cases

| ID | Command |
|----|---------|
| `tc-sandbox-paradise` | e2e: agent-paradise shows 100 |
| `tc-sandbox-chaos` | e2e: chaos-pets 0/24 · 0/15 · 0/11 |
| `tc-sandbox-feed-drift` | manual: midnight-vinyl autopilot |
| `tc-sandbox-stale-shelf` | manual: ghost-goods freshness line |

## Fun batch URLs

`audits/curated-dtc.json` → **fun** vertical: Liquid Death, Dr. Squatch, MeUndies, Olipop, Cotopaxi…

```bash
npm run audit:batch -- --publish
```
