"""Intro deck — the four cards that sell the problem before the product appears.

One card per narration paragraph p00..p03, each held exactly as long as the
sentence that describes it (durations from film/cues.py, never hardcoded).

The cards animate: figures count up, and the 148-tile wall builds itself. That
is the "moves" the old film did not have — the numbers arrive rather than
sitting there.
"""
import pathlib
import shutil
import subprocess
import sys

from playwright.sync_api import sync_playwright

import captions
from cues import load

ROOT = pathlib.Path(__file__).resolve().parent.parent
DECK = ROOT / "demo" / "intro.html"
OUT = ROOT / "demo" / "seg-intro.mp4"
TMP = ROOT / "demo" / ".intro-raw"

#: Cards map to paragraphs 3..5 — the film opens on the product now.
PARAGRAPHS = [3, 4, 5]


def main() -> int:
    plan = load()
    beats = plan["beats"]

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
        pg.goto(DECK.as_uri(), wait_until="load")
        pg.evaluate("() => document.fonts.ready")
        pg.wait_for_timeout(1200)

        for card, para in enumerate(PARAGRAPHS):
            pg.evaluate(f"() => window.__show({card})")
            captions.show(pg, para)
            pg.wait_for_timeout(int(beats[para] * 1000))

        video = pg.video
        ctx.close()
        b.close()
        raw = pathlib.Path(video.path())

    subprocess.run(
        [
            "ffmpeg", "-y", "-loglevel", "error", "-i", str(raw),
            "-vf", "scale=1920:1080:flags=lanczos,fps=30",
            "-c:v", "libx264", "-preset", "medium", "-crf", "21",
            "-pix_fmt", "yuv420p", str(OUT),
        ],
        check=True,
    )
    shutil.rmtree(TMP, ignore_errors=True)

    dur = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(OUT)],
        capture_output=True, text=True, check=True,
    ).stdout.strip()
    want = sum(beats[i] for i in PARAGRAPHS)
    print(f"WROTE {OUT} ({dur}s, {len(PARAGRAPHS)} cards, wanted {want:.1f}s)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
