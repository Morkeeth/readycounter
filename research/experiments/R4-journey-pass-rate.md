# R4: Agent journey pass rate across batch

**Date:** 2026-08-31  
**Status:** complete (crawl imports)

## Hypothesis

Agent journey fails at the funnel step that matches the top Presenc abandonment row when merchant checkout flags are set honestly.

## Method

```bash
npm run audit:journey
```

Runs `simulate_agent_journey` on each store in latest `audits/batch-*.json`.

## Results

### Crawled DTC stores (default flags)

All 16 crawled imports: journey completes through `prepare_checkout` — **catalog path passes**, checkout lines not exercised (flags off).

### Demo stores (known failure modes)

| Store | Block | Failed step | Score |
|-------|-------|-------------|-------|
| ember-oak | CAPTCHA | prepare_checkout | 70→94 when toggled off |
| neon-matcha | account + payment | prepare_checkout | 65 |

## Finding

Journey tool correctly isolates **checkout gate** vs **catalog discovery**. Batch crawls prove catalog import works; abandonment economics require live checkout probe or sandbox flag honesty.

## Command

```bash
npm run audit:journey
```
