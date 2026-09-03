"""One source of truth for film timing: measure the voice, derive everything else.

Cues used to be a hardcoded dict. Two defects shipped from that:

  · paragraph 7 was cued at 81.5s and ran 10.4s, while paragraph 8 was cued at
    85.0s — so the mix played them ON TOP of each other for 6.9 seconds, and
    the .srt claimed both. lay_voice.py printed the warning and exited 0.
  · the outro card was a hardcoded 2.0s under a 9.6s closing paragraph, so the
    picture ended 4.8s before the audio did.

Both are impossible once every duration comes from the rendered audio. Nothing
downstream may hardcode a second.
"""
import json
import pathlib
import subprocess

ROOT = pathlib.Path(__file__).resolve().parent.parent
PARTS = ROOT / "demo" / ".vo-parts"
OUT = ROOT / "demo" / ".cues.json"

#: Silence between paragraphs. Long enough to read as a beat change, short
#: enough that lay_voice's >2s gap check stays meaningful.
PAUSE = 0.55

#: Extra picture held after the last word, so the film never cuts on a syllable.
TAIL = 0.9


def dur(p: pathlib.Path) -> float:
    return float(
        subprocess.run(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)],
            capture_output=True,
            text=True,
            check=True,
        ).stdout.strip()
    )


def build() -> dict:
    parts = sorted(PARTS.glob("p*.mp3"))
    if not parts:
        raise SystemExit(f"no rendered voice parts in {PARTS} — run film/split_voice.py first")

    durs = [dur(p) for p in parts]
    cues, t = [], 0.0
    for d in durs:
        cues.append(round(t, 3))
        t += d + PAUSE

    # Each paragraph gets exactly the picture it needs, plus the pause after it.
    beats = [round(d + PAUSE, 3) for d in durs]
    beats[-1] = round(durs[-1] + TAIL, 3)

    data = {
        "pause": PAUSE,
        "tail": TAIL,
        "count": len(parts),
        "durs": [round(d, 3) for d in durs],
        "cues": cues,
        "beats": beats,
        "voice_end": round(cues[-1] + durs[-1], 3),
        "picture": round(sum(beats), 3),
    }
    OUT.write_text(json.dumps(data, indent=2) + "\n")
    return data


def load() -> dict:
    if not OUT.exists():
        return build()
    return json.loads(OUT.read_text())


if __name__ == "__main__":
    d = build()
    print(f"WROTE {OUT}")
    print(f"  {d['count']} paragraphs · voice ends {d['voice_end']}s · picture {d['picture']}s")
    for i, (c, du) in enumerate(zip(d["cues"], d["durs"])):
        print(f"  p{i:02d}  cue {c:>6.2f}s  dur {du:>5.2f}s  ends {c + du:>6.2f}s")
