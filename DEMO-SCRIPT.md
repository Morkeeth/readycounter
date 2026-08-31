# ReadyCounter — one-take film script (2:45)

**You should not need to rehearse this.** Every number below is the number the
app actually prints — read from `npm run verify` on 2026-08-31, not estimated.
Beats do not overlap. Nothing needs a browser flag.

---

## Before you press record — 90 seconds of setup

```bash
npm install
npm run build && npm run verify     # both must exit 0
```

Film the live URL — **https://tooltruth-webmcp.vercel.app** — or `npm run preview`.

Then, in the browser you will film:

1. Open the site and **clear site data once** (DevTools → Application → Clear
   site data). The landing screen only shows on a first visit; you want it.
2. Close DevTools. Zoom to 100%. Window at least 1280px wide.
3. Do **not** touch the merchant toggles yet — Ember & Oak ships with the
   CAPTCHA on, which is the whole first beat.

**The three URLs you will use, in order:**

| Beat | URL |
|---|---|
| Open | `/` |
| Store B | `/?view=merchant&store=neon-matcha` |
| Back to A | `/?view=merchant&store=ember-oak` |

---

## 0:00 – 0:25 · The bill (cold open on the tape)

**On screen:** the landing screen. The receipt tape, **EMBER & OAK COFFEE**,
**70 / 100**, and a red **CHECKOUT VOID** stamp.

> Agent traffic to Shopify storefronts is up eight times year over year, and
> nearly four in five agent carts are abandoned. Merchants cannot see why.
> This store scores seventy out of a hundred to an agent — and here is the
> itemised bill.

**Do:** point the cursor down the tape. Do not click yet.

---

## 0:25 – 0:55 · Every point is traceable

**On screen:** still the tape. **Click the `No CAPTCHA on the checkout path`
line** so it opens.

It prints: `0/24` · `published weight · our stated test` · the detail · the fix ·
and the source row — **Presenc AI, published 2026-06, read 2026-08-31**, with the
URL live. (The reported line at the bottom of the tape prints
`no published price · not charged` instead.)

> Twenty-four points, and the twenty-four is not ours. It is the share of
> abandoned agent carts Presenc AI attributes to a CAPTCHA. Every line on this
> tape works that way. Six lines, six rows of one published table — twenty-six,
> twenty-four, eighteen, fifteen, eleven, six. They add to a hundred on their
> page and to a hundred here. Not one of these points is a number we picked.
> What we picked is the test, and every line prints its own.

**Do:** click `Product records an agent can read` too — `5/6`, because one SKU of
eight ships without a GTIN, and the fix names the field that is missing.

---

## 0:55 – 1:20 · Co-shop — one order, two actors

**Do:** click **Start shopping**, land on the **Shop** tab.

1. Click **Add to order** on *House Espresso Blend*. It appears in the order
   panel with a solid `HUMAN` chip.
2. Go to **Connect** → **Agent tool console** → click **add_to_order: first SKU**,
   then **get_order**, then click **Shop** to come back.

**On screen:** the same order, now with a dashed `AGENT` chip on the second
line, and the raw tool JSON in the harness output.

> One order, two actors. The agent proposes through structured tools; you never
> leave the tab. Sixty-five percent of people trust AI to compare prices.
> Fourteen percent trust it to place the order. That gap is the product.

---

## 1:20 – 1:45 · The refusal is legible, not a dead end

**On screen:** back on **Shop**. The order panel already shows a red
**WILL VOID** panel naming the CAPTCHA and citing Presenc AI.

**Do:** click **Prepare checkout (human confirms)**. It refuses, and says why.

> `prepare_checkout` never charges a card — it validates, and a human pays.
> Here it refuses, and the refusal names the wall, the cost, and the page the
> cost came from. That is the difference between a sad path and a diagnosis.

---

## 1:45 – 2:10 · Fix it, and watch the bill reprint

**Do:** go to **Readiness** → uncheck **CAPTCHA on checkout** (or press **Apply
fix** in Readiness autopilot, which does the same thing and says it is a sandbox).

**On screen:** the tape reprints. **70 → 94.** The VOID stamp disappears. The
`Checkout path` line goes `0/24` → `24/24`.

> Twenty-four points back — exactly the published figure, because the weight is
> the figure. Our test suite fails the build if that delta ever stops being
> twenty-four.

**Do:** re-check the CAPTCHA before moving on, so store A stays comparable.

---

## 2:10 – 2:30 · A second merchant, a different failure

**Do:** switch the **Store** dropdown to **Neon Matcha Lab**
(or open `/?view=merchant&store=neon-matcha`).

**On screen:** **NEON MATCHA LAB**, **65 / 100**, a VOID stamp that says
**a forced account** — not a CAPTCHA — plus `A payment method an agent can
complete` at **0/11** and `Product records an agent can read` at **2/6**.

> Same platform, a different store, three different doors. This one passes the
> CAPTCHA line Ember fails, and loses on the three Ember passes: fifteen for a
> forced account, eleven because every card it takes needs a 3-D Secure step-up
> a human has to answer, and four of six because only two of its eight products
> carry an identifier an agent can resolve. Three separate rows of the same
> published table. Duplicate one entry in `stores.ts` and your own store gets
> its own bill.

---

## 2:30 – 2:45 · Close

**On screen:** scroll the merchant page to the **Every source this tape can
cite** panel — twelve rows, publisher, figure, published date, read date.
(Twelve *rows*, six distinct pages — seven of the rows are the six causes plus
the 78.6% headline, all off the one Presenc AI table. Say "citations", not
"sources", or the panel on screen contradicts you.)

> Twelve dated citations, across six pages. A figure this product cites cannot
> be printed without a row here, and the build fails if a row is not quoted in
> research.md. Every point we deduct has a published price, and that is the
> table.
> ReadyCounter — the counter prints the score.

---

## The numbers you will say out loud

Read from `npm run verify`, 2026-08-31. If any of these differ when you film,
**stop and re-run verify** — the app changed.

| Claim | Value | Where it is asserted |
|---|---|---|
| Ember & Oak, CAPTCHA on | **70 / 100** | `verify-stores.mjs` |
| Ember & Oak, CAPTCHA off | **94 / 100** | `verify-readiness.mjs` |
| The CAPTCHA delta | **24**, = Presenc AI's 24% | `verify-readiness.mjs` |
| Neon Matcha, account wall on | **65 / 100** | `verify-stores.mjs` |
| Neon Matcha, account wall off | **80 / 100** | run above, 2026-08-31 |
| Neon Matcha, payment row fixed | **76 / 100** | run above, 2026-08-31 |
| The account-wall delta | **15**, = Presenc AI's 15% | `verify-readiness.mjs` |
| The payment delta | **11**, = Presenc AI's 11% | `verify-readiness.mjs` |
| Both walls on one store | **−39** | `verify-readiness.mjs` |
| Charged points that are a published weight | **100 of 100** | `verify-readiness.mjs` |
| WebMCP tools registered | **16** (reported, worth 0) | `verify-score.mjs` |
| Citation rows on file | **12** rows across **6** distinct pages | `verify-score.mjs` |
| Ember & Oak, complete product records | **7 / 8** | `verify-readiness.mjs` |

---

## Stranger test — all six yes before you record

1. Fresh browser, no context: does the landing screen explain the product
   without you saying anything?
2. Can you add an item and see it in the order in under ten seconds?
3. Does the **Connect → Agent tool console** update the same order without docs?
4. Does unchecking the CAPTCHA visibly move 70 → 94?
5. Does Neon Matcha show a **different score (65)** and three different failures — **account wall 0/15, payment 0/11, records 2/6**?
6. Can you say the pitch in one sentence without using the letters M-C-P?

Screenshots of every surface, at 1440px and 390px: `docs/shots/`.
