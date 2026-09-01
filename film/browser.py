"""Browser segment — drives the LIVE ReadyCounter film beats in Chromium."""
from playwright.sync_api import sync_playwright
import pathlib
import shutil
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
BASE = "https://tooltruth-webmcp.vercel.app"
OUT = ROOT / "demo" / "seg-browser.mp4"
TMP = ROOT / "demo" / ".browser-raw"

RECORD = "film=1&record=1&cues=0"

# v2 beat order — co-shop opens the picture (after 5s flipbook intro).
# Film timeline: 5–18 co-shop · 18–28 CAPTCHA · 28–45 connect+bill · 45–60 rankings
# · 60–75 delta · 75–90 ambition · 90–105 outro card (seg-outro).
BEATS = [
    (f"/?{RECORD}&beat=7&view=shop", 13000),
    (f"/?{RECORD}&beat=6&store=ember-oak&view=merchant", 10000),
    (f"/?{RECORD}&beat=2&store=ember-oak&view=merchant", 8000),
    (
        f"/?{RECORD}&beat=3&view=integrations&demo=1&audit_url=https://colourpop.com",
        9000,
    ),
    (f"/?{RECORD}&beat=4&view=integrations", 15000),
    (
        f"/?{RECORD}&beat=5&view=integrations&demo=1&audit_url=https://colourpop.com",
        15000,
    ),
    (f"/?{RECORD}&beat=8&view=integrations", 15000),
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

        for path, wait_ms in BEATS:
            pg.goto(BASE + path, wait_until="domcontentloaded", timeout=60000)
            pg.evaluate(CURSOR)
            pg.wait_for_timeout(1200)

            if "beat=7" in path:
                maybe_click(pg, "summary:has-text('Agent tool console')")
                pg.wait_for_timeout(800)
                maybe_click(pg, "button:has-text('add_to_order')")
                pg.wait_for_timeout(1200)
                scroll(pg, 280, 1200)
                maybe_click(pg, "button:has-text('Prepare checkout')")
                pg.wait_for_timeout(1500)
            elif "beat=6" in path:
                maybe_click(pg, "text=Autopilot")
                maybe_click(pg, "text=Journey")
                scroll(pg, 350, 1500)
            elif "beat=4" in path:
                maybe_click(pg, "text=UCP GTIN")
                maybe_click(pg, "text=scrape empty")
                scroll(pg, 500, 2000)
                scroll(pg, 500, 2000)
            elif "beat=3" in path or "beat=5" in path:
                maybe_click(pg, "button:has-text('Audit')")
                scroll(pg, 400, 1500)
            elif "beat=2" in path:
                scroll(pg, 450, 2000)
            elif "beat=8" in path:
                scroll(pg, 400, 1500)

            remaining = max(0, wait_ms - 2500)
            pg.wait_for_timeout(remaining)

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
