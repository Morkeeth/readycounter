"""Lay each narration paragraph onto the picture beat it describes."""
import pathlib
import subprocess

PARTS = pathlib.Path("demo/.vo-parts")
OUT = pathlib.Path("demo/voiceover.mp3")
SR = 24000

# v2 cues — co-shop opens after 5s flipbook intro; no silence >2s.
CUES = {
    0: 0.4,
    1: 5.0,
    2: 18.0,
    3: 28.0,
    4: 36.5,
    5: 45.0,
    6: 60.0,
    7: 75.0,
    8: 90.0,
}


def dur(p):
    return float(
        subprocess.run(
            [
                "ffprobe",
                "-v",
                "error",
                "-show_entries",
                "format=duration",
                "-of",
                "csv=p=0",
                str(p),
            ],
            capture_output=True,
            text=True,
            check=True,
        ).stdout.strip()
    )


def main():
    parts = sorted(PARTS.glob("p*.mp3"))
    assert len(parts) == len(CUES), f"{len(parts)} parts vs {len(CUES)} cues"
    inputs, filters, labels = [], [], []
    for i, p in enumerate(parts):
        inputs += ["-i", str(p)]
        delay = int(CUES[i] * 1000)
        filters.append(f"[{i}:a]aresample={SR},adelay={delay}|{delay}[a{i}]")
        labels.append(f"[a{i}]")
    filters.append(
        "".join(labels)
        + f"amix=inputs={len(parts)}:normalize=0,"
        + "alimiter=level_in=1:level_out=0.95[out]"
    )
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-loglevel",
            "error",
            *inputs,
            "-filter_complex",
            ";".join(filters),
            "-map",
            "[out]",
            "-c:a",
            "libmp3lame",
            "-b:a",
            "192k",
            str(OUT),
        ],
        check=True,
    )

    vo_dur = dur(OUT)
    pic = pathlib.Path("demo/.picture.mp4")
    pic_dur = dur(pic) if pic.exists() else None

    over = [
        (i, CUES[i] + dur(p))
        for i, p in enumerate(parts)
        if i + 1 in CUES and CUES[i] + dur(p) > CUES[i + 1] + 0.15
    ]
    gaps = [
        (i, CUES[i + 1] - (CUES[i] + dur(parts[i])))
        for i in range(len(parts) - 1)
        if CUES[i + 1] - (CUES[i] + dur(parts[i])) > 2.0
    ]
    tail = (pic_dur - vo_dur) if pic_dur else None

    for i, end in over:
        print(f"WARN: paragraph {i} runs to {end:.1f}s, overlaps cue {i + 1} at {CUES[i + 1]}s")
    for i, gap in gaps:
        print(f"WARN: {gap:.1f}s silence after paragraph {i} (>{2}s)")
    if tail is not None and tail > 2.0:
        print(f"WARN: {tail:.1f}s video tail after voice ends (>{2}s)")
    if not over and not gaps and (tail is None or tail <= 2.0):
        print("OK: no overlaps, no mid gaps >2s, tail ok")
    print(f"WROTE {OUT} ({vo_dur:.1f}s)")


if __name__ == "__main__":
    main()
