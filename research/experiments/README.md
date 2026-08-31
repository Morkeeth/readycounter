# Research experiments

Reproducible field studies for ReadyCounter. Every experiment ships:

1. **Hypothesis** (falsifiable)
2. **Method** (exact command)
3. **Artifact** (`audits/batch-YYYY-MM-DD.json` + KV key)
4. **Finding** (one headline stat + caveats)
5. **Verify** (assertion in `scripts/verify-*` if claim enters product)

## Queue

| ID | Status | Hypothesis | Command |
|----|--------|------------|---------|
| **R1** | complete | DTC public feeds lack GTIN | v4: 78/148 crawled, 0% GTIN |
| **R2** | complete | OAuth catalog score ≫ URL crawl | `POST /api/v1/audit/compare` · A2 panel |
| **R3** | complete | HTML captcha hints overstate checkout walls | batch hints vs journey methodology |
| **R4** | complete | Journey fails at checkout when flags set | `npm run audit:journey` |
| **R5** | complete (method) | ReadyCounter complements Shopify scanner | R5 doc · compare API |
| **E3** | complete | UCP census on curated list | 81/148 available · 13 with GTIN |
| **E1** | blocked | OAuth Admin vs crawl GTIN | `npm run audit:oauth-pairs` — needs shop |

**Published findings:** `research/FINDINGS-D3.md` · **Merchant handbook:** `research/HANDBOOK.md`

## Template (`R{n}-{slug}.md`)

```markdown
# R{n}: Title

**Date:** YYYY-MM-DD  
**Hypothesis:** …  
**Method:** `npm run audit:shops -- …`  
**N:** … stores  
**Result:** …  
**Caveat:** URL crawl only; checkout NOT MEASURED unless noted  
**KV:** rc:render:audit-batch:latest at …  
```
