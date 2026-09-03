"""The integrations beat — Shopify OAuth, Shopify Catalog MCP, Render Key Value.

Recorded in its OWN context. Inside the shared browser recording this beat kept
drifting to Co-shop even though document.querySelector('.tabs__btn--active')
reported "Connect" the whole time, and clearing storage did not fix it. A fresh
context has none of the earlier beats' state, and is deterministic.
"""
import pathlib
import shutil
import subprocess
import sys

from playwright.sync_api import sync_playwright

import captions
from cues import load

ROOT = pathlib.Path(__file__).resolve().parent.parent
BASE = "https://readycounter.vercel.app"
OUT = ROOT / "demo" / "seg-partners.mp4"
TMP = ROOT / "demo" / ".partners-raw"

#: This beat narrates paragraph 7.
PARAGRAPH = 7


def main() -> int:
    plan = load()
    hold = plan["beats"][PARAGRAPH]

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
        pg.goto(f"{BASE}/?film=1&record=1&cues=0&view=integrations",
                wait_until="domcontentloaded", timeout=60000)
        pg.wait_for_timeout(4500)
        captions.show(pg, PARAGRAPH)

        tab = pg.evaluate("() => document.querySelector('.tabs__btn--active')?.textContent?.trim()")
        if tab != "Connect":
            print(f"  ! partners: landed on '{tab}', not Connect")

        pg.evaluate("() => document.querySelectorAll('details').forEach(d => d.open = true)")
        pg.wait_for_timeout(800)

        # Walk the three integrations in the order the narration names them.
        for target in ("Connect Shopify OAuth", "Sandbox stores", "Render partnership"):
            el = pg.get_by_text(target, exact=False).first
            if el.count():
                el.scroll_into_view_if_needed(timeout=5000)
            else:
                print(f"  ! partners: '{target}' not on the page")
            pg.wait_for_timeout(int(hold * 1000 / 3))

        video = pg.video
        ctx.close()
        b.close()
        raw = pathlib.Path(video.path())

    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", str(raw),
         "-vf", "scale=1920:1080:flags=lanczos,fps=30",
         "-c:v", "libx264", "-preset", "medium", "-crf", "21",
         "-pix_fmt", "yuv420p", str(OUT)],
        check=True,
    )
    shutil.rmtree(TMP, ignore_errors=True)
    dur = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(OUT)],
        capture_output=True, text=True, check=True).stdout.strip()
    print(f"WROTE {OUT} ({dur}s)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
