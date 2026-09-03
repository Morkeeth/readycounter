"""The native WebMCP beat — real Chrome, real document.modelContext.

Everything else in the film can be shot in headless Chromium. This beat cannot:
document.modelContext only exists in Chrome with the WebMCP feature enabled, and
showing the fallback console here would be filming the wrong thing on a WebMCP
submission.

Probed on Chrome 152: --enable-features=WebMCP exposes document.modelContext
with registerTool / getTools / executeTool. Arguments go in as a JSON STRING;
passing an object fails with "Failed to parse input arguments".
"""
import pathlib
import shutil
import subprocess
import sys
import time

from playwright.sync_api import sync_playwright

import captions
from cues import load

ROOT = pathlib.Path(__file__).resolve().parent.parent
BASE = "https://readycounter.vercel.app"
OUT = ROOT / "demo" / "seg-webmcp.mp4"
TMP = ROOT / "demo" / ".webmcp-raw"

#: This beat narrates paragraph 8.
PARAGRAPH = 8

# A console drawn over the page so the viewer sees the actual calls, not just
# their effect. Ink on paper, the app's typeface.
PANEL = """
(() => {
  const d = document.createElement('div');
  d.id = '__mcp';
  d.style.cssText = [
    'position:fixed','right:32px','top:32px','width:560px','z-index:2147483645',
    'background:#101010','color:#f5f5f7','padding:20px 22px',
    'font-family:"Bricolage Grotesque",Helvetica,Arial,sans-serif','font-size:17px',
    'line-height:1.45','box-shadow:0 18px 60px rgba(0,0,0,.28)'
  ].join(';');
  d.innerHTML = '<div style="font-size:12px;letter-spacing:.18em;text-transform:uppercase;'
    + 'color:#9a9a96;font-weight:700;margin-bottom:12px">document.modelContext · native</div>'
    + '<div id="__mcp_body"></div>';
  document.documentElement.appendChild(d);
  window.__mcp_line = (t, tone) => {
    const b = document.getElementById('__mcp_body');
    const row = document.createElement('div');
    row.style.cssText = 'margin:0 0 9px;font-weight:' + (tone === 'head' ? '700' : '400')
      + ';color:' + (tone === 'bad' ? '#ff8a75' : tone === 'good' ? '#8ab4ff' : '#f5f5f7');
    row.textContent = t;
    b.appendChild(row);
  };
})()
"""


def main() -> int:
    plan = load()
    hold = plan["beats"][PARAGRAPH]

    if TMP.exists():
        shutil.rmtree(TMP)

    with sync_playwright() as p:
        b = p.chromium.launch(channel="chrome", args=["--enable-features=WebMCP"])
        ctx = b.new_context(
            viewport={"width": 1920, "height": 1080},
            record_video_dir=str(TMP),
            record_video_size={"width": 1920, "height": 1080},
        )
        pg = ctx.new_page()
        pg.goto(f"{BASE}/?judge=1", wait_until="domcontentloaded", timeout=60000)
        pg.wait_for_timeout(5000)
        captions.show(pg, PARAGRAPH)

        native = pg.evaluate("() => typeof document.modelContext")
        if native != "object":
            print("FATAL: document.modelContext is missing — Chrome did not enable WebMCP")
            ctx.close()
            b.close()
            return 1

        count = pg.evaluate("async () => (await document.modelContext.getTools()).length")
        print(f"  · {count} tools on native document.modelContext")

        # Hand it to a real model. The agent picks the calls; this page runs them
        # through document.modelContext. Nothing here is scripted.
        panel = pg.locator(".agent-shopper").first
        if not panel.count():
            print("  ! the agent shopper panel is not on the page")
        else:
            panel.scroll_into_view_if_needed(timeout=6000)
            pg.wait_for_timeout(700)
            try:
                pg.get_by_role("button", name="Send the agent").first.click(timeout=8000)
            except Exception as e:
                print(f"  ! could not start the agent: {e}")

        # Let the loop play out on camera for the rest of the beat.
        end = time.monotonic() + max(3.0, hold - 7.0)
        while time.monotonic() < end:
            pg.wait_for_timeout(900)
            try:
                panel.scroll_into_view_if_needed(timeout=2000)
            except Exception:
                pass
        rows = pg.evaluate("() => document.querySelectorAll('.agent-shopper__row').length")
        blocked = pg.evaluate("() => !!document.querySelector('.agent-shopper__blocked')")
        print(f"  · agent produced {rows} log rows · blocked at checkout: {blocked}")
        pg.wait_for_timeout(1200)
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
    print(f"WROTE {OUT} ({dur}s, native WebMCP, {count} tools)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
