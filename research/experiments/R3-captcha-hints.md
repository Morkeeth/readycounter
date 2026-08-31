# R3: HTML captcha hints vs agent journey

**Date:** 2026-08-31  
**Status:** complete (batch analysis)

## Hypothesis

HTML captcha **hints** on storefront homepages overstate actual checkout CAPTCHA walls — agents may pass catalog tools but fail at `prepare_checkout` for other reasons.

## Method

```bash
npm run audit:batch -- --publish   # captchaHint per store
npm run audit:journey              # journey pass rate on batch stores
```

Compare `captchaHint` from homepage HTML scan vs `checkoutBlocked` from `simulate_agent_journey` on imported catalog (sandbox merchant flags default off for crawled stores).

## Results (2026-08-31 batch v1, n=16 crawled)

| Signal | Count |
|--------|-------|
| HTML captcha hints | **14/16** (87.5%) |
| Journey blocked at checkout | **0/16** on crawl imports* |
| Journey blocked at catalog | **0/16** (products imported) |

\* Crawled stores import with `checkoutRequiresCaptcha: false` — journey cannot confirm checkout wall without D2 probe or merchant OAuth + live flags.

## Finding

**HTML hints are a noisy upstream signal.** 87% of crawled DTC homepages contain captcha-related strings, but URL crawl cannot observe checkout behaviour. Presenc's **24% CAPTCHA abandonment** applies at checkout, not homepage HTML.

ReadyCounter correctly labels checkout lines **NOT MEASURED** on crawls and uses sandbox toggles + agent journey on demo stores to prove the scoring model.

## Caveats

- Journey on crawl imports uses default merchant flags (not live checkout)
- R3 full test needs D2 checkout probe worker or OAuth + live Shopify checkout read

## Evidence

- `audits/batch-2026-08-31.json` — `captchaHint` column
- `scripts/journey-batch.mjs`
- `src/lib/agent-journey.ts`

## Next

- R4: journey pass rate on **demo** stores with CAPTCHA on (ember-oak)
- D2: headless checkout probe on consented live stores
