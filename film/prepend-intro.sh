#!/usr/bin/env bash
# Put Oscar's own intro clip in front of the built film.
#
#   ./film/prepend-intro.sh ~/Downloads/my-intro.mov
#
# Writes demo/demo-submit.mp4 and demo/demo-submit.srt. Leaves demo/demo-final.mp4
# untouched, so you can redo the intro without rebuilding the film.
#
# Both clips are normalised to 1920x1080 / 30fps / 48kHz stereo AAC first,
# because concat with mismatched streams produces a file that plays for you and
# stalls for a judge.
set -euo pipefail
cd "$(dirname "$0")/.."

INTRO="${1:-}"
BODY="demo/demo-final.mp4"
OUT="demo/demo-submit.mp4"
OUT_SRT="demo/demo-submit.srt"

if [ -z "$INTRO" ] || [ ! -f "$INTRO" ]; then
  echo "usage: ./film/prepend-intro.sh <your-intro-clip>"
  exit 1
fi
if [ ! -f "$BODY" ]; then
  echo "missing $BODY — run ./film/build.sh first"
  exit 1
fi

dur() { ffprobe -v error -show_entries format=duration -of csv=p=0 "$1"; }

INTRO_DUR=$(dur "$INTRO")
echo "· intro  $INTRO  (${INTRO_DUR}s)"

# Devpost's own guidance: the project must be working on screen inside the first
# 15 seconds. A long talking-head intro spends that budget before the product
# appears, so this warns rather than silently burying it.
if awk "BEGIN{exit !($INTRO_DUR > 15)}"; then
  echo
  echo "  WARNING: the intro runs ${INTRO_DUR}s. Judges are told the product should"
  echo "           be working on screen within the first 15 seconds, and they are not"
  echo "           required to watch past 3 minutes. Consider trimming to ~15s."
  echo
fi

norm() {
  ffmpeg -y -loglevel error -i "$1" \
    -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=#f7f7f5,fps=30,format=yuv420p" \
    -c:v libx264 -preset medium -crf 20 \
    -af "aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo" \
    -c:a aac -b:a 160k -ar 48000 -ac 2 \
    -shortest "$2"
}

# A silent intro would concat with no audio stream at all and desync the join.
if ! ffprobe -v error -select_streams a -show_entries stream=codec_type -of csv=p=0 "$INTRO" | grep -q audio; then
  echo "· intro has no audio track — adding silence so the join stays in sync"
  ffmpeg -y -loglevel error -i "$INTRO" -f lavfi -i anullsrc=r=48000:cl=stereo \
    -shortest -c:v copy -c:a aac -b:a 160k "demo/.intro-with-audio.mp4"
  INTRO="demo/.intro-with-audio.mp4"
fi

echo "· normalising both clips"
norm "$INTRO" demo/.n-intro.mp4
norm "$BODY" demo/.n-body.mp4

echo "· joining"
printf "file '.n-intro.mp4'\nfile '.n-body.mp4'\n" > demo/.submit.txt
ffmpeg -y -loglevel error -f concat -safe 0 -i demo/.submit.txt \
  -c:v libx264 -preset medium -crf 20 -c:a aac -b:a 160k -movflags +faststart "$OUT"

# Shift every caption by the real intro length, measured after normalising.
SHIFT=$(dur demo/.n-intro.mp4)
python3 - "$SHIFT" <<'PY'
import pathlib
import re
import sys

shift = float(sys.argv[1])
src = pathlib.Path("demo/demo-final.srt").read_text()


def bump(m):
    def one(t):
        h, mi, s = t.split(":")
        s, ms = s.split(",")
        total = int(h) * 3600 + int(mi) * 60 + int(s) + int(ms) / 1000 + shift
        h2 = int(total // 3600)
        m2 = int(total % 3600 // 60)
        s2 = total % 60
        return f"{h2:02d}:{m2:02d}:{s2:06.3f}".replace(".", ",")

    return f"{one(m.group(1))} --> {one(m.group(2))}"


out = re.sub(r"(\d\d:\d\d:\d\d,\d\d\d) --> (\d\d:\d\d:\d\d,\d\d\d)", bump, src)
pathlib.Path("demo/demo-submit.srt").write_text(out)
print(f"· captions shifted {shift:.2f}s")
PY

rm -f demo/.n-intro.mp4 demo/.n-body.mp4 demo/.submit.txt demo/.intro-with-audio.mp4

TOTAL=$(dur "$OUT")
V_END=$(ffprobe -v error -select_streams v -show_entries packet=pts_time -of csv=p=0 "$OUT" | tail -1)
A_DUR=$(ffprobe -v error -select_streams a -show_entries stream=duration -of csv=p=0 "$OUT")
echo
echo "WROTE $OUT (${TOTAL}s) · $OUT_SRT"
echo "     video ends ${V_END}s · audio ends ${A_DUR}s"
if awk "BEGIN{exit !($TOTAL > 180)}"; then
  echo "     WARNING: over 3 minutes — judges are not required to watch past 3:00."
fi
echo "Watch it end to end before uploading."
