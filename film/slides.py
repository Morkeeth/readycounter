"""Intro + outro title cards from demo/flipbook.html."""
from playwright.sync_api import sync_playwright
import pathlib
import shutil
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
FLIP = ROOT / "demo" / "flipbook.html"
OUT_INTRO = ROOT / "demo" / "seg-intro.mp4"
OUT_OUTRO = ROOT / "demo" / "seg-outro.mp4"
TMP = ROOT / "demo" / ".slides-raw"
SHOTS = ROOT / "demo" / ".slide-shots"


def show_card(page, card_id: str):
    page.evaluate(
        """(id) => {
      const ids = ['f0','f1','f2','f3'];
      ids.forEach((x) => {
        const el = document.getElementById(x);
        if (el) el.classList.toggle('hidden', x !== id);
      });
    }""",
        card_id,
    )


def capture_pngs(page):
    SHOTS.mkdir(exist_ok=True)
    for cid in ("f0", "f1", "f2", "f3"):
        show_card(page, cid)
        page.wait_for_timeout(200)
        page.screenshot(path=str(SHOTS / f"{cid}.png"))


def png_to_mp4(png: pathlib.Path, seconds: float, out: pathlib.Path):
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-loglevel",
            "error",
            "-loop",
            "1",
            "-t",
            str(seconds),
            "-i",
            str(png),
            "-vf",
            "fps=30,scale=1920:1080:flags=lanczos,format=yuv420p",
            "-c:v",
            "libx264",
            "-preset",
            "medium",
            "-crf",
            "21",
            str(out),
        ],
        check=True,
    )


def record_intro_video(page):
    if TMP.exists():
        shutil.rmtree(TMP)
    ctx = page.context
    page.set_viewport_size({"width": 1920, "height": 1080})
    page.goto(FLIP.as_uri(), wait_until="load")
    page.evaluate("() => document.querySelector('.nav')?.remove()")
    show_card(page, "f0")
    page.wait_for_timeout(5000)
    show_card(page, "f1")
    page.wait_for_timeout(2000)


def main():
    SHOTS.mkdir(exist_ok=True)
    with sync_playwright() as p:
        b = p.chromium.launch()
        ctx = b.new_context(viewport={"width": 1920, "height": 1080})
        pg = ctx.new_page()
        pg.goto(FLIP.as_uri(), wait_until="load")
        pg.evaluate("() => document.querySelector('.nav')?.remove()")
        capture_pngs(pg)
        ctx.close()
        b.close()

    # The closing card must outlast the closing paragraph, or the film ends on a
    # dead frame with the voice still talking. Measured, never guessed.
    from cues import load

    plan = load()
    # The intro is film/intro.py now — animated cards, not a still.
    png_to_mp4(SHOTS / "f3.png", plan["beats"][-1], OUT_OUTRO)
    print("WROTE", OUT_OUTRO, f"(outro {plan['beats'][-1]}s)")


if __name__ == "__main__":
    sys.exit(main())
