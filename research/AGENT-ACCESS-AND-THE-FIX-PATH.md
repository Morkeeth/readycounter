# Can we read the stores that block us, and can we fix the ones we read?

**Date:** 2026-09-03 · **Question:** Two things decide whether ReadyCounter is a
scoreboard or a product. (1) 22 of our 148 storefronts refuse us — can we get in?
(2) For the ones we can read, can we take the merchant from "your barcodes are
missing" to "your barcodes are there"?

Everything below is measured or quoted. Where it is neither, it says so.

---

## 1 · You cannot scrape your way in. Measured, twice.

The 22 blocked stores were re-probed tonight from this machine.

### Test A — does the declared identity matter?

Same 14 stores, same endpoint (`/products.json?limit=1`), six identities:

| Identity sent | 200s |
|---|---|
| node default (no UA) | **0 / 14** |
| `ReadyCounterBot/1.0 (+…/bot; agent-readiness audit)` | **0 / 14** |
| `GPTBot/1.2` | **0 / 14** |
| `ClaudeBot/1.0` | **0 / 14** |
| `PerplexityBot/1.0` | **0 / 14** |
| Full Chrome 152 UA string | **0 / 14** |

Identical status distribution in every case (`403×6, 429×3, 404×1, err×4`). **The
user-agent is not the signal.** Spoofing a known crawler does nothing, and would
be dishonest for a product that sells receipts.

### Test B — does a real browser matter?

All 22, driven with real Chrome (real TLS stack, real cookies), fetching
`/products.json` **from inside the page's own origin** so the request shares the
session that just loaded successfully:

```
RECOVERED: 0 of 22
  12  hard 403 even in a real browser
   4  network error
   4  page loads 200 but /products.json is 404 or refused at the app layer
   1  307 redirect
   1  genuinely no UCP endpoint (rimowa)
```

**Nothing client-side recovers a single store.** The block is IP/ASN reputation
and bot-management scoring, not user-agent and not TLS fingerprint.

### What this rules out

- **A VPS makes it worse, not better.** Datacenter ASN is the primary block
  signal; moving from a residential-ish IP to a cloud IP moves us further into
  the blocked bucket. This was the intuition to check and the data says invert it.
- **Residential proxies would work and must not be used.** They work by
  laundering the request through someone's home connection. For a product whose
  entire pitch is "every number names its source", being caught cloaking is not
  a bug report, it is the end of the product. It also breaks the sites' terms.
- **UA spoofing is both useless and dishonest.** Rare combination. Easy call.

### The 4th class nobody had named

Four stores (bombas, drinkag1, meundies, mvmt) **load fine in a browser** and
still refuse `/products.json` — 404 or app-layer refusal. That is not a WAF.
That is a merchant who has deliberately turned off the endpoint agents read.
It is a *different finding* from "blocked" and from "empty", and today the
census wall paints all three the same grey.

---

## 2 · The legitimate way in exists, and it is on-thesis

**Web Bot Auth** — cryptographic per-request identity for agents, built on
RFC 9421 HTTP Message Signatures.

How it works:

1. Generate an **Ed25519** keypair.
2. Publish the public key as a **JWKS** at
   `/.well-known/http-message-signatures-directory`, served with
   `Content-Type: application/http-message-signatures-directory+json`.
3. Sign every outbound request, sending **`Signature-Input`**, **`Signature`**
   and **`Signature-Agent`** headers.
4. Register via the Cloudflare dashboard's Bot Submission Form, choosing the
   signed-agents list, and comply with the signed agent policy.

State of play, as reported: Cloudflare shipped this into the Verified Bots
Program on 1 July 2025, made AI-agent verification a first-class Bot Management
signal on 2 June 2026, and the Verified AI Agent category launched with 19
agents (ChatGPT Atlas, Claude in Chrome, Perplexity Browser, Gemini Agent Mode
among them) covering an estimated **84% of identified AI browser traffic**.
AWS WAF added Web Bot Auth support in November 2025.

**Why this matters more than access.** ReadyCounter's argument is that agents
need declared, verifiable identity and that stores should be able to tell an
honest agent from a scraper. Becoming a signed agent is the product taking its
own advice. It converts "22 stores we cannot see" from a permanent hole into a
dated roadmap item — and the fact that we were refused becomes a *measurement*
rather than a gap: **a store that refuses a signed, declared agent is telling
you something true about its agent-readiness.**

That is a better product than one that sneaks in.

---

## 3 · Yes, we can walk them through the fix — and it is cheap

Confirmed against Shopify's own documentation:

**`ProductVariantsBulkInput` has a `barcode` field** — "The value of the barcode
associated with the product variant." It is set through
**`productVariantsBulkUpdate`**, which "Requires `write_products` access scope",
and can be run inside a bulk operation for large catalogues.

**And there is a no-API path the merchant already knows.** Shopify's own CSV
round-trip: Products → Export → edit the **Variant Barcode** column → Products →
Import. Shopify matches rows by **Handle** and updates the barcode per variant.
This needs no access from us at all.

### The bonus that sells it

When a store connects Shopify to Google Merchant Center via the Google & YouTube
channel, **Shopify automatically maps the Barcode field to the GTIN attribute in
the product feed.** So the fix we are asking for is not "do this for the agents";
it is "do this and your Google Shopping feed stops failing too." A merchant who
will not spend an afternoon for hypothetical agent traffic will spend it for
Google Shopping. Same field, two payoffs, one already has a budget line.

### The three product moves this unlocks, cheapest first

1. **Emit the fix, do not describe it.** For every audited store, generate the
   Shopify-shaped CSV with the merchant's real handles and an empty
   `Variant Barcode` column, ready to fill and re-import. We already know every
   product that is missing one. This is a download button, and it turns advice
   into an artifact.
2. **Emit engineering tickets.** The same findings as Linear/Jira/GitHub issues,
   one per failing check, each carrying the check, the arithmetic, the fix and
   the citation. The tape is already shaped like a ticket; it just does not
   leave the page.
3. **Close the loop with `write_products` — only if asked.** The mutation exists.
   Holding write access to a merchant's catalogue is a large trust step for a
   tool that currently boasts "read-only, no payment scopes", and it should stay
   opt-in and last. The delta receipt already proves a fix landed without us
   touching anything.

---

## 4 · What this changes about the product

| Today | After |
|---|---|
| 70 grey tiles: "asked, no feed" | Three classes: **45** empty feed (fixable), **22** refused us (unmeasured, not failing), **4** endpoint switched off |
| "Your barcodes are missing" | A CSV they can import, and tickets they can assign |
| Blocked stores are a hole in the data | Blocked stores are a roadmap item with a protocol and a date |
| The pitch is agent traffic | The pitch is agent traffic **and** the Google Shopping feed they already care about |

---

## Sources

- [productVariantsBulkUpdate — Shopify GraphQL Admin](https://shopify.dev/docs/api/admin-graphql/latest/mutations/productvariantsbulkupdate)
- [ProductVariantsBulkInput — Shopify GraphQL Admin](https://shopify.dev/docs/api/admin-graphql/latest/input-objects/ProductVariantsBulkInput)
- [Using CSV files to import and export products — Shopify Help Center](https://help.shopify.com/en/manual/products/import-export/using-csv)
- [The age of agents: cryptographically recognizing agent traffic — Cloudflare](https://blog.cloudflare.com/signed-agents/)
- [Verified bots — Cloudflare bot solutions docs](https://developers.cloudflare.com/bots/concepts/bot/verified-bots/)
- [How to implement Web Bot Auth for your AI agent, bot, or crawler — Stytch](https://stytch.com/blog/how-to-implement-web-bot-auth-signing/)
- [Web Bot Auth Implementation — Fingerprint Docs](https://docs.fingerprint.com/docs/bot-detection/web-bot-auth-implementation)
- [AWS WAF announces Web Bot Auth support](https://aws.amazon.com/about-aws/whats-new/2025/11/aws-waf-web-bot-auth-support)

Measurements in §1 are ours, taken 2026-09-03, reproducible from
`/tmp/blocked.txt` and the scripts described. Everything in §2 and §3 is quoted
from the sources above.
