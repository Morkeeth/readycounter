# Moonshot memo · ReadyCounter · 2026-09-03

## GOAL
A stranger opens a **ReadyCounter**-named URL, pastes their store, and gets a score + top-three fixes before Devpost submit tonight.

## Current model (what we believe)
Product is ReadyCounter. Infra still says ToolTruth because that was the killed working title. Judges will notice the URL. The stranger path is built but not on `main`. Deadline is **today 22:00 Paris**.

## External evidence
| Source | What it says | Confidence |
|--------|--------------|------------|
| `hack.md` 2026-08-30 | ReadyCounter ruled; Duet/ToolTruth killed | high |
| UI / `package.json` | Brand is ReadyCounter / `readycounter` | high |
| GitHub + Vercel | Still `tooltruth-webmcp` | high |
| Vercel rename KB | Rename is safe for project ID; old `*.vercel.app` not guaranteed | high |
| EYES prior | TOP-25 stretch TOP-10 — execution risk is arrive-and-use | med |

## Hypotheses (ranked)
1. **Brand fossil is embarrassing, not structural** — Devpost title = ReadyCounter; URL fossil is survivable if stranger path works. Kill bar: judge notes "tooltruth" in first 10s. Cost: low (copy + optional alias).
2. **Unmerged stranger path is the real miss** — `/` on prod still isn't domain→score first. Kill bar: cold open without README fails 60s test. Cost: medium (merge + deploy + verify).
3. **Rename GitHub today** — breaks every submitted link mid-window. Kill bar: any 404 on clone/Devpost. Cost: high. **NO.**

## Refute result
Hypothesis 3 dies on deadline day. Hypothesis 1 alone is cosmetics. **Surviving: merge stranger (2) + optional Vercel alias `readycounter.vercel.app` while keeping old URL (1).** Do not rename the GitHub repo before submit.

## Collision check
| Idea | Already fired? | Verdict |
|------|----------------|---------|
| Stranger path UI | Built on `day/stranger-path-2026-09-02` | Merge now |
| KV rankings cold-start | Shipped on main | Done |
| Full GitHub rename | Never | Block until after submit |
| Custom domain (oscarintuscany etc.) | Owned, unrelated | Skip today |

## BUILD-PLAN (Loop 2)
1. **Merge stranger → main** — done when: `npm run verify` green · prod `/` shows domain input · colourpop scores · film beats still work
2. **Alias ReadyCounter URL** — done when: `readycounter.vercel.app` (or project rename with old URL retained) serves same deploy · Devpost lists ReadyCounter URL first
3. **Docs pass** — done when: SUBMIT-READY / DEVPOST lead with ReadyCounter URL; `tooltruth-webmcp` only as repo path

## OPS (Loop 4 — Oscar)
- Film · YouTube · Devpost — not agent
- GitHub rename — after deadline

## Explicitly NOT doing
| Could do | Why not now |
|----------|-------------|
| Rename GitHub repo | Breaks clone + every written URL today |
| Buy new custom domain | DNS lag; no time |
| Rebuild film for new URL | Oscar owns film; old URL still works |
