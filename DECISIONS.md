# ReadyCounter / Tooltruth — hypotheses & decisions (discuss Mon 31 Aug)

**Status:** Cloud lane **ACTIVE** overnight (`bc-15da7e22`) — research, DEVPOST copy, brand polish, push.
**Do not rule these until we read cloud output tomorrow.**

---

## Hypothesis (the bet)

> AI commerce demand is real; merchants lose agent traffic on **infrastructure** (CAPTCHA, stale feeds, thin schema), not agent quality. WebMCP wins when stores expose **structured tools** + **human-in-tab co-shop** — bridging the 65% compare / 14% auto-buy gap.

**If true:** judges + Shopify/Vercel partners care about merchant readiness + forkable storefront, not another HITL staging tray or KYA verifier.

**If false:** room wants novelty (interpreter, unsubscribe, war-room) and we placed wrong.

---

## Decision 1 · Name on Devpost

**RULED Mon 31 Aug 2026 — Oscar: ReadyCounter.**

| Option | Pros | Cons |
|--------|------|------|
| **ReadyCounter** ✅ | Matches build; merchant readiness is the hook | New, no SEO |
| ~~Tooltruth~~ | — | KYA-shaped; killed |
| ~~CoShop~~ | — | Generic |

Repo stays `tooltruth-webmcp` unless renamed later. Devpost title: **ReadyCounter**.

---

## Decision 2 · Hackathon scope vs real product

**RULED Mon 31 Aug 2026 — Oscar: Product. Ambitious. Use instantly.**

Not a judge-only demo. Strangers open a URL and co-shop immediately — no README, no harness required, no signup to start.

| Ship by Wed 3 Sep | Defer past submit |
|-------------------|-------------------|
| Live deploy (Vercel) | Shopify Catalog sync |
| Session persistence (order survives refresh) | Full merchant auth / multi-tenant |
| Default store loads instantly — shop + agent tools work in-tab | Payments |
| Readiness dashboard on real persisted funnel | Enterprise onboarding |
| `research.md` + defensible pitch | — |

**Devpost framing:** ship the product, not a roadmap slide. One live URL in the submission.

**Instant-use test:** stranger opens link → adds item → refreshes → order still there → agent harness optional, WebMCP bonus.

---

## Decision 3 · Who needs login (real product)

**Aligned with Decision 2 — instant use means no login to start.**

| Actor | Wed ship | Post-submit |
|-------|----------|-------------|
| Shopper | **No login** — open URL, co-shop | Cookie session (already enough) |
| Agent | WebMCP tools on live site | Tools → API when multi-store |
| Merchant | Tab + persisted config (localStorage first) | Login when multi-merchant |
| Developer | Fork repo + live example URL | API keys |

---

## Decision 4 · Brand (after cloud delivers)

Cloud is doing a readiness-score signature device. Tomorrow:

1. Accept cloud direction, or
2. Run `/design-taste` Gate 1 (3–4 directions) before film

**Constraint:** Film is Wed — brand must freeze **Mon/Tue**.

---

## Decision 5 · Research defensibility

Cloud is primary-sourcing `hack.md` stats. Tomorrow:

- Spot-check 2–3 URLs (Shopify 2×, Presenc 24%, 65/14 gap)
- If any stat fails → cut from pitch or soften wording

**Worst case:** keep qualitative "agents abandon on CAPTCHA and stale feeds" without percentages.

---

## Decision 6 · Deploy target

**Recommended default (product + Vercel partner in room): Vercel.**

Oscar clicks deploy once cloud + persistence slice land. Not blocking tonight.

---

## Tomorrow agenda (30 min)

1. **Harness review** — `node ~/CODE/zup/scripts/cloud-harness.js review tooltruth-webmcp`
2. **Rule name** (Decision 1)
3. **Accept or redo brand** (Decision 4)
4. **Spot-check research** (Decision 5)
5. **Pick deploy** (Decision 6)
6. **Film slot** — when Wed?

---

## Cloud overnight (already running)

- Prompt: `~/CODE/zup/docs/cloud-prompts/wave-tooltruth-slice3-2026-08-30.md`
- Watch: https://cursor.com/agents/bc-15da7e22-21be-4f26-9ac4-4544e16aa876
- Receipt: `~/CODE/zup/docs/CLOUD-LAUNCH-RECEIPT-2026-08-30-tooltruth.md`

**Done when cloud finishes:** `research.md`, `DEVPOST.md`, brand polish, `main` pushed.
