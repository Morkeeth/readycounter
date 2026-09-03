# How to update the Devpost entry

Written for you to work through alone, in order. Everything referenced is in
`~/Downloads/ReadyCounter-Devpost-2026-09-03/`.

**Deadline: Friday 4 September, 01:00 PDT = 10:00 Paris.** Confirmed from the
Devpost page's own HTML (`2026-09-04T04:00:00-04:00`), not from our notes — the
22:00 in older docs was stale.

**Entry is currently a DRAFT.** Nothing below counts until step 9.

---

## 1 · YouTube — upload and make it PUBLIC

| Field | Value |
|---|---|
| File | `01-video/ReadyCounter-SUBMIT-THIS.mp4` |
| Title | `ReadyCounter — WebMCP Challenge` |
| Description | paste `05-text/YOUTUBE-DESCRIPTION.txt` |
| Captions | upload `01-video/ReadyCounter-SUBMIT-THIS.srt` |
| Visibility | **Public.** Not Unlisted. |

The rules say "public YouTube video". Unlisted is an eligibility risk, not a
taste question. If it is currently Unlisted, change it — that is the single
highest-value click on this page.

Copy the URL: `_______________________________________`

---

## 2 · Devpost → Edit → the text fields

Paste, in order:

| Devpost field | Paste from |
|---|---|
| Project name | `ReadyCounter` |
| Tagline | `Paste your store. See what shopping agents can't read.` |
| About the project | **`05-text/DEVPOST-ABOUT.md`** — written to their seven headings |
| Built with | `react, typescript, vite, webmcp, openai, shopify, render, vercel, node.js, playwright` |

`DEVPOST-ABOUT.md` is the current one. Ignore `DEVPOST-PASTE.md`; it is the older
long-form version and is stale.

**Read it before you paste it.** Devpost's own guidance says judges can tell an
unedited AI description, and they are right. Change a few sentences into your
voice — especially the Inspiration section, which should sound like you.

---

## 3 · Links

| Field | Value |
|---|---|
| Try it out | `https://readycounter.vercel.app/?judge=1` |
| GitHub | `https://github.com/Morkeeth/readycounter` |

Both verified live tonight. The repo is public with MIT detected by GitHub, and
the About section now points at the right homepage.

---

## 4 · The two WebMCP questions

**"Which agent(s) or client(s) did you test your WebMCP tools with?"**

```
Google Chrome 152 with WebMCP enabled (chrome://flags/#enable-webmcp-testing),
using the browser's native document.modelContext. All 18 registered tools were
executed against the live production site and all 18 returned.

Also driven end-to-end by GPT-5.4 through the OpenAI API: the model is given the
18 tool definitions and a shopping goal, chooses the calls itself, and the
browser executes them via document.modelContext. It searches, compares products,
adds to the shared cart, and is refused at prepare_checkout by the CAPTCHA.

Also tested through the in-page Agent tool console (no Chrome flag, same
handlers) and over REST at /api/v1/tools. 15 Playwright end-to-end tests run
against production, not a mock.

Note for reviewers: Chrome's executeTool takes its arguments as a JSON string.
Passing an object fails with "Failed to parse input arguments".
```

**"Which AI tools have you leveraged while working on this project?"**

```
Claude Code (Opus 5, Opus 4.8, Fable 5.1) — the app, the WebMCP tool layer, the
field-crawl pipeline and the demo film build.
Cursor — iterative UI and refactor passes.
OpenAI GPT-5.4 — ships IN the product as the shopping agent, via the OpenAI API.
Kokoro-82M (open weights, local) — the demo voiceover.
whisper.cpp large-v3-turbo (local) — captions, and checking the film's audio
against its script.

Human: the idea and the name, the research selection and every sourced figure,
the design direction, the on-camera intro, and the decisions about what the
product refuses to claim.

Worth noting: the readiness SCORE makes no model calls. It is arithmetic over a
crawl, checked against published specs, so a judge's run is deterministic and
cannot be talked into a better number by words on a storefront. The model is the
shopper, never the judge.
```

---

## 5 · Testing instructions

Point them at the file — it is written for a stranger:
`https://github.com/Morkeeth/readycounter/blob/main/TESTING.md`

Short version for the form:

```
No signup, no install, no key.

60 seconds: https://readycounter.vercel.app/?judge=1
  Add an item — it lands in the shared order tagged HUMAN.
  Connect → For developers and judges → Agent tool console → add_to_order.
  Same order, tagged AGENT. Then prepare_checkout — it refuses, names the
  CAPTCHA, and cites the published share. No card is ever charged.

Watch a real model do it: on the Co-shop tab, "Let a model shop the store".
GPT-5.4 picks the calls; the browser runs them through document.modelContext.

Score a real store: https://readycounter.vercel.app/?audit_url=https://colourpop.com

Skeptic path:
  curl -s https://readycounter.vercel.app/api/v1/rankings | jq '{succeeded,shopCount}'
  npm ci && npm run verify && npx playwright test
```

---

## 6 · Image gallery

Upload `02-gallery/` **in filename order**. The first image becomes the
thumbnail, so `01-THUMBNAIL-upload-first.png` must go first.

All eight are ≤1600px and under 450 KB. The earlier set was rendered at 2×
(2560×1440), which is what the uploader rejected.

---

## 7 · Team and eligibility

- Solo entry — nothing to add unless you want someone on it.
- Repo public, MIT visible in the About section. Checked tonight.
- Live URL works in Chrome with WebMCP enabled. Checked tonight.

---

## 8 · The one thing only you can do

**Open `https://readycounter.vercel.app/?judge=1` in ChatGPT's in-app browser
and fire one tool.** Two checklist lines are exactly that, and no script can
close them. Path B needs no flag, so it will work even if that browser does not
expose `document.modelContext`.

---

## 9 · Submit

Devpost reports the entry as `submission_draft` until you press it. **Press it.**

Then **do not push to the repo** — a push redeploys the site the judges are on.

---

## If you want to change the film

```
cd ~/CODE/tooltruth-webmcp
./film/build.sh              # rebuild everything, ~6 min
./film/build.sh --subs       # the burned-in-captions cut
./film/prepend-intro.sh ~/Desktop/Readycounterintro.mov
```

The build fails rather than shipping a film whose picture and audio disagree,
and `film/verify_film.py` checks the file that actually ships.

To re-record just your intro, replace the file on the Desktop and run
`prepend-intro.sh` again — it levels your audio to match, shifts every caption
by the real intro length, and warns if the whole thing goes over three minutes.

---

## What changed tonight, if a judge asks

| | |
|---|---|
| Trust | The field companion quoted 31% / 22% while the receipt charged the cited 24% / 15%. Both now quote the same rows. |
| Trust | A crawl-only audit returned `fullScore: 78` while four lines were NOT MEASURED. It returns `null` now. |
| Interop | `TOOL_MANIFEST` carried no `inputSchema`, so `/api/v1/tools` advertised 18 uncallable tools and models were handed an empty schema. Fixed, with a build check that fails if it regresses. |
| Interop | `get_product` took `id` while `add_to_order` took `product_id`; a real model looped six times on the mismatch. Every product tool now reads either. |
| Interop | `search_catalog("espresso beans")` returned nothing from a store selling "House Espresso Blend". It matches tokens now. |
| Safety | The agent endpoint had no rate limit on a public URL spending a real key. 40/IP/hour, 600/day. |

Every one of those was found by pointing a real agent at the product, which is
a reasonable thing to say out loud in the description.
