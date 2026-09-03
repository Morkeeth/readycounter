# Cloud receipt · ReadyCounter · WAVE 2026-09-04 · submit-pack truth

**Lane:** cloud verify only · **No outward acts** (no YouTube / Devpost submit / GitHub rename)  
**Branch object:** re-derived at live URLs and on-disk files · 2026-09-03 ~23:55 UTC  
**Entry:** https://devpost.com/software/readycounter already shows **Submitted to** The WebMCP Challenge

---

## Done-when

| # | Claim | Result | Command |
|---|-------|--------|---------|
| 1 | This receipt exists with curl/verify outputs | ✅ | `test -f docs/CLOUD-RECEIPT-rc-2026-09-04.md` |
| 2 | SUBMIT-READY deadline matches live Devpost | ✅ | header + CTA = `1:00am PDT` / iso `2026-09-04T04:00:00-04:00` |
| 3 | Oscar 15-min steps listed | ✅ | `submission/SUBMIT-READY.md` rewritten as **seal** checklist |

---

## Live objects (re-derived — do not carry)

### `/?judge=1`

```text
$ curl -sI "https://readycounter.vercel.app/?judge=1" | head -5
HTTP/2 200
…
content-type: text/html; charset=utf-8
```

Playwright against production:

```text
$ PLAYWRIGHT_BASE_URL=https://readycounter.vercel.app npx playwright test e2e/judge-mode.spec.ts
  1 passed — judge mode lands on Co-shop with Judge quick path banner
```

Screenshot: `docs/receipt-rc-2026-09-04/judge-mode.png`  
Banner text observed: `WEBMCP CHALLENGE · JUDGE PATH` · tab `CO-SHOP`.

### Rankings

```text
$ curl -s https://readycounter.vercel.app/api/v1/rankings \
  | jq '{succeeded,shopCount,avgGtinPct,ucp:.ucp.gtinWhereCrawlZero,at,rowCount:(.rows|length)}'
{
  "succeeded": 78,
  "shopCount": 148,
  "avgGtinPct": 0,
  "ucp": 11,
  "at": "2026-09-02T21:53:59.805Z",
  "rowCount": 148
}
```

### Tools / health

```text
$ curl -s https://readycounter.vercel.app/api/v1/tools | jq '{toolCount,version}'
{"toolCount":18,"version":"1"}

$ curl -s https://readycounter.vercel.app/api/v1/health | jq '{ok,kv,shopify}'
{"ok":true,"kv":{"backend":"redis","redisOk":true},"shopify":{"configured":true}}
```

### Demo film on disk

```text
$ ls -la demo/demo-final.mp4 submission/SUBMIT-READY.md
-rw-r--r-- … 9103586 … demo/demo-final.mp4
-rw-r--r-- … … submission/SUBMIT-READY.md

$ ffprobe -v error -show_entries format=duration,size -of default=noprint_wrappers=1 demo/demo-final.mp4
duration=141.266667
size=9103586
```

Frame @12s: `docs/receipt-rc-2026-09-04/demo-final-12s.png`  
YouTube on Devpost embed: `zyOK7XLKY8I` (oEmbed title `ReadyCounter -- WebMCP Challenge demo`). Length not re-derived — YouTube player API returned `LOGIN_REQUIRED` from this environment.

### Devpost deadline (live HTML)

```text
$ curl -sL https://webmcp.devpost.com/ | rg -o 'data-iso-date="[^"]+"|Deadline:[^<]+'
data-iso-date="2026-09-04T04:00:00-04:00"
Deadline: Sep  4, 2026 @  1:00am PDT
```

Paris conversion checked: `2026-09-04T04:00:00-04:00` → **01:00 PDT** · **10:00 CEST**.

### Verify

```text
$ npm run verify          # exit 0  (after npm install — cold tree lacked node_modules)
$ npm run check:numbers   # exit 0
```

Also green on prod: `e2e/stranger-pass.spec.ts`, `e2e/share-stranger.spec.ts`, `e2e/smoke.spec.ts`.

---

## Embarrassment finding (baseline vs ambitious)

**Baseline arm (naive):** read only the SUBMIT-READY header deadline → GREEN (`1:00am PDT` present).

**Ambitious arm:** scan the whole submit-path pack for `1pm PDT` → RED while header was still “correct”:

| File | Lie |
|------|-----|
| `submission/SUBMIT-READY.md:61` (pre-fix) | `Click **Submit** before 1pm PDT.` |
| `submission/README.md` | `Wed Sep 3, 2026 · 1pm PDT` |
| `FILM-READY.md` | same stale Wed 1pm line |

`verify-embarrassment.mjs` did not previously catch deadline lies. Added `\b1pm PDT\b` and `submission/README.md` to the scan.

**Control watched going RED then GREEN:**

```text
$ printf '\nBADLINE: submit before 1pm PDT\n' >> submission/SUBMIT-READY.md
$ node scripts/verify-embarrassment.mjs ; echo exit=$?
FAIL submission/SUBMIT-READY.md:94 — 1pm PDT …
verify-embarrassment: 1 failure(s)
exit=1

$ # remove planted line
$ node scripts/verify-embarrassment.mjs ; echo exit=$?
verify-embarrassment: no stale judge-facing copy
exit=0
```

Raw logs: `docs/receipt-rc-2026-09-04/embar-red.txt` · `embar-green.txt` · `curl-verify.txt` · `verify-ok.log`

Second lie found the same way: `submission/README.md` told Oscar `jq 'length'` on `/api/v1/tools` expects 18 — at the object that returns **4** (object keys). Fixed to `jq '{toolCount}'`.

Third: `submission/DEVPOST-UPDATE-GUIDE.md` still said **DRAFT**; public page shows **Submitted to**. Guide updated to point at seal, not cold draft.

---

## Oscar 15-min steps (only)

Open **`submission/SUBMIT-READY.md`** — seal checklist:

1. Re-derive rankings / judge / film locally (commands in file)
2. Confirm YouTube `zyOK7XLKY8I` is **Public** (eligibility)
3. Confirm Devpost owner view is **Submitted** (press Submit only if still draft)
4. ChatGPT in-app browser: fire one tool on `/?judge=1`
5. Stop — no push after seal

**Do NOT (Oscar or cloud):** YouTube publish/re-upload for taste · Devpost submit loops · rename GitHub

---

## SHIPPED this wave

- `docs/CLOUD-RECEIPT-rc-2026-09-04.md` + `docs/receipt-rc-2026-09-04/*`
- `submission/SUBMIT-READY.md` — seal checklist, deadline aligned to live HTML
- Deadline / probe fixes in `submission/README.md`, `FILM-READY.md`, `submission/DEVPOST-UPDATE-GUIDE.md`
- `scripts/verify-embarrassment.mjs` — catches stale `1pm PDT` (proven RED→GREEN)

## WRONG / OPEN

- Could not re-derive YouTube **duration** or **visibility** at the object (player API bot wall; oEmbed proves reachable, not Public)
- Rankings batch `at` is **2026-09-02** — still serves 78/148/0/11; cloud did not re-crawl
- Prior receipt claimed film **94.6s**; on-disk `demo/demo-final.mp4` is **~141.3s** — carrying the old figure would have been false
- `npm run verify` failed cold until `npm install` (missing `zustand`) — environment, not product
- Owner-only Devpost draft bit not visible without Oscar login; relied on public “Submitted to”
- Did not run `film/verify_film.py` against picture/audio agreement
