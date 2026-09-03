"""Captions rendered at record time, because this ffmpeg cannot burn them.

The Homebrew build here is compiled without libass and without freetype, so the
subtitles, ass and drawtext filters do not exist:

    ffmpeg -filters | grep -E ' (ass|subtitles|drawtext) '   ->  nothing

So the caption is drawn by the page while it is being recorded, in the app's own
typeface. Set RC_SUBS=1 to turn it on.
"""
import os
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
PARTS = ROOT / "demo" / ".vo-parts"


def enabled() -> bool:
    return os.environ.get("RC_SUBS") == "1"


BAR_JS = """
(() => {
  if (document.getElementById('__rc_cap')) return;
  const wrap = document.createElement('div');
  wrap.id = '__rc_cap';
  wrap.style.cssText = [
    'position:fixed', 'left:0', 'right:0', 'bottom:0', 'z-index:2147483646',
    'display:flex', 'justify-content:center', 'padding:0 0 54px',
    'pointer-events:none', 'font-family:"Bricolage Grotesque",Helvetica,Arial,sans-serif'
  ].join(';');
  const box = document.createElement('div');
  box.id = '__rc_cap_box';
  box.style.cssText = [
    'max-width:1380px', 'background:#101010', 'color:#f5f5f7',
    'font-size:30px', 'font-weight:700', 'line-height:1.34',
    'letter-spacing:-0.01em', 'padding:16px 26px', 'text-align:center'
  ].join(';');
  wrap.appendChild(box);
  document.documentElement.appendChild(wrap);
  window.__rc_caption = (t) => {
    const b = document.getElementById('__rc_cap_box');
    if (!b) return;
    b.textContent = t || '';
    b.style.visibility = t ? 'visible' : 'hidden';
  };
})()
"""


def text_for(index: int) -> str:
    """The narration paragraph, exactly as spoken."""
    f = PARTS / f"p{index:02d}.txt"
    if not f.exists():
        return ""
    lines = [l for l in f.read_text().splitlines() if l.strip() and not l.startswith("@")]
    return " ".join(lines)


def install(pg) -> None:
    if not enabled():
        return
    pg.evaluate(BAR_JS)


def show(pg, index: int) -> None:
    if not enabled():
        return
    try:
        pg.evaluate(BAR_JS)
        pg.evaluate("(t) => window.__rc_caption(t)", text_for(index))
    except Exception:
        pass
