"""Write demo/demo-final.srt from voice parts + lay_voice cues."""
import pathlib
import subprocess

from lay_voice import CUES

PARTS = pathlib.Path("demo/.vo-parts")
OUT = pathlib.Path("demo/demo-final.srt")


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


def ts(sec):
    h = int(sec // 3600)
    m = int((sec % 3600) // 60)
    s = int(sec % 60)
    ms = int(round((sec % 1) * 1000))
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def main():
    parts = sorted(PARTS.glob("p*.txt"))
    lines = []
    for i, txt in enumerate(parts):
        body = [
            l
            for l in txt.read_text().splitlines()
            if l.strip() and not l.startswith("@")
        ]
        text = " ".join(body)
        start = CUES[i]
        end = start + dur(PARTS / f"p{i:02d}.mp3")
        lines.append(f"{i + 1}\n{ts(start)} --> {ts(end)}\n{text}\n")
    OUT.write_text("\n".join(lines) + "\n")
    print(f"WROTE {OUT}")


if __name__ == "__main__":
    main()
