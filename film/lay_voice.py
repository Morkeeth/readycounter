"""Lay each narration paragraph onto the picture beat it describes.

Cues come from film/cues.py, which measures the rendered audio. Overlap is
therefore impossible by construction — and if the checks below ever fire the
build STOPS, because a warning that exits 0 is a warning nobody reads.
"""
import pathlib
import subprocess
import sys

from cues import PAUSE, load

ROOT = pathlib.Path(__file__).resolve().parent.parent
PARTS = ROOT / "demo" / ".vo-parts"
OUT = ROOT / "demo" / "voiceover.mp3"
SR = 24000


def dur(p):
    return float(
        subprocess.run(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)],
            capture_output=True,
            text=True,
            check=True,
        ).stdout.strip()
    )


def main():
    parts = sorted(PARTS.glob("p*.mp3"))
    plan = load()
    cues = plan["cues"]
    if len(parts) != len(cues):
        print(f"FATAL: {len(parts)} parts vs {len(cues)} cues — rerun film/cues.py")
        return 1

    inputs, filters, labels = [], [], []
    for i, p in enumerate(parts):
        inputs += ["-i", str(p)]
        delay = int(cues[i] * 1000)
        filters.append(f"[{i}:a]aresample={SR},adelay={delay}|{delay}[a{i}]")
        labels.append(f"[a{i}]")
    filters.append(
        "".join(labels)
        + f"amix=inputs={len(parts)}:normalize=0,"
        + "alimiter=level_in=1:level_out=0.95[out]"
    )
    subprocess.run(
        [
            "ffmpeg", "-y", "-loglevel", "error", *inputs,
            "-filter_complex", ";".join(filters),
            "-map", "[out]", "-c:a", "libmp3lame", "-b:a", "192k", str(OUT),
        ],
        check=True,
    )

    vo_dur = dur(OUT)
    pic = ROOT / "demo" / ".picture.mp4"
    pic_dur = dur(pic) if pic.exists() else None

    fatal = []
    for i, p in enumerate(parts):
        end = cues[i] + dur(p)
        if i + 1 < len(cues) and end > cues[i + 1] + 0.05:
            fatal.append(
                f"paragraph {i} runs to {end:.1f}s and paragraph {i + 1} starts at "
                f"{cues[i + 1]:.1f}s — they would play over each other"
            )
    for i in range(len(parts) - 1):
        gap = cues[i + 1] - (cues[i] + dur(parts[i]))
        if gap > PAUSE + 2.0:
            fatal.append(f"{gap:.1f}s of silence after paragraph {i}")
    if pic_dur is not None and pic_dur + 0.05 < vo_dur:
        fatal.append(
            f"picture is {pic_dur:.1f}s but the voice runs {vo_dur:.1f}s — "
            f"the last {vo_dur - pic_dur:.1f}s would play over a dead frame"
        )
    # The mirror of that check lives in film/verify_film.py, which runs on the
    # muxed file — the mux trims the picture to the voice, so checking the
    # untrimmed picture here would fail on padding that never ships.

    if fatal:
        for f in fatal:
            print(f"FATAL: {f}")
        return 1

    print(f"OK: {len(parts)} paragraphs, no overlap, no long gap, picture covers the voice")
    print(f"WROTE {OUT} ({vo_dur:.1f}s)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
