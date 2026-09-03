# Devpost Classic — every field, ready to paste

**Event:** WebMCP Challenge · <https://webmcp.devpost.com/>
**Closes:** Wed 3 Sep 2026, 1:00pm PDT = **22:00 Paris**
**Every number below was read from the live API, not from a document.** Re-check with:

```
curl -s https://readycounter.vercel.app/api/v1/rankings \
  | jq '{succeeded,shopCount,avgGtinPct,ucp}'
# 78, 148, 0, {available:81, withGtin:13, gtinWhereCrawlZero:11}
```

---

## 1 · Project name

```
ReadyCounter
```

## 2 · Tagline / elevator (≤60 chars)

```
Agent commerce. Now reviewable. Proof.
```

## 3 · "Try it out" links

| Label | URL |
|---|---|
| Live app | `https://readycounter.vercel.app` |
| Judge path (60s) | `https://readycounter.vercel.app/?judge=1` |
| Front door, direct | `https://readycounter.vercel.app/?judge=1&view=integrations` |
| GitHub repo | `https://github.com/Morkeeth/tooltruth-webmcp` |

Both hosts serve the same production build; `tooltruth-webmcp.vercel.app` is the
old codename and still resolves.

## 4 · Built With

```
react, typescript, vite, webmcp, zustand, shopify, render, vercel, node.js, playwright
```

## 5 · Image gallery — upload in this order

The **first image becomes the Devpost thumbnail.**

| # | File | Why it's in the gallery |
|---|---|---|
| 1 | `submission/brand/thumbnail-1280x720.png` | Title card, real numbers on it |
| 2 | `submission/shots/01-front-door.png` | The census wall: 148 tiles, 11 blue |
| 3 | `submission/shots/03-store-scored.png` | colourpop.com audited live, 0/24, cited fix list |
| 4 | `submission/shots/02-blank-barcode.png` | The blank barcode — nothing to scan |
| 5 | `submission/shots/05-coshop-one-cart.png` | Human + agent, one cart |
| 6 | `submission/shots/06-webmcp-tools.png` | The 18 WebMCP tools |
| 7 | `submission/shots/04-readiness-tape.png` | Every point priced from a published source |
| 8 | `submission/shots/07-mobile.png` | 390px |

Logos, if a field asks: `submission/brand/logo-mark.svg`, `logo-512.png`,
`logo-1024.png`, `logo-wordmark.svg`, `wordmark-1440.png`.

## 6 · Demo video

| Field | Value |
|---|---|
| File to upload to YouTube | `demo/demo-submit.mp4` (after prepending your intro) |
| Without your intro | `demo/demo-final.mp4` |
| Captions | `demo/demo-submit.srt` (or `demo-final.srt`) |
| Title | `ReadyCounter — WebMCP Challenge` |
| Description | paste `submission/YOUTUBE-DESCRIPTION.txt` |
| Visibility | Unlisted or Public — **not Private** |
| Category | Science & Technology |

To add your 20-second intro:

```
./film/prepend-intro.sh ~/path/to/your-intro.mov
```

It normalises both clips to 1920×1080/30fps/48kHz, shifts every caption by the
real intro length, and warns if the intro pushes the product past the 15-second
mark or the whole film past 3:00.

## 7 · Project description — "About the project"

Paste `submission/DEVPOST-PASTE.md`.

**It is stale in three places after today's rebuild — fix before pasting:**

- It describes the front door as "paste your URL → compare to the field". The
  front door is now the census wall plus the blank barcode.
- It cites "78 opened a public feed at 0% scrape GTIN" but not the 70 that
  returned nothing at all, which is the stronger half of the finding.
- The live URL in it is the old host.

## 8 · Why WebMCP fits (the field judges read most carefully)

```
ReadyCounter registers 18 shopping tools on the browser-native WebMCP API. Each
is declared in src/webmcp/registerTools.ts with
document.modelContext.registerTool(name, {description, inputSchema, execute}).

The same handlers serve two paths, so a judge never needs a Chrome flag:
  Path A — native WebMCP (Chrome 149+, chrome://flags/#enable-webmcp-testing)
  Path B — Connect → Agent tool console, no flag, identical handlers

Why the browser and not a hosted MCP server: the thing being measured is what an
agent can retrieve from a storefront IN THE SHOPPER'S OWN SESSION. A server-side
MCP would read the catalogue with our credentials, not theirs, and would miss
exactly the walls that matter — CAPTCHA, forced login, session-gated pricing.

What people and agents can now do together: shared Zustand state means a human
click and an agent's add_to_order land on the same order, tagged HUMAN or AGENT.
prepare_checkout validates the total and never charges a card — the agent
proposes, the person pays.
```

## 9 · Testing instructions for judges

```
Fast path (60 seconds), no install, no signup:
1. https://readycounter.vercel.app/?judge=1
2. Add an item — it lands in the shared order tagged HUMAN
3. Connect → For developers and judges → Agent tool console
4. Run add_to_order — same order, tagged AGENT
5. Run prepare_checkout — it validates and refuses to charge

See the field for yourself:
  https://readycounter.vercel.app/?judge=1&view=integrations
  148 tiles, one real storefront each: 70 returned nothing, 67 returned a feed
  with no barcode, 11 expose a barcode on Shopify's Catalog MCP while their own
  storefront hides it (Glossier, Tatcha, Brooklinen, Alo Yoga, Buffy, Mejuri,
  Gorjana, Dagne Dover, United By Blue, Stio, Away).

Score any real store:
  https://readycounter.vercel.app/?audit_url=https://colourpop.com

Skeptic path:
  npm ci && npm run verify && npx playwright test
  curl -s https://readycounter.vercel.app/api/v1/rankings | jq '{succeeded,shopCount}'
```

## 10 · The numbers, and what each one means

| Number | Meaning | Source |
|---|---|---|
| 148 | curated DTC storefronts asked | `shopCount` |
| 78 | returned a public catalogue feed | `succeeded` |
| 70 | returned nothing at all | `catalogScore === null` |
| 0% | average barcode coverage across all 78 | `avgGtinPct` |
| 81 | storefronts exposing Shopify UCP Catalog MCP | `ucp.available` |
| 13 | of those returning a GTIN there | `ucp.withGtin` |
| 11 | GTIN on UCP while the scrape is empty | `ucp.gtinWhereCrawlZero` |
| 18 | WebMCP tools registered | `GET /api/v1/tools` |
| 70/100 | Ember & Oak sandbox score | declared checkout |

Batch read 2026-09-02T21:53:59.805Z. Field crawls score the **catalogue budget
only** (0–24); checkout lines stay NOT MEASURED until Shopify OAuth. The full
/100 appears on sandbox stores where checkout is declared. Say this if asked —
it is the honest limit and it is on the page.

---

## 11 · The organiser's checklist, audited

| Their line | State | Evidence |
|---|---|---|
| Live URL works when clicked | **PASS** | `readycounter.vercel.app` HTTP 200; API 78/148 on 12/12 consecutive curls |
| Judges can access it in ChatGPT's in-app browser or Chrome+WebMCP | **YOURS TO CONFIRM** | Path B needs no flag and is verified; Path A native WebMCP I cannot test from here — open it once in ChatGPT's in-app browser before you submit |
| WebMCP tools verified in that browser | **YOURS TO CONFIRM** | same — this is the one checklist line no script can close |
| Demo video shows it working, has audio | **PASS** | 114s, 1920×1080, AAC stereo, mean −20.7dB; transcribed end to end against the script |
| Repo public, tested in incognito | **PASS** | `visibility: PUBLIC` via `gh repo view` |
| Open-source licence visible in About | **PASS** | GitHub reports `licenseInfo: MIT License` |
| Description says why WebMCP fits | **PASS** | §8 above; also `WHY-WEBMCP.md` |
| All team members added and accepted | **YOURS** | solo entry — nothing to do unless you add someone |
| Not saved as a draft | **YOURS** | the last click |

### Their tips, against this film

- *Show the project working in the first 15 seconds* — the film opens on the live
  front door with the wall already loaded. **Your 20s intro goes in front of
  that**, which spends the 15-second budget before the product appears. Keep the
  intro short, or accept the trade knowingly.
- *Judges are not required to watch past 3 minutes* — film is 1:54. With a 20s
  intro, 2:14. Fine.
- *Start already logged in, skip setup* — there is no login to skip.
- *Don't let AI name your project* — ReadyCounter is yours, unchanged.
- *Don't submit an AI-generated description unedited* — §7 lists the three places
  `DEVPOST-PASTE.md` is now stale. Read it before pasting.

---

## 12 · Your click list, in order

1. `./film/prepend-intro.sh <your intro>` → watch `demo/demo-submit.mp4` **end to end**
2. Open `readycounter.vercel.app` in **ChatGPT's in-app browser**, run one tool, confirm
3. YouTube: upload, title, description, captions, **Unlisted**, copy the URL
4. Devpost: fields 1–9 above, gallery in the order in §5, video URL from step 3
5. Re-read the description — fix the three stale spots in §7
6. **Submit** (not draft)
7. **Do not push after you submit** — a push redeploys the site judges are on

Repo state at time of writing: `main`, pushed, clean.
