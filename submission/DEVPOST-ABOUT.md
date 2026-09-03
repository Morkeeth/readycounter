## Inspiration

Two numbers, twelve months apart. In March 2025, AI-referred traffic converted
38% *worse* than everything else on a retail site. In March 2026 it converted
42% *better* (Adobe Digital Insights). Agent traffic stopped being a curiosity
and became the channel that pays.

Then the other number: **78.6% of agent carts are abandoned** (Presenc AI). And
Shopify said on its Q1 2026 earnings call that a catalogue an agent can read
converts **2× better** than a page it has to scrape.

So the prize is real, it is arriving now, and most of it is being lost to a data
problem. But a merchant hears "agentic commerce" and has no way to see which
door is locked on their own store. Theme checkers grade the page a human sees.
Nothing grades what an agent retrieves.

We wanted to build the instrument, and then — before claiming anything — point
it at the field and find out whether the problem was real.

## What it does

**Paste your domain. Get a score, a fix list, and a receipt that names its
source.**

ReadyCounter asks your storefront for its catalogue the way a shopping agent
asks, and prices what it finds against published research on why agent carts
fail. Every point on the bill is one row of a published abandonment table, at
the share that table states, with the publisher and the date we read it printed
on the line. Nothing on the tape is a number we invented.

Three things a merchant can do with it:

- **See the field.** We asked 148 curated DTC storefronts. 70 sent nothing back
  at all. 67 sent a feed with no barcode in it. Average barcode coverage across
  every store that answered: **0%**. Your store joins that wall as tile 149.
- **Read the blank barcode.** The front page draws what an agent actually reads
  off your product page. A bar is inked only where a product exposes a GTIN, so
  at 0% the code is grey and unscannable. The emptiness *is* the measurement.
- **Co-shop with the agent.** Eighteen WebMCP tools are registered in the open
  tab. A human click and an agent's `add_to_order` land on the same order,
  tagged HUMAN or AGENT. `prepare_checkout` validates the total and **never
  charges a card** — the agent proposes, the person pays.

**And you can watch a real model do it.** On the Co-shop tab, GPT-5.6 Terra is
handed eight commerce tools and a shopping goal through OpenAI's Responses API.
It picks the calls, the browser executes them through `document.modelContext`,
and it gets stopped by the same CAPTCHA a real customer's agent would hit. Each
run leaves a dated receipt in Render Key Value. Repeat 3× shows the path across
independent runs instead of presenting one lucky trace.

Deliberately, the model is the **shopper and never the judge**. The readiness
score is arithmetic over a crawl: reproducible between runs, auditable line by
line, and impossible to talk into a better number by putting words on your
storefront. Model on the outside, deterministic instrument on the inside.

One finding surprised us enough to put it on the front page: **eleven brands
publish barcodes to Shopify's Catalog MCP and hide them on their own
storefront** — Glossier, Tatcha, Brooklinen, Alo Yoga, Buffy, Mejuri, Gorjana,
Dagne Dover, United By Blue, Stio, Away. The protocol has the data. The scrape,
which is what a shopper's agent reads, does not.

## How we built it

React, TypeScript, Vite, Zustand for the shared order, deployed on Vercel.

**WebMCP.** All 18 tools are declared in `src/webmcp/registerTools.ts` with
`document.modelContext.registerTool({name, description, inputSchema, execute})`.
The same handlers serve two paths, so a judge never needs a Chrome flag to see
it work: **Path A** is native WebMCP (Chrome 149+), **Path B** is the in-page
Agent tool console, identical handlers, no flag.

We chose the browser API over a hosted MCP server deliberately. The thing being
measured is what an agent can retrieve *in the shopper's own session*. A
server-side MCP would read the catalogue with our credentials, not theirs, and
would miss exactly the walls that matter — CAPTCHA, forced login, session-gated
pricing.

**Integrations, all live in this build:**

- **Shopify OAuth** — read-only Admin API for the merchant's own catalogue,
  barcodes and prices. No payment scopes, ever.
- **Shopify Catalog MCP (UCP)** — the protocol side of the scrape-vs-protocol
  comparison. This is where the eleven-brand finding came from.
- **OpenAI Responses API** — GPT-5.6 Terra chooses calls against the real tool
  surface. The server owns the transcript and verifies every returned call id.
- **Render Key Value** — persists every merchant audit and every live co-shop
  room across Vercel cold starts, plus agent-trial receipts and a weekly cron
  that re-runs the field batch. `GET /api/v1/render/status` shows it.

**Verification.** 15 `npm run verify` scripts assert the score arithmetic,
source citations, honest limits, receipt summary and tool-result validation; 15
Playwright e2e tests run against production, not a mock.

## Challenges we ran into

**The interesting one: scrape ≠ protocol.** Our first field batch said 0% GTIN
coverage and we nearly shipped that as "nobody has barcodes". Then we queried
Shopify's Catalog MCP for the same stores and found 13 of 81 do expose GTINs
there — 11 of them while their public scrape is empty. The honest finding was
not "merchants have no data", it was "the data exists and the surface an agent
reads does not carry it". That reframed the whole product.

**Correcting our own scoring, publicly.** We charged the forced-account-wall 24
points because we had reused the CAPTCHA row's weight. A re-read of the cited
table on 2026-08-31 found the account wall has its own row at 15%. We changed
the weight and left the note on the line. If a number moves, the receipt should
say so.

**A film that lied about itself.** Our demo pipeline had hardcoded narration
cues. Paragraph 7 ran 6.9 seconds past its slot and was mixed *on top of*
paragraph 8, and the caption file claimed both were spoken cleanly. The build
script printed that exact warning and exited 0, so nobody read it. Every
duration is now derived from the rendered audio, the checks are fatal, and a
separate verifier checks the file that actually ships rather than the parts it
was made from.

**Our own tools trapped an agent.** Pointing a real model at the tool surface
found something no test had: `get_product` takes `id`, but `add_to_order` took
`product_id`. The model called `get_product({id})`, got a product back, carried
`id` forward — and looped six times on `Product not found:` with an empty value.
On a product whose whole thesis is making stores legible to agents, we would
have shipped a tool surface that confuses agents. Every product-taking tool now
reads `product_id`, `id` or `sku`, the schemas say so, and an empty id returns
an error that tells the agent what to pass instead.

**A permanently empty third of the page.** The layout reserved 21rem for a
sidebar that only exists on one tab, so two of three tabs rendered a blank
column and nobody noticed until we looked at a screenshot instead of the code.

## Accomplishments that we're proud of

**The field batch is a real measurement, not a demo fixture.** 148 storefronts,
78 answered, 0% average barcode coverage, and you can re-run our exact query:

```
curl -s https://readycounter.vercel.app/api/v1/rankings \
  | jq '{succeeded,shopCount,avgGtinPct,ucp}'
```

**Every point on the bill cites a publisher, a publication date and the date we
read it.** Where our test cannot fully support a published claim, the line says
so in its own text. Checkout lines stay `NOT MEASURED` until OAuth rather than
being guessed.

**Native WebMCP genuinely works.** Verified on Chrome 152 with the WebMCP
feature enabled: 18 tools on `document.modelContext`, `search_catalog` →
`add_to_order` → the line appears tagged AGENT next to a human's →
`prepare_checkout` refuses with the CAPTCHA reason and its citation. No card is
ever touched.

**No signup, no install, no key.** A judge clicks one link and is inside the
product.

## What we learned

**A check that says "no" is the one nobody audits.** A false negative looks
exactly like a working check. Our red lights needed verifying at the object more
carefully than the green ones did.

**Publishing a number means naming who published it.** Once every weight on the
tape had to carry a publisher and a date, three of our own numbers turned out to
be assumptions wearing a citation. Two got corrected, one got deleted.

**The measurement surface matters more than the data.** Merchants are not
missing barcodes. Eleven of them are publishing barcodes to a protocol while the
surface their customers' agents actually read stays empty. That is a much more
fixable problem, and a much less flattering one to discover.

## What's next for ReadyCounter

- **Finish the OAuth path** so checkout lines stop reading `NOT MEASURED`. The
  catalogue budget is scored today; the checkout half needs the merchant's own
  admin, and that plumbing is half built.
- **Delta receipts over time.** Re-auditing the same URL already prints a
  before/after. The next step is a public, dated score a merchant can point at —
  the Lighthouse-report shape, for agent readiness.
- **Widen the census past 148** and publish it on a schedule, so "0% coverage"
  becomes a trend line rather than a snapshot. The Render cron already runs
  weekly.
- **ACP feed certification**, deferred for this build and honestly out of scope
  for a hackathon weekend.

The ambition, plainly: every merchant runs this when they ship anything new,
Shopify adopts the receipt format, and stores go public with their score.
