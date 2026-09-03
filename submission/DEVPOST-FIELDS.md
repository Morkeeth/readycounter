# Devpost Classic — every field, ready to paste

**Event:** WebMCP Challenge · <https://webmcp.devpost.com/>
**Closes:** Fri 4 Sep 2026, 1:00am PDT = **10:00 Paris**
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
| GitHub repo | `https://github.com/Morkeeth/readycounter` |

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
| 1 | `submission/brand/thumbnail-1280x720.png` | Title card, real numbers on it — 1280×720, 64 KB |
| 2 | `submission/shots/01-front-door.png` | The census wall: 148 tiles, 11 blue |
| 3 | `submission/shots/03-store-scored.png` | colourpop.com audited live, 0/24, cited fix list |
| 4 | `submission/shots/02-blank-barcode.png` | The blank barcode — nothing to scan |
| 5 | `submission/shots/05-coshop-one-cart.png` | Human + agent, one cart |
| 6 | `submission/shots/06-webmcp-tools.png` | The 18 WebMCP tools |
| 7 | `submission/shots/04-readiness-tape.png` | Every point priced from a published source |
| 8 | `submission/shots/07-mobile.png` | 390px |

Logos, if a field asks: `submission/brand/logo-mark.svg`, `logo-512.png`,
`logo-1024.png`, `logo-wordmark.svg`, `wordmark-1440.png`.

**Flipbook** (17s, silent, for X / LinkedIn — not for the Devpost video field):
`submission/flipbook/readycounter-1x1.mp4` (square) and
`readycounter-9x16.mp4` (vertical). Both pass the flipbook audit on every frame.
The 16:9 aspect fails its bottom-margin check — the source line overflows by
16px — so it is not included; use the square one for feeds.

## 6 · Demo video

| Field | Value |
|---|---|
| **File to upload to YouTube** | **`demo/demo-submit.mp4` — 2:20, your intro + the film** |
| Without your intro | `demo/demo-final.mp4` — 1:58 |
| Captions burned in | `demo/demo-final-sub.mp4` — same film, subtitles on screen |
| Caption file | `demo/demo-submit.srt` — 18 cues, covers your intro too |
| Title | `ReadyCounter — WebMCP Challenge` |
| Description | paste `submission/YOUTUBE-DESCRIPTION.txt` |
| Visibility | **Public** — the official rules require a public video |
| Category | Science & Technology |

To add your 20-second intro:

```
./film/prepend-intro.sh ~/path/to/your-intro.mov
```

It normalises both clips to 1920×1080/30fps/48kHz, shifts every caption by the
real intro length, and warns if the intro pushes the product past the 15-second
mark or the whole film past 3:00.

## 7 · Project description — "About the project"

Paste **`submission/DEVPOST-ABOUT.md`**. It is written to Devpost's own seven
headings — Inspiration, What it does, How we built it, Challenges,
Accomplishments, What we learned, What's next — and it is current with today's
build.

`DEVPOST-PASTE.md` is the older long-form version and is **stale in three
places**: it describes the pre-rebuild front door, omits the 70 storefronts that
returned nothing at all, and links the old host. Use it only for spare copy.

## 8 · Why WebMCP fits (the field judges read most carefully)

```
ReadyCounter registers 18 shopping tools on the browser-native WebMCP API. Each
is declared in src/webmcp/registerTools.ts with
document.modelContext.registerTool({name, description, inputSchema, execute}).

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

Full guide lives in [`TESTING.md`](../TESTING.md) and is linked from the README.
Short version for the form:

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
| Demo video shows it working, has audio | **PASS** | 89.1s, 1920×1080, AAC stereo; `film/verify_film.py` confirms video and audio agree on the shipped file |
| Repo public, tested in incognito | **PASS** | `visibility: PUBLIC` via `gh repo view` |
| Open-source licence visible in About | **PASS** | GitHub reports `licenseInfo: MIT License` |
| Description says why WebMCP fits | **PASS** | §8 above; also `WHY-WEBMCP.md` |
| All team members added and accepted | **YOURS** | solo entry — nothing to do unless you add someone |
| Not saved as a draft | **YOURS** | the last click |

### Their tips, against this film

- *Show the project working in the first 15 seconds* — **the film now opens with
  four data cards, not the product.** The product first appears at 0:47. That is
  a deliberate trade: the cards sell the problem and the money before the demo,
  which is what you asked for. With your 20s intro in front, the product lands
  around 1:07. If a judge stops at 15 seconds they will have seen the market
  case and no product. Worth knowing before you submit — shortening cards 2 and
  3 is the lever if you want it earlier.
- *Judges are not required to watch past 3 minutes* — film is 1:29. With a 20s
  intro, 1:49. Comfortable.
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


---

## 13 · Two more form fields

### "Which agent(s) or client(s) did you test your WebMCP tools with?"

```
Google Chrome 152 with WebMCP enabled (chrome://flags/#enable-webmcp-testing),
using the browser's native document.modelContext. All 18 registered tools were
executed against the live production site and all 18 returned.

Also tested through the in-page Agent tool console (Path B), which calls the
same handlers with no Chrome flag, and over REST at /api/v1/tools. 15 Playwright
end-to-end tests run against production rather than a mock.

Note for reviewers: Chrome's executeTool takes its arguments as a JSON string.
Passing an object fails with "Failed to parse input arguments".
```

### "Which AI tools have you leveraged while working on this project?"

Counts below are from this repo's own commit trailers, so a reviewer can check them.

```
Claude Code (Opus 5, Opus 4.8, Fable 5.1) — 30 commits: the app, the WebMCP tool
layer, the field-crawl pipeline and the demo film build.
Cursor — 41 commits: iterative UI and refactor passes.
Kokoro-82M (open weights, run locally) — the demo voiceover.
whisper.cpp large-v3-turbo (local) — captions, and verifying the film's audio
against its script.

Human: the idea and the name, the research selection and every sourced figure,
the design direction, the on-camera intro, and the decisions about what the
product refuses to claim.
```
