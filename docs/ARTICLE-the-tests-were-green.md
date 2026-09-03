# The tests were green the whole time

I spent a day making a store-audit tool honest enough to submit. Thirteen
verification scripts and fifteen end-to-end tests passed at the start of the day
and at the end of it. In between I found thirteen real defects. The suite caught
none of them.

That is not a story about bad tests. The tests were fine. They checked that the
code did what the code was written to do. Every defect I found was in a
different category: whether the thing was usable, legible, or true.

## The product

ReadyCounter asks a storefront for its catalogue the way a shopping agent asks,
then prices what it finds against published research on why agent carts fail.
Paste a domain, get a score where every point cites the row of the abandonment
table it came from.

We had asked 148 real DTC storefronts. Not one exposed a barcode an agent could
match to a product. That finding was the submission.

## Then I gave the tools to a real model

Late in the day I wired a frontier model to the product's own WebMCP tools and
told it to buy a bag of espresso under twenty dollars. Not a script. The model
picks the calls, the browser runs them.

It searched. It compared two products. Then it called `add_to_order` and got
`Product not found:` with an empty value. It tried again. Six times.

`get_product` took a parameter called `id`. `add_to_order` took `product_id`.
The model had done the reasonable thing: taken the id it was handed and passed
it along. Our own tool surface trapped an agent, in a product whose entire
argument is that stores should be legible to agents.

I fixed it and ran five frontier models. Two still failed. I assumed a model
problem and started writing that down, which was wrong. The tool manifest
carried no parameter schemas at all. `GET /api/v1/tools` had been advertising
eighteen uncallable tools to anyone integrating from it, and the agent runner
was handing models an empty schema. The models that called `add_to_order({})`
were not confused. They were correct. We had told them the tool took no
arguments.

Gemini failed differently. It searched for "espresso beans" and reported that
the store had nothing. The store sells House Espresso Blend. Our search matched
the query as one substring, so a shopper asking in plain language got an empty
store. That is precisely the failure the product exists to detect, sitting in
our own demo.

None of this was reachable from a test, because no test searched the way a
person talks, and no test had ever tried to call a tool from outside.

## What the page was saying while I was not looking

Two numbers on the site disagreed. The scored receipt charged CAPTCHA at 24%
and forced account walls at 15%, both quoting a published table. A companion
panel said 31% and 22%, quoting nothing. Two numbers for the same thing, in a
product built on the claim that every number names its source.

Then a worse one. A crawl cannot see a store's checkout, so the product says
plainly that crawled stores never get a score out of 100. The API was returning
`fullScore: 78` for a crawled store while simultaneously listing four checkout
lines as NOT MEASURED. Both facts came out of the same response.

And the census wall, the main visual, painted seventy storefronts in one grey
tile labelled "asked, no feed". Forty eight of them had answered and sent
nothing. Twenty two had refused the request outright. Those are different
things. One is a merchant problem. The other is us not being able to look.
Showing them the same way is the exact error the product exists to catch in
other people's dashboards.

## The part where I tried to cheat and could not

Those twenty two refusals bothered me, so the question came up: can we get in? A
different user agent, a VPS, something.

I ran it instead of arguing about it. Six declared identities against the
blocked stores, including GPTBot, ClaudeBot and a full Chrome string: zero out
of fourteen, with an identical distribution of errors every time. The user agent
is not the signal. Then real Chrome, real TLS, real cookies, fetching from
inside the page's own origin so the request shared a session that had just
loaded successfully: zero out of twenty two.

So a VPS makes it worse, because a datacenter address is the block signal.
Residential proxies would work, and would end the product the first time anyone
noticed, since the whole pitch is receipts.

The legitimate route turned out to be the interesting one. Web Bot Auth: sign
each request with an Ed25519 key, publish the public key at a well known
address, register on the verified list. A product that argues stores should be
able to tell an honest agent from a scraper ought to be one. The stores we
cannot read stopped being a hole in the data and became a roadmap item.

More usefully, it changed what the wall says. A store that refuses a signed,
declared agent is telling you something true about its readiness. Being refused
is a measurement.

## The last angle came from a conversation, not a backlog

Near the end I got asked a plain question: how useful is this to an actual shop
owner?

The honest answer was "not very, yet". It tells them what is broken and hands
them three bullet points. They still have to go and do it. Our own research doc
had already scored this: help stops at advice.

So we looked at what "doing it" involves. It turns out Shopify's own product
CSV export and import round trip updates the barcode field, matched by product
handle, with no API access needed from anyone. And Shopify maps that same
barcode field to GTIN in the Google Merchant Center feed. So the chore we were
asking a merchant to do for hypothetical agent traffic is the same chore that
repairs their Google Shopping feed, which already has a budget line.

That reframed the ask from "adopt a protocol" to "fill in a column you already
publish". The audit now ends in a download: a CSV in Shopify's shape, pre-filled
with the merchant's real product handles, barcode column blank where it is
missing. Fill it, re-import, re-audit, and the delta receipt proves it landed.

Building it surfaced one more defect, and it is my favourite. Shopify matches
imports by handle. We were storing the SKU as the product id and had never
captured the handle at all. The type did not declare it. A CSV built from that
data would have matched nothing and looked completely fine. I only caught it
because I diffed one stored product against the store's live feed before wiring
up the button.

## What I would keep

Ideation ran long, deliberately, and it produced the best thing in the
submission. The fix export was not on any list. It came from ninety minutes of
asking whether the product was actually useful, arriving at "no, not yet", and
following that answer.

Every number got probed rather than recalled. Model identifiers came from
listing what the key could see. The Shopify field came from the documentation.
The one time a finding rested on stored data instead of a fresh probe, it turned
out to be an artifact of our own crawler being blocked, and I had to throw it
away.

And the defects got fixed at the cause, with a guard each. Overlapping audio
became durations derived from the rendered voice, plus a check that fails the
build. Missing schemas became a generated map, plus a check that fails the build
if a tool ever advertises itself without its parameters.

## What I would change

The rule I broke most was already written down. A ban on em dashes had been in
my memory since July. The submission went out full of them, and the person I was
writing for had to strip them by hand before pressing submit. Recall is not a
gate. The fix is four words: before writing, check the write rules.

The second one is the same shape. Artifacts drifted from their source. Six of
ten screenshots about to be uploaded were seven hours old and showed a page
header that no longer existed. A pack built from a live surface needs to be
rebuilt when that surface changes, not when someone remembers.

Both failures are the same failure. Knowing a rule and checking a rule are
different activities, and only one of them runs at the moment it matters.
