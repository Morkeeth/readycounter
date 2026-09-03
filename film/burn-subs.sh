#!/usr/bin/env bash
# Burn demo/demo-final.srt into the picture -> demo/demo-final-sub.mp4
#
# YouTube takes the .srt on its own, but a judge scrubbing with the sound off
# sees nothing without this.
#
# force_style= inside -vf is a quoting minefield: its value carries both "=" and
# "," which are the filtergraph's own separators. So we convert to .ass once and
# rewrite the style line directly — no escaping to get wrong.
set -euo pipefail
cd "$(dirname "$0")/.."

IN="${1:-demo/demo-final.mp4}"
SRT="${2:-demo/demo-final.srt}"
OUT="${IN%.mp4}-sub.mp4"
ASS="demo/.subs.ass"

[ -f "$IN" ]  || { echo "missing $IN — run ./film/build.sh"; exit 1; }
[ -f "$SRT" ] || { echo "missing $SRT"; exit 1; }

ffmpeg -y -loglevel error -i "$SRT" "$ASS"

# Ink text on a solid paper box, one typeface, no outline, no shadow.
python3 - "$ASS" <<'PY'
import re
import sys

path = sys.argv[1]
style = (
    "Style: Default,Bricolage Grotesque,44,&H00101010,&H00101010,&H00F5F5F7,&H00F5F5F7,"
    "-1,0,0,0,100,100,0,0,3,6,0,2,90,90,64,1"
)
out = []
for line in open(path, encoding="utf-8").read().splitlines():
    out.append(style if line.startswith("Style: Default,") else line)
open(path, "w", encoding="utf-8").write("\n".join(out) + "\n")
print("· subtitle style set")
PY

ffmpeg -y -loglevel error -i "$IN" -vf "ass=${ASS}" \
  -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p \
  -c:a copy -movflags +faststart "$OUT"

rm -f "$ASS"
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT")
echo "WROTE $OUT (${DUR}s, captions burned in)"
