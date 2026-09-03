"""Browser segment — drives the LIVE ReadyCounter film beats in Chromium.

v2: co-shop + WebMCP proof in the first 30s (EYES submit rank).
"""
from playwright.sync_api import sync_playwright
import pathlib
import shutil
import subprocess
import sys
import time

import captions
from cues import load

ROOT = pathlib.Path(__file__).resolve().parent.parent
BASE = "https://readycounter.vercel.app"
GROUP = (sys.argv[1] if len(sys.argv) > 1 else "a").lower()
OUT = ROOT / "demo" / f"seg-browser-{GROUP}.mp4"
TMP = ROOT / "demo" / f".browser-raw-{GROUP}"

RECORD = "film=1&record=1&cues=0"

# Browser beats, in two groups, because the film now opens on the PRODUCT.
#
# Group A (paragraphs 0-2) is the cold open: paste a real domain, watch the
# score land, then a real agent shops the store and hits the CAPTCHA. The
# organisers ask for the working product inside 10-15 seconds and this puts it
# at second one.
#
# Group B (paragraphs 6-7) is the bill and the integrations, after the field.
SEGMENTS = {
    "a": [
        (0, f"/?{RECORD}&view=integrations", "paste"),
        (1, f"/?{RECORD}&view=integrations", "joined"),
        (2, f"/?{RECORD}&judge=1", "agent"),
    ],
    "b": [
        (6, f"/?{RECORD}&beat=0&store=ember-oak&view=merchant", "bill"),
        (7, f"/?{RECORD}&view=integrations", "partners"),
    ],
}

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

        last_path = None
        for para, path, name in SEGMENTS[GROUP]:
            hold_ms = int(beats[para] * 1000)
            t0 = time.monotonic()
            if path != last_path:
                pg.goto(BASE + path, wait_until="domcontentloaded", timeout=60000)
                pg.evaluate(CURSOR)
                pg.wait_for_timeout(1500)
            last_path = path
            captions.show(pg, para)

            if name == "paste":
                # type it like a person and submit; the score lands in the next beat,
                # which is exactly what the next sentence is about
                try:
                    box = pg.locator("input.stranger-path__input, .stranger-path__form input").first
                    box.scroll_into_view_if_needed(timeout=4000)
                    box.click(timeout=4000)
                    box.type("colourpop.com", delay=55)
                    pg.wait_for_timeout(300)
                    pg.get_by_role("button", name="Score my store").first.click(timeout=5000)
                except Exception as e:
                    print(f"  ! paste beat: {e}")

            elif name == "joined":
                # same page, still loading: the score arrives, the tile joins, the
                # barcode prints what it found
                try:
                    pg.wait_for_selector(".stranger-path__result", timeout=20000)
                    settle(pg, ".stranger-path__score")
                    pg.wait_for_timeout(700)
                    settle(pg, ".barcode__strip")
                except Exception as e:
                    print(f"  ! joined beat: {e}")

            elif name == "agent":
                panel = pg.locator(".agent-shopper").first
                if panel.count():
                    panel.scroll_into_view_if_needed(timeout=6000)
                    pg.wait_for_timeout(500)
                    # The panel only exists on the co-shop tab, so it cannot be
                    # pre-started from the previous beat. And the click must wait
                    # for React to hydrate: 1.5s after navigation the button is in
                    # the DOM but inert, which is why the beat kept reporting
                    # "blocked: False" while a hand-driven run reached the CAPTCHA
                    # in 4.5 seconds.
                    # Wait for readiness, not a fixed delay. Eight seconds of
                    # fixed waiting left the model only ~12s of a 20s beat and it
                    # was still mid-loop when the beat ended: 7 rows, no error,
                    # still busy — the CAPTCHA landed just after the cut.
                    clicked = False
                    try:
                        pg.wait_for_selector(".agent-shopper button", state="visible", timeout=12000)
                        pg.get_by_role("button", name="Send the agent").first.click(timeout=5000)
                        clicked = True
                    except Exception as e:
                        print(f"  ! agent beat: {e}")
                    if not clicked:
                        print("  ! agent beat: could not press Send the agent")
                    deadline = t0 + beats[para] - 1.0
                    while time.monotonic() < deadline:
                        pg.wait_for_timeout(600)
                        try:
                            panel.scroll_into_view_if_needed(timeout=1500)
                        except Exception:
                            pass
                    diag = pg.evaluate("""() => ({
                        rows: document.querySelectorAll('.agent-shopper__row').length,
                        blocked: !!document.querySelector('.agent-shopper__blocked'),
                        err: document.querySelector('.agent-shopper__row--error')?.innerText?.slice(0,120) ?? '',
                        busy: !!document.querySelector('button[disabled]'),
                    })""")
                    print(f"  · agent beat: {diag}")
                else:
                    print("  ! agent panel missing")

            elif name == "bill":
                # Deliberately NOT clicking "Run agent journey": it completes
                # asynchronously and switches the tab to Co-shop, which then
                # hijacked the next beat — the partners narration played over
                # the shop.
                settle(pg, ".tape, .readiness-tape, [class*='tape']")
                scroll(pg, 320, 1000)
                scroll(pg, 300, 900)

            spent_ms = int((time.monotonic() - t0) * 1000)
            pg.wait_for_timeout(max(200, hold_ms - spent_ms))

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
