"""Check the file that actually ships, not the parts it was made from.

The mux trims the picture to the voice, so the only honest place to ask "do the
picture and the sound agree" is the finished mp4.
"""
import pathlib
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
FILM = ROOT / "demo" / "demo-final.mp4"
MAX_SILENT_TAIL = 2.0


def probe(args):
    return subprocess.run(
        ["ffprobe", "-v", "error", *args, "-of", "csv=p=0", str(FILM)],
        capture_output=True, text=True, check=True,
    ).stdout.strip()


def main() -> int:
    if not FILM.exists():
        print(f"FATAL: {FILM} was never written")
        return 1

    total = float(probe(["-show_entries", "format=duration"]))
    audio = probe(["-select_streams", "a", "-show_entries", "stream=duration"])
    video = probe(["-select_streams", "v", "-show_entries", "stream=duration"])
    if not audio:
        print("FATAL: the film has no audio track — the rules require audio")
        return 1

    a, v = float(audio), float(video)
    fatal = []
    if v + 0.05 < a:
        fatal.append(f"video ends at {v:.1f}s, audio at {a:.1f}s — the last words play on a dead frame")
    if v > a + MAX_SILENT_TAIL:
        fatal.append(f"video runs {v - a:.1f}s past the last word — the film goes silent and keeps playing")
    if total > 180:
        fatal.append(f"{total:.0f}s is over the 3:00 judges are asked to watch")

    for f in fatal:
        print(f"FATAL: {f}")
    if fatal:
        return 1

    print(f"OK: film {total:.1f}s · video {v:.1f}s · audio {a:.1f}s · they agree")
    return 0


if __name__ == "__main__":
    sys.exit(main())
