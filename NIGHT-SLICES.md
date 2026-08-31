# ReadyCounter — night slices (all ambitious lanes)

**North star:** Lighthouse for agentic commerce — compare · width · before/after · measure · narrative.  
**Branch:** `night/gates-that-lie-2026-08-31`  
**Deadline:** Devpost Wed Sep 3, 2026 · 1pm PDT  
**Ambition lock:** `demo/AMBITION.md`

---

## How to read this

| Col | Meaning |
|-----|---------|
| **ID** | Slice — one verifiable unit |
| **Lane** | Parent cloud lane (RC-A/B/C) or Oscar gate (O/E) |
| **Size** | S ≈ 1–2h · M ≈ half night · L = own session |
| **Owner** | `cloud` = launchable lane · `oscar` = your click only |
| **Status** | ✅ done · 🔄 running · ⬜ todo · 🚫 blocked |

**Rule:** One slice = one done-when. No slice ships without `npm run verify` (or honest WRONG in receipt).

---

## Wave 0 — Already shipped (film these)

| ID | Done when | Status |
|----|-----------|--------|
| W0.1 | UCP GTIN column + filter on rankings | ✅ |
| W0.2 | Re-audit delta receipt (`audit-delta.ts`) | ✅ |
| W0.3 | MPN / identifier_exists in handbook + companion | ✅ |
| W0.4 | Film pack (`demo/voiceover.mp3`, teleprompter) | ✅ |
| W0.5 | Catalog budget only — never /100 on field crawl | ✅ |

---

## RC-A · Lighthouse UI (comparison · width · urgency · ease)

**Parent prompt:** `rc-lighthouse-ui-2026-08-31` · **Cloud agent:** [RC lighthouse UI](https://cursor.com/agents/bc-e4d48e65-abc9-476f-af3d-0f9b2761d875)

| ID | Slice | Size | Done when | Status |
|----|-------|------|-----------|--------|
| **A1** | **Connect hero** — lighthouse kicker, “148 stores parsed”, paste-URL CTA, 78.6% abandon (sources.ts only) | S | `IntegrationsPanel` / Connect header shows width + urgency; no stale 34/58 | ⬜ |
| **A2** | **Field compare strip** on audit success — host vs batch avg catalog, scrape GTIN, UCP GTIN if live | M | Audit result shows YOU · FIELD row with numbers from rankings join | ⬜ |
| **A3** | **Delta as hero** — re-audit layout: before → after → summary first; handbook below | S | `StorefrontAuditForm` delta above fold on second audit | ⬜ |
| **A4** | **Rankings deep link** — from audit: “See your vertical” + “UCP gap stores” filters pre-applied | S | Link lands on `/?view=integrations` with vertical or `ucp-gtin-gap` filter | ⬜ |
| **A5** | **Share receipt** — copy link `?audit_url=` + one-line field receipt for merchant paste | S | Button copies URL + receipt string to clipboard | ⬜ |
| **A6** | **Landing urgency** — hero microcopy “not ready for agents” without claiming live checkout fix | S | Landing/merchant intro cites VOID/checkpoint honestly | ⬜ |
| **A7** | **Percentile badge** (stretch) — “worse than N% of crawled field on GTIN” | M | Single percentile on audit when batch data exists | ⬜ |

**A done when:** Connect shows 148-width + compare on audit + delta prominent + verify green.

---

## RC-B · Measure Offer + ACP (insights on crawl)

**Parent prompt:** `rc-measure-offer-acp-2026-08-31` · **Cloud agent:** [RC Offer+ACP](https://cursor.com/agents/bc-19627ea2-b6a9-401e-95a1-f1a9cd2aa474)

| ID | Slice | Size | Done when | Status |
|----|-------|------|-----------|--------|
| **B1** | **Offer extractor** — % Product JSON-LD nodes with Offer+price+availability on crawl sample | M | `url-audit.ts` returns `offerPct`; unit logic in lib | ✅ |
| **B2** | **Audit API surface** — `POST /audit/url` includes `offerPct` + `policySmoke` in meta | S | `curl` colourpop returns both fields (null ok with reason) | ✅ |
| **B3** | **Audit UI chips** — Offer% + policy pass/fail on audit success panel | S | `StorefrontAuditForm` shows chips after audit | ✅ |
| **B4** | **Policy discovery** — find privacy + terms URLs from homepage/footer/JSON-LD | M | `policySmoke: { privacyUrl, termsUrl, privacyOk, termsOk }` | ✅ |
| **B5** | **Policy HTTP smoke** — GET each URL; 200 = ok; missing = honest null | S | Smoke runs in audit path; no false “eligible” | ✅ |
| **B6** | **Field review flags** — wire low `offerPct` → schema-offer; bad policy → acp-eligibility | S | `reviewAgainstField` fires when signals present | ✅ |
| **B7** | **Rankings signal** (stretch) — Offer% column or chip on crawled rows | M | Rankings table or API row includes `offerPct` | ⬜ |
| **B8** | **R7 experiment doc** — `research/experiments/R7-offer-on-crawl.md` with 3 hosts + numbers | S | File on disk with curl repro | ✅ |
| **B9** | **Verify script** — assert offer extractor on fixture HTML | S | `verify-url-audit.mjs` or sibling passes | ✅ |

**B done when:** audit returns offerPct + policySmoke; UI shows them; R7 doc exists; verify green.

---

## RC-C · Narrative + partner + stranger (say on film & Devpost)

**Parent prompt:** `rc-lighthouse-narrative-2026-08-31` · **Cloud agent:** [RC narrative](https://cursor.com/agents/bc-324a8bb5-fcf3-4b1e-976e-474e33ae205e)

| ID | Slice | Size | Done when | Status |
|----|-------|------|-----------|--------|
| **C1** | **`LIGHTHOUSE-VISION.md`** — one-pager: problem, product, 2027, NOT Shopify rails | S | File on disk; every stat cites sources.ts or field receipt | ⬜ |
| **C2** | **`SHOPIFY-PARTNER-BRIEF.md`** — why adopt/agent-listen; field 0% GTIN; UCP gap; open source | S | Partner tone; no competitor bashing | ⬜ |
| **C3** | **README hero** — stranger 60s: live URL → paste → rankings → delta | S | README opens with lighthouse + 3 steps | ⬜ |
| **C4** | **DEVPOST.md sync** — tagline, elevator, ambition paragraph = AMBITION.md | S | No stale 34/58; 18 tools; 78/148 | ⬜ |
| **C5** | **`STRANGER-PASS`** — cold run on live URL; embarrassments listed | S | `audits/STRANGER-PASS-2026-08-31.md` with timestamp | ⬜ |
| **C6** | **Embarrassment grep** — overclaims: live checkout fix, full /100, 16 tools | S | Grep report or fixes in copy | ⬜ |
| **C7** | **Night LOG** — `hack.md` or `LAUNCH.md` wave receipt | S | Section: slices shipped tonight | ⬜ |
| **C8** | **`ONBOARDING.md` agent path** — WebMCP tools + compare + rankings for builders | M | Agent section < 2 min read | ⬜ |

**C done when:** LIGHTHOUSE-VISION + partner brief + README + DEVPOST aligned; stranger pass on disk.

---

## RC-D · Stranger path (product, one flow)

**Depends:** A1–A5, C3. **Owner:** cloud or IDE after A/C land.

| ID | Slice | Size | Done when | Status |
|----|-------|------|-----------|--------|
| **D1** | **90s stranger script** — incognito, no login: audit colourpop → rankings filter → delta hint | S | `audits/STRANGER-PASS` includes step timing | ⬜ |
| **D2** | **Playwright smoke** — rankings UCP column + audit form loads | M | `test:e2e` covers Connect audit + rankings header | ⬜ |
| **D3** | **Film beats sync** — `launch.ts` DEMO_BEATS match teleprompter order | S | `npm run verify:launch` green | ⬜ |

---

## RC-E · Epistemic (stretch — needs OAuth)

**Blocked on Oscar shop connect.**

| ID | Slice | Size | Done when | Status |
|----|-------|------|-----------|--------|
| **E1** | OAuth pair ≥3 stores — Admin vs crawl GTIN table | L | `research/experiments/E1-oauth-pairs.md` + R2 table | 🚫 |
| **E2** | Compare API headline on film store | S | `POST /audit/compare` on glossier shows UCP GTIN | ⬜ |

---

## O · Oscar gates (cloud MUST NOT)

| ID | Slice | Owner | Done when |
|----|-------|-------|-----------|
| **O1** | Record film | Oscar | `demo/demo-final.mp4` ≤2:30 |
| **O2** | Upload YouTube | Oscar | Incognito plays |
| **O3** | `vercel --prod` | Oscar | Rankings 78/148 live |
| **O4** | Devpost submit | Oscar | Before Sep 3 1pm PDT |
| **O5** | Connect Shopify OAuth | Oscar | Enables E1 |

---

## Dependency graph

```
W0 (shipped) ─────────────────────────────────────────┐
                                                        │
A1 hero ──► A2 compare ──► A4 rankings link            │
              └──► A3 delta ──► A5 share               │
A6 urgency (parallel)                                   │
                                                        │
B1 offer extract ──► B2 API ──► B3 UI                  │
B4 policy find ──► B5 HTTP ──► B6 review flags          │
B8 R7 doc + B9 verify (parallel)                        │
                                                        │
C1 vision ──► C2 partner ──► C4 DEVPOST                │
C3 README ──► C5 stranger ──► C6 embarrassment         │
                                                        │
D1 stranger (needs A,C) ──► D2 e2e ──► O1 film         │
                                                        │
E1 (needs O5 OAuth)                                     │
```

---

## Tonight priority order (if lanes stall)

1. **A1 + A2 + A3** — judges see compare + delta (film-critical)
2. **C1 + C3 + C4** — Devpost paste ready
3. **B2 + B4 + B5** — one new measured line (Offer or policy)
4. A4, A5, B8, C5, D2 — stretch
5. E1 — only after OAuth

---

## Relaunch one slice

```bash
export CURSOR_API_KEY="$(security find-generic-password -s cursor-api-key -w)"
cd ~/CODE/zup
# Examples — stem = file under docs/cloud-prompts/
~/CODE/zup/scripts/launch-cloud-lane.sh rc-s1-lighthouse-2026-08-31 tooltruth-webmcp night/gates-that-lie-2026-08-31 "RC-S1 hero"
~/CODE/zup/scripts/launch-cloud-lane.sh rc-s2-offer-acp-2026-08-31 tooltruth-webmcp night/gates-that-lie-2026-08-31 "RC-S2 measure"
~/CODE/zup/scripts/launch-cloud-lane.sh rc-s3-partner-devpost-2026-08-31 tooltruth-webmcp night/gates-that-lie-2026-08-31 "RC-S3 narrative"
```

Granular stems (add as needed): `rc-a2-field-compare-2026-08-31`, `rc-b4-policy-smoke-2026-08-31`, etc.

---

## Morning harness review

```bash
node ~/CODE/zup/scripts/cloud-harness.js review readycounter
cd ~/CODE/tooltruth-webmcp && git pull && npm run verify
```

Tick slices ✅ in this file as they land.
