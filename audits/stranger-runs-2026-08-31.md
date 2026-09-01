# Stranger + judge runs — 2026-08-31

Automated cold-path checks while Oscar away. **Film + Devpost still need Oscar.**

## Stranger URL audits (no login)

Three URLs not in curated batch — paste-audit path:

| URL | Result | Catalog | GTIN% | Notes |
|-----|--------|---------|-------|-------|
| https://www.neonmatcha.example | N/A — use live demo store | — | — | Built-in `neon-matcha` |
| https://colourpop.com | crawl OK | 0/24 | 0% | Same as batch |
| https://www.rarebeauty.com | crawl OK | 0/24 | 0% | beauty vertical |
| https://magicspoon.com | crawl OK | 0/24 | 0% | food vertical |

Command: `curl -s -X POST …/api/v1/audit/url -d '{"url":"…"}'`

## Degraded judge path (`JUDGE-60s.md`)

| Step | Pass | Notes |
|------|------|-------|
| Landing → Shop | ✅ | co-shop works |
| Connect → agent tools | ✅ | 18 tools |
| Readiness ember-oak CAPTCHA | ✅ | 70/100 · journey blocks |
| neon-matcha account wall | ✅ | 65/100 score |
| URL audit on Connect | ✅ | persists to KV |
| Rankings table | ✅ | 16/21 from KV |
| Agent journey button (B1) | ✅ | Readiness tab |
| Crawl vs OAuth (A2) | ✅ | panel on Readiness |

## Updated judge doc

`JUDGE-60s.md` updated: 18 tools, audit-first flow, rankings, journey button.

## Oscar still needed

- [ ] Film `DEMO.md` (~90s)
- [ ] Devpost submit (Wed Sep 3 2026 1pm PDT)
- [x] Real stranger incognito on production URL — see `audits/SHARE-STRANGER-2026-09-01.md`
- [ ] OAuth paired compare on dev store
