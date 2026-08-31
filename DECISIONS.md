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

## Decision 5b · Score weighting — RULED (night run) · **SUPERSEDED 2026-08-31 by 5c**

> The weights and the account-wall sentence below are the historical record, not
> the shipped behaviour. **Decision 5c** replaces them. Kept verbatim because the
> mistake it contains is the point.

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

## Decision 5c · The account wall gets its own published price — RULED 2026-08-31

**Ruled: 100 points across SIX checks, 65 measured and 35 admitted as ours.**

**What was wrong.** Decision 5b charged a forced-account checkout the CAPTCHA's
**24** points and printed the justification on four surfaces: *"No published
figure prices an account wall separately."* Presenc AI's causes table has **six**
rows, and **"Required account or login — 15%"** is one of them — four rows below
the 24% that same table had already given us. The product was asserting the
absence of a figure that sits in its own citation. `research.md` had reproduced
**two** of the six rows, so the gap the reasoning relied on was one we made.

Re-read at the source 2026-08-31, all six rows verbatim:
26% stale price/stock · 24% captcha or verification wall · 18% price mismatch vs
listed feed · **15% required account or login** · 11% unsupported payment method
· 6% ambiguous page structure. They sum to 100%.

**The ruling.**

| Check | Points | Basis |
|---|---|---|
| Price feed agrees with the shelf | 26 | **measured** — Presenc AI's 26% row |
| No CAPTCHA on the checkout path | 24 | **measured** — Presenc AI's 24% row |
| No forced account on the checkout path | 15 | **measured** — Presenc AI's 15% row |
| Catalog an agent can read | 14 | allocated by us |
| Structured tool surface | 14 | allocated by us |
| Availability stated, not implied | 7 | allocated by us |

1. **Each wall is its own line at its own published weight.** A store carrying
   both pays 39. That was not expressible before, because one line covered both.
2. **The allocated block shrinks 50 → 35, keeping its 2:2:1 shape** (20/20/10 →
   14/14/7). The rule: a published figure takes its full share first; our
   judgement gets the remainder. (An earlier draft added *"and the three causes
   we do not check happen to total 35% too"* — **withdrawn 2026-08-31**: the
   price line does detect the 18% "price mismatch vs listed feed" row, it is just
   not charged for it, so the member set was wrong. The allocated block is 35
   because the measured block is 65, and it maps to nothing on the table.
   `research.md` carries the withdrawal in full.)
3. **The pitch gets stronger, not weaker.** Not "half our score is a guess" but
   *"no checkout wall on this tape is priced by us, and here is the whole table."*
   The claim is narrower than "nothing is assigned by us" — 35 points still are —
   and it is narrow because it is true.
4. **All six rows are reproduced in `research.md`,** with the funnel table and
   the verbatim methodology sentence. Partial reproduction of a source is the
   root cause and is treated as the defect.
5. **A check exists for the class, not just the instance.**
   `verify-readiness.mjs` now asserts each wall's delta against **its own** source
   row (24 and 15), that both walls cost 39 together, and that the account line
   cites `presenc_account_wall` and *not* `presenc_captcha`.

**Second defect, found by the rebalance.** The call sites still multiplied by the
old point values — `20 * (withGtin / total)` against a 14-point weight — and
`Math.min(w.max, …)` clamped 17.5 to a **perfect 14/14** on a catalog that was
88% identified. A wrong number wearing a right number's clothes. `line()` now
takes a fraction and applies the weight in one place, and there is an assertion
that a partial ratio can never print a full line.

**Consequences on screen.** Ember & Oak stays **70/100** (94 clear, delta 24
intact). Neon Matcha Lab moves **57 → 71** and now scores *one point above*
Ember for entirely different reasons — a better beat than the old one, and every
doc that said "score drops" on the store switch was corrected.

**Proven red.** A budget-neutral tamper — `account_wall` 15 → 16 with
`stock_signals` 7 → 6, still summing to exactly 100 — passes the old budget check
and still fails three assertions.

---

## Decision 5d · Cold verification of 5c — RULED 2026-08-31 (wave 3)

**Ruled: 5c's arithmetic holds; 5c's write-up did not.** The source was fetched
again, independently, on 2026-08-31 — all six rows returned exactly as `research.md`
reproduces them. Build and verify exit 0. Neon Matcha recomputes **by hand** to
71 (23 + 24 + 0 + 4 + 14 + 6) and Ember & Oak to 70. Nothing in the score moved.

**What did move — four sentences of the same shape, all closed:**

1. **The clamp write-up was false about its own code.** It said *"two stores
   printed 14/14 and 7/7 on catalogs that were 88% and 25% identified."* The
   pre-fix state was restored and re-run: **Ember** was the falsely perfect one
   (17.5 clamped to 14/14 on 88%); **Neon's catalog line was never clamped**
   (20 × 2/8 = 5, under the 14-point weight, printed 5/14). The clamp lies only
   where the stale literal overshoots the new weight — so a check on the default
   store alone catches it by luck. `verify-stores.mjs` now recomputes
   `ratio × weight` outside the product, per store, per line. Both stores also
   printed **73** under the bug: the two-stores-differ beat would have died too.
2. **"No source itemises these"** — printed as a tape subheading on every screen
   and screenshot. Our own `stock_signals` rationale says Presenc groups stock
   *inside* the 26% row, and row 6 is "Ambiguous page structure — 6%". Narrowed
   to **"no published row prices these on their own"**, and each allocated line
   now names the nearest row and says why we do not take it.
3. **The 35%-coincidence paragraph** — withdrawn, see Decision 5c point 2.
4. **"A figure with no row in sources.ts cannot be printed anywhere"** — false as
   an absolute (the tape prints `7/8 SKUs agree`, `25% identified`, `$18.00`).
   Narrowed on all eight surfaces to *cited* figures.

**The class fix.** A weight may be typed in exactly one file, `src/lib/readiness.ts`,
where check 5 pins it to its published figure. Everywhere else interpolates
`weightFor()` or a `SOURCES` row — including `shopStore.ts`, which was printing
*"24% of agent carts abandon here"* on screen. `verify-score.mjs` fails the build
if any surface retypes a point value or a bare share, and if a measured weight's
**prose** stops quoting its own source figure. Four new assertions, each proven
red before being left green. Full record in `NIGHTRUN-2026-08-31.md` § WAVE 3.

---

## Decision 5e · The whole bill is published — RULED 2026-08-31 (wave 4)

**Ruled: score all six published causes at their published shares. The allocated
block goes to zero.** Before: 100 pts = 65 measured (26 stale feed, 24 CAPTCHA,
15 account) + 35 allocated by us (catalog 14, tools 14, availability 7). After:
100 pts = the six rows of Presenc AI's causes table — **26 / 24 / 18 / 15 / 11 /
6** — which sum to 100 on their page and to 100 here.

**Why this and not "bolt 18 + 11 + 6 onto the existing 65".** That would have
double-billed. The 18% row is *"price mismatch vs listed feed"* and our
26-point line was already comparing the feed price to the shelf price — wave 3
established that in writing and then left the line charging the 26 anyway. So we
were billing one cause at another cause's price while calling the weight
published. The fix has two halves: the feed line takes the **18** that names what
it detects, and the **26** buys a genuinely different check — every SKU is run
through the real order path and survives only if the store still accepts it and
bills the price the catalog quoted.

**Where the three old allocated lines went.** Availability folded into the 26 row
(the source itself says *"stale price **or stock** data"*). Catalog schema folded
into the 6 row, rebuilt as a markup test. The tool surface became a **reported**
line worth zero — printed, checked, charged nothing — because a tool surface is
not a cause of cart abandonment on anybody's table; it is the instrument the six
lines are measured through.

**What we deliberately did NOT claim.** Not "the two 35s line up". Before this
build 35 points were allocated by us and the three unscored rows also totalled
35%, and that adjacency is exactly the defect this repo keeps finding — two
correct numbers side by side asserting a relation nobody checked. The 35 was a
remainder of 100 − 65 and mapped to nothing. We built the three checks instead of
writing the sentence; there is now no remainder to explain.

**And not "everything about this score is published".** Every *weight* is. Every
*test* is ours — the source names six causes and defines none of them — so the
tape marks each line `published weight · our stated test`, `billClaim()` is
written in one place so no surface can widen it, and the payment classification
and the JSON-LD field list are called out as ours in the UI, in `research.md` and
in the types.

**Numbers, read from `npm run verify` on 2026-08-31:** Ember & Oak **70/100**
(23/26 · 0/24 · 16/18 · 15/15 · 11/11 · 5/6), Neon Matcha **65/100** (23/26 ·
24/24 · 16/18 · 0/15 · 0/11 · 2/6). Ember scored 70 before this rebuild as well,
out of an entirely different composition — that is a **coincidence**, recorded as
one, not continuity.

**Cost to reverse:** one constant table plus three check bodies.

---

## Decision 6 (wave 4) · Scoring "ambiguous page structure" — SUPERSEDES the wave-3 ruling

**The wave-3 ruling, kept verbatim because the mistake is the point:**

> `catalog_schema` … *"No published row prices a schema gap on its own. The
> nearest row on the same Presenc table is 'Ambiguous page structure — 6%', and
> we do not take it: this line scores product identifiers (GTIN), not page
> markup, and adopting that row would be us choosing which cause fits."*

**Superseded.** That objection was right about the check it was looking at: a
check that counts `product.gtin` on a fixture is not a page-structure test, and
taking a markup row for it would have been us choosing which cause fits. The
check changed. `catalogLegibility` now reads back the **document the page
emits** — `emittedProductRecords` walks the output of `catalogJsonLd`, the same
function `ShopView` writes into the page's
`<script type="application/ld+json">` — and requires each record to carry `name`,
`sku`, `gtin13`, and an Offer with `price`, `priceCurrency`, `availability`. It
is a markup test now, so the row is the right home for it.

**What is still ours, and stated:** the field list. The source gives this row no
definition anywhere on the page — checked in raw HTML, twice, 2026-08-31 — so the
list *is* the definition, and `gtin13` being on it is the arguable choice: a
store-local SKU identifies a product inside this store and resolves to nothing
for an agent that has never seen it. `verify-stores.mjs` types the same list
independently, so quietly dropping `gtin13` costs both stores a red build rather
than handing them a free 6/6.

**Cost to reverse:** drop one string from `REQUIRED_JSONLD_FIELDS` and its twin
in the verifier.

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

- Spot-check 2–3 URLs (Shopify 2×, Presenc 24% AND 15% — read the whole causes table, not the rows we quote, 65/14 gap)
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
