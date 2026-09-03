#!/usr/bin/env bash
# Rebuild demo/demo-final.mp4 end to end (ATA-style).
#
#   ./film/build.sh              # picture + Kokoro voiceover + mux
#   ./film/build.sh --silent     # picture only (record your own voice)
#   ./film/build.sh --voice-only # regenerate voiceover.mp3 + srt only
set -euo pipefail
cd "$(dirname "$0")/.."

SILENT=0
VOICE_ONLY=0
for arg in "$@"; do
  case "$arg" in
    --silent) SILENT=1 ;;
    --voice-only) VOICE_ONLY=1 ;;
  esac
done

VO_DIR="$HOME/CODE/voice-generation"
if [ ! -x "$VO_DIR/kvenv/bin/python" ]; then
  echo "Missing Kokoro env at $VO_DIR/kvenv — see demo/FILM-AND-SUBMIT.md Path B"
  exit 1
fi

render_parts() {
  echo "· voiceover parts (Kokoro, one per paragraph)"
  python3 film/split_voice.py
  for f in demo/.vo-parts/p*.txt; do
    "$VO_DIR/kvenv/bin/python" "$VO_DIR/vo.py" "$f" -o "${f%.txt}.mp3" --preset demo --speed 1.2
  done
  echo "· measure the voice — every picture duration derives from this"
  (cd film && python3 cues.py)
}

render_voice() {
  (cd film && python3 lay_voice.py)
  (cd film && python3 make_srt.py)
}

if [ "$VOICE_ONLY" = "1" ]; then
  render_parts
  render_voice
  echo "WROTE demo/voiceover.mp3 + demo/demo-final.srt"
  exit 0
fi

echo "1/5 · voice parts + timing plan"
render_parts

echo "2/5 · flipbook title cards (outro held to the closing paragraph)"
python3 film/slides.py

echo "3/5 · browser segment (live prod, one beat per paragraph)"
python3 film/browser.py

echo "4/5 · join picture"
for seg in intro browser outro; do
  ffmpeg -y -loglevel error -i "demo/seg-${seg}.mp4" \
    -vf "fps=30,scale=1920:1080:flags=lanczos,format=yuv420p" \
    -c:v libx264 -preset medium -crf 21 -an "demo/.${seg}30.mp4"
done
printf "file '.intro30.mp4'\nfile '.browser30.mp4'\nfile '.outro30.mp4'\n" > demo/.seg30.txt
ffmpeg -y -loglevel error -f concat -safe 0 -i demo/.seg30.txt -c copy demo/.picture.mp4

if [ "$SILENT" = "1" ]; then
  mv demo/.picture.mp4 demo/demo-silent.mp4
  rm -f demo/.intro30.mp4 demo/.browser30.mp4 demo/.outro30.mp4 demo/.seg30.txt
  echo "WROTE demo/demo-silent.mp4"
  exit 0
fi

echo "5/5 · mux (fails if voice and picture disagree)"
render_voice
ffmpeg -y -loglevel error -i demo/.picture.mp4 -i demo/voiceover.mp3 \
  -map 0:v -map 1:a -c:v copy -c:a aac -b:a 160k demo/demo-final.mp4
rm -f demo/.picture.mp4 demo/.intro30.mp4 demo/.browser30.mp4 demo/.outro30.mp4 demo/.seg30.txt

DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 demo/demo-final.mp4)
echo
echo "WROTE demo/demo-final.mp4 (${DUR}s)"
echo "     demo/voiceover.mp3 · demo/demo-final.srt"
echo "Watch end to end before YouTube upload."
