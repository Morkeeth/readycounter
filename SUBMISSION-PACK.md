# Submission pack — ReadyCounter · WebMCP Challenge

**Deadline:** Wed 3 Sep 2026 @ 22:00 CEST  
**Devpost:** https://webmcp.devpost.com/

---

## Live URL

```
PASTE VERCEL URL HERE AFTER DEPLOY
```

## Repo

https://github.com/Morkeeth/tooltruth-webmcp

## Copy-paste fields

See [`DEVPOST.md`](./DEVPOST.md) for full text.

| Field | Value |
|-------|-------|
| **Name** | ReadyCounter |
| **Tagline** | Agent-ready storefront with readiness score + co-shop |
| **Built with** | React, TypeScript, Vite, WebMCP, Zustand |

## Testing instructions (judges)

1. Open **live URL** (no WebMCP flag required)
2. Click **Start co-shopping**
3. Add a product → refresh → order persists
4. **Copy co-shop link** → open in incognito → same order
5. Switch store to **Neon Matcha Lab** → Merchant tab → different readiness failure (account wall)
6. Expand **Judge harness** → run `get_readiness_score` + `prepare_checkout`
7. Optional: Chrome `chrome://flags/#enable-webmcp-testing` → 13 tools register live

## Video spine

See [`DEMO-SCRIPT.md`](./DEMO-SCRIPT.md) — lead with share link, not harness.

## Sealed prediction (before submit)

| Prediction | Kill bar |
|------------|----------|
| Judges click live URL | ≥1 partner comment mentions merchant readiness |
| Share link demo | Film shows incognito same-order |

---

## Oscar-only clicks

- [ ] Deploy Vercel
- [ ] Paste URL above
- [ ] Upload video
- [ ] Submit Devpost
