# ReadyCounter / Tooltruth — hypotheses & decisions (discuss Mon 31 Aug)

**Status, 31 Aug ~00:30 CEST:** research, DEVPOST copy and brand are **done and
committed**. Decisions 1, 2, 3 were ruled by Oscar; Decisions 4, 5b and 7 were
ruled on the night run and are listed with their reasoning so Oscar can veto any
of them cheaply. Decision 6 (deploy) and Decision 6b (who owns `main`) are still
his. The tool count is **13**, not 10 — the docs said 10 for a day.

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

## Decision 4 · Brand — RULED (night run, 31 Aug ~00:30 CEST)

**Ruled: THE COUNTER. Signature device = the readiness tape.**
Oscar has the veto; this is the ruling made in his absence so the build could
continue, and reversing it is one CSS file plus one component.

The standing candidate was the score ring. **It was rejected.** A progress ring
is a component-library element, and the design-taste skill bans exactly that —
the device must come from the subject. It also carries one number and throws
away the arithmetic behind it, which is the entire product claim.

### The three directions considered

**A · THE COUNTER — a printed till receipt.** *(chosen)*
Claim: *the score is an itemised bill, not a gauge.* The subject is a shop
counter where an agent is served or turned away, and the artifact a counter
produces is a receipt. Line items, leader dots, a measured column and an
allocated column, a total, and one red **CHECKOUT VOID** stamp for the refusal.
Passes the slop test: remove the tape and you lose the per-point arithmetic, so
it is a device, not decoration. It is also the only direction where the visual
form *is* the defensibility argument.

**B · Departures board.** Claim: *agent traffic is arrivals and departures.*
Split-flap, dark, big type. Rejected: it lands straight back in the dark-console
cluster, split-flap is a current trend tell, and it carries no arithmetic.

**C · Storefront elevation / blueprint.** Claim: *readiness is a floor plan and
CAPTCHA is a locked door.* Drafting cyan on paper. Rejected: pretty, and the
plan cannot show why a point was lost — it would be decoration over the real
content.

### Tokens (frozen)

Palette lifted from thermal receipt stock under counter light: paper `#f6f6f1`,
counter `#d6d8d0`, ink `#14171a`, **one** accent — stamp red `#bf2b1a`, used for
refusals only. Square corners everywhere. Two faces: **Bricolage Grotesque**
(names, the one hero number) and **JetBrains Mono** (the tape — tabular data is
the only thing mono does here). Deliberately not warm cream, not a serif, not a
dark dashboard, and no ring anywhere in the codebase.

Rendered and inspected at 1440px and a true 390px viewport before shipping:
`docs/shots/`. Six defects were caught on screen that were invisible in correct
source — see Decision 7.

---

## Decision 5b · Score weighting — RULED (night run)

**Ruled: 100 points, 50 measured and 50 admitted as ours.**

The old score averaged five checks at equal weight, which quietly asserted that
a missing GTIN costs a merchant as much as a CAPTCHA. It now allocates:

| Check | Points | Basis |
|---|---|---|
| Price feed agrees with the shelf | 26 | **measured** — Presenc AI's 26% |
| Checkout path an agent can finish | 24 | **measured** — Presenc AI's 24% |
| Catalog an agent can read | 20 | allocated by us |
| Structured tool surface | 20 | allocated by us |
| Availability stated, not implied | 10 | allocated by us |

The half we invented is labelled on the line, in the header, and in
`research.md`. An account wall is charged the same 24 as a CAPTCHA **and says so**,
because no published figure prices it separately.

`scripts/verify-score.mjs` fails the build if a measured weight ever stops
equalling its published figure. Proven red by tampering 24 → 30.

---

## Decision 6b · Two agents may push main — NEEDS OSCAR

`DECISIONS.md` gives the cloud lane a done-when that includes *"`main` pushed"*,
and the night-run brief for this lane also authorises pushing main. On the night
of 30 Aug two cursor-agent processes were writing this repo while this lane ran.
**Two writers, one branch, nothing coordinating them.** This night run therefore
worked in `.worktrees/nightrun-l3` off `origin/main` and never touched the live
checkout. The process needs one owner for `main`; that is Oscar's call.

---

## Decision 7 · The demo was broken and nobody could see it — FIXED

**Found on the night run: the Shop + order tab white-screened on `main`.**

React error #185 (maximum update depth). `useShopStore((s) => s.getOrder())`
built a fresh object on every call, so `useSyncExternalStore` saw a new snapshot
each pass. Reproduced by building `dd90f26` in a scratch worktree — it is **not**
a night-run regression. The co-shop flow, which is the demo, had been dead in the
committed tree.

It was invisible because every test passed: the verify scripts exercise the
store directly and never render a component. It only appeared on screen.

Five more found the same way, all invisible in correct-looking source:

1. The landing screen printed a **hardcoded readiness score of 72**.
2. `index.css` set a cream light theme that `App.css` silently overrode.
3. An empty order quoted **$6.50 shipping on a $0.00 total**.
4. The tool toast had a **pulsing dot** — a named slop tell.
5. `verify-readiness` and `verify-stores` printed `false` and exited **0**, and
   `verify-stores`' "failure modes differ" compared a CAPTCHA flag on one store
   to an account flag on the other, passing by accident.

All fixed; the verify scripts now assert and exit non-zero.

---

## Decision 4-old · Brand (superseded by Decision 4 above)

Cloud was doing a readiness-score signature device. **Superseded 31 Aug.**

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
