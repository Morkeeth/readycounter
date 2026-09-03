"""Browser segment — drives the LIVE ReadyCounter film beats in Chromium.

v2: co-shop + WebMCP proof in the first 30s (EYES submit rank).
"""
from playwright.sync_api import sync_playwright
import pathlib
import shutil
import subprocess
import sys

from cues import load

ROOT = pathlib.Path(__file__).resolve().parent.parent
BASE = "https://readycounter.vercel.app"
OUT = ROOT / "demo" / "seg-browser.mp4"
TMP = ROOT / "demo" / ".browser-raw"

RECORD = "film=1&record=1&cues=0"

# One beat per narration paragraph, p00..p07. The closing paragraph p08 plays
# over the outro card, so the browser records eight beats, not nine.
#
# Beat DURATIONS are not written here — they come from film/cues.py, which
# measures the rendered voice. A beat is exactly as long as the sentence that
# describes it.
BEATS = [
    # p00 · the hook, on the front door with the wall already on screen
    (f"/?{RECORD}&view=integrations", "hook"),
    # p01 · the problem: 8x traffic, 78.6% abandoned
    (f"/?{RECORD}&view=integrations", "problem"),
    # p02 · the census wall — 148 asked, 70 silent, 67 hollow
    (f"/?{RECORD}&view=integrations", "wall"),
    # p03 · the eleven who have it and hide it
    (f"/?{RECORD}&view=integrations", "brands"),
    # p04 · the blank barcode
    (f"/?{RECORD}&view=integrations", "barcode"),
    # p05 · the stores, each broken a different way
    (f"/?{RECORD}&view=integrations&judge=1", "stores"),
    # p06 · the bill, priced from a published share
    (f"/?{RECORD}&beat=0&store=ember-oak&view=merchant", "bill"),
    # p07 · WebMCP proof: one cart, 18 tools
    (f"/?{RECORD}&beat=7&view=shop", "webmcp"),
]

CURSOR = """
(() => {
  const d = document.createElement('div');
  d.id = '__vo_cursor';
  d.style.cssText = 'position:fixed;z-index:2147483647;width:18px;height:18px;'
    + 'margin:-9px 0 0 -9px;border-radius:50%;background:rgba(196,92,38,.35);'
    + 'border:2px solid #c45c26;pointer-events:none;left:-100px;top:-100px;'
    + 'transition:left .35s ease,top .35s ease;';
  document.documentElement.appendChild(d);
  window.__vo_to = (x, y) => { d.style.left = x + 'px'; d.style.top = y + 'px'; };
})()
"""


def settle(pg, selector: str):
    """Bring the thing the narration is talking about into frame, gently."""
    try:
        el = pg.locator(selector).first
        if el.count():
            el.scroll_into_view_if_needed(timeout=4000)
            pg.wait_for_timeout(700)
    except Exception:
        pass


def scroll(pg, dy: int, ms: int = 0):
    pg.mouse.wheel(0, dy)
    pg.wait_for_timeout(ms or 0)


def maybe_click(pg, selector: str):
    try:
        el = pg.locator(selector).first
        if el.count() and el.is_visible():
            el.scroll_into_view_if_needed()
            box = el.bounding_box()
            if box:
                pg.evaluate(
                    "([x,y])=>window.__vo_to(x,y)",
                    [box["x"] + box["width"] / 2, box["y"] + box["height"] / 2],
                )
                pg.wait_for_timeout(500)
            el.click(timeout=3000)
    except Exception:
        pass


def main():
    if TMP.exists():
        shutil.rmtree(TMP)
    with sync_playwright() as p:
        b = p.chromium.launch()
        ctx = b.new_context(
            viewport={"width": 1920, "height": 1080},
            record_video_dir=str(TMP),
            record_video_size={"width": 1920, "height": 1080},
        )
        pg = ctx.new_page()
        pg.add_init_script(CURSOR)

        plan = load()
        beats = plan["beats"]

        for i, (path, name) in enumerate(BEATS):
            hold_ms = int(beats[i] * 1000)
            pg.goto(BASE + path, wait_until="domcontentloaded", timeout=60000)
            pg.evaluate(CURSOR)
            pg.wait_for_timeout(1600)  # let the live rankings land before we film

            if name in ("hook", "problem"):
                settle(pg, ".census__tiles")
            elif name == "wall":
                settle(pg, ".census__key")
            elif name == "brands":
                settle(pg, ".census__brands")
            elif name == "barcode":
                settle(pg, ".barcode__strip")
            elif name == "stores":
                settle(pg, ".sandbox-showcase, [class*='sandbox']")
                scroll(pg, 220, 600)
            elif name == "bill":
                settle(pg, ".tape, .readiness-tape, [class*='tape']")
                scroll(pg, 260, 700)
            elif name == "webmcp":
                maybe_click(pg, "button:has-text('Add to order')")
                maybe_click(pg, "button:has-text('ADD TO ORDER')")
                scroll(pg, 260, 700)

            spent = 1600 + 700
            pg.wait_for_timeout(max(600, hold_ms - spent))

        video = pg.video
        ctx.close()
        b.close()
        raw = pathlib.Path(video.path())

    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-loglevel",
            "error",
            "-i",
            str(raw),
            "-vf",
            "scale=1920:1080:flags=lanczos,fps=30",
            "-c:v",
            "libx264",
            "-preset",
            "medium",
            "-crf",
            "21",
            "-pix_fmt",
            "yuv420p",
            str(OUT),
        ],
        check=True,
    )
    shutil.rmtree(TMP, ignore_errors=True)
    dur = subprocess.run(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "csv=p=0",
            str(OUT),
        ],
        capture_output=True,
        text=True,
        check=True,
    ).stdout.strip()
    print(f"WROTE {OUT} ({dur}s)")


if __name__ == "__main__":
    sys.exit(main())
