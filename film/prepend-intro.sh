#!/usr/bin/env bash
# Put Oscar's own intro clip in front of the built film.
#
#   ./film/prepend-intro.sh ~/Desktop/Readycounterintro.mov
#
# Writes demo/demo-submit.mp4 and demo/demo-submit.srt. Leaves demo/demo-final.mp4
# alone, so the intro can be redone without rebuilding the film.
#
# Three things this does that a plain concat does not:
#   · Loudness-matches both halves to -16 LUFS. Measured on the first pass:
#     the intro came in at -31.7 LUFS against the film's -17.4, a 14 LU jump.
#     Judges would strain through the intro and then get blasted.
#   · Captions the intro too, by transcribing it, so the .srt covers the whole
#     film and not just the part we scripted.
#   · Normalises fps / size / sample rate before joining, because a concat of
#     mismatched streams plays for you and stalls for someone else.
set -euo pipefail
cd "$(dirname "$0")/.."

INTRO="${1:-}"
BODY="demo/demo-final.mp4"
BODY_SRT="demo/demo-final.srt"
OUT="demo/demo-submit.mp4"
OUT_SRT="demo/demo-submit.srt"
WHISPER_MODEL="$HOME/models/whisper/ggml-large-v3-turbo.bin"

[ -n "$INTRO" ] && [ -f "$INTRO" ] || { echo "usage: ./film/prepend-intro.sh <your-intro-clip>"; exit 1; }
[ -f "$BODY" ] || { echo "missing $BODY — run ./film/build.sh"; exit 1; }

dur() { ffprobe -v error -show_entries format=duration -of csv=p=0 "$1"; }

INTRO_DUR=$(dur "$INTRO")
echo "· intro $INTRO (${INTRO_DUR}s)"

if awk "BEGIN{exit !($INTRO_DUR > 25)}"; then
  echo
  echo "  WARNING: the intro runs ${INTRO_DUR}s. Judges are told the product should be"
  echo "           working on screen within the first 15 seconds."
  echo
fi

# Silent intro would concat with no audio stream and desync the join.
if ! ffprobe -v error -select_streams a -show_entries stream=codec_type -of csv=p=0 "$INTRO" | grep -q audio; then
  echo "· intro has no audio — adding silence"
  ffmpeg -y -loglevel error -i "$INTRO" -f lavfi -i anullsrc=r=48000:cl=stereo \
    -shortest -c:v copy -c:a aac -b:a 160k demo/.intro-audio.mp4
  INTRO="demo/.intro-audio.mp4"
fi

norm() {
  ffmpeg -y -loglevel error -i "$1" \
    -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=#f7f7f5,fps=30,format=yuv420p" \
    -af "loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo" \
    -c:v libx264 -preset medium -crf 20 -c:a aac -b:a 160k -ar 48000 -ac 2 "$2"
}

echo "· levelling both halves to -16 LUFS and matching format"
norm "$INTRO" demo/.n-intro.mp4
norm "$BODY"  demo/.n-body.mp4

echo "· joining"
printf "file '.n-intro.mp4'\nfile '.n-body.mp4'\n" > demo/.submit.txt
ffmpeg -y -loglevel error -f concat -safe 0 -i demo/.submit.txt \
  -c:v libx264 -preset medium -crf 20 -c:a aac -b:a 160k -movflags +faststart "$OUT"

SHIFT=$(dur demo/.n-intro.mp4)

# Caption the intro by transcribing it, then append the body's cues shifted by
# the real (post-normalisation) intro length.
INTRO_SRT=""
if [ -x "$(command -v whisper-cli)" ] && [ -f "$WHISPER_MODEL" ]; then
  echo "· transcribing the intro for captions"
  ffmpeg -y -loglevel error -i demo/.n-intro.mp4 -ar 16000 -ac 1 -c:a pcm_s16le demo/.intro.wav
  whisper-cli -m "$WHISPER_MODEL" -f demo/.intro.wav -np -osrt -of demo/.intro >/dev/null 2>&1 || true
  [ -f demo/.intro.srt ] && INTRO_SRT=demo/.intro.srt
else
  echo "· no local whisper model — the intro will have no captions"
fi

python3 - "$SHIFT" "$BODY_SRT" "$OUT_SRT" "${INTRO_SRT:-}" <<'PY'
import pathlib
import re
import sys

shift, body_srt, out_srt, intro_srt = sys.argv[1:5]
shift = float(shift)


def parse(text):
    out = []
    for block in re.split(r"\n\s*\n", text.strip()):
        lines = [l for l in block.splitlines() if l.strip()]
        if len(lines) < 2:
            continue
        m = re.search(r"(\d\d:\d\d:\d\d[,.]\d\d\d)\s*-->\s*(\d\d:\d\d:\d\d[,.]\d\d\d)", block)
        if not m:
            continue
        body = " ".join(lines[lines.index(m.group(0).join([""] * 2)) + 1:]) if False else " ".join(lines[2:] or lines[1:])
        out.append((secs(m.group(1)), secs(m.group(2)), body.strip()))
    return out


def secs(t):
    t = t.replace(".", ",")
    h, m, rest = t.split(":")
    s, ms = rest.split(",")
    return int(h) * 3600 + int(m) * 60 + int(s) + int(ms) / 1000


def ts(v):
    h = int(v // 3600)
    m = int(v % 3600 // 60)
    s = v % 60
    return f"{h:02d}:{m:02d}:{s:06.3f}".replace(".", ",")


cues = []
if intro_srt:
    cues += [(a, b, t) for a, b, t in parse(pathlib.Path(intro_srt).read_text())]
cues += [(a + shift, b + shift, t) for a, b, t in parse(pathlib.Path(body_srt).read_text())]

lines = []
for i, (a, b, t) in enumerate(cues, 1):
    lines += [str(i), f"{ts(a)} --> {ts(b)}", t, ""]
pathlib.Path(out_srt).write_text("\n".join(lines) + "\n")

bad = [i for i in range(1, len(cues)) if cues[i][0] < cues[i - 1][1] - 0.05]
print(f"· {len(cues)} cues written · overlaps: {len(bad)}")
PY

rm -f demo/.n-intro.mp4 demo/.n-body.mp4 demo/.submit.txt demo/.intro-audio.mp4 demo/.intro.wav demo/.intro.srt

TOTAL=$(dur "$OUT")
V=$(ffprobe -v error -select_streams v -show_entries stream=duration -of csv=p=0 "$OUT")
A=$(ffprobe -v error -select_streams a -show_entries stream=duration -of csv=p=0 "$OUT")
echo
echo "WROTE $OUT (${TOTAL}s) · $OUT_SRT"
echo "     video ${V}s · audio ${A}s"
awk "BEGIN{if ($TOTAL > 180) print \"     WARNING: over 3:00\"}"
echo "Watch it end to end before uploading."
