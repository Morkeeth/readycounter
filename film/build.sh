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
SUBS=0
for arg in "$@"; do
  case "$arg" in
    --silent) SILENT=1 ;;
    --voice-only) VOICE_ONLY=1 ;;
    --subs) SUBS=1; export RC_SUBS=1 ;;
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
    "$VO_DIR/kvenv/bin/python" "$VO_DIR/vo.py" "$f" -o "${f%.txt}.mp3" --preset demo --speed 1.32
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

echo "2/5 · intro deck (animated cards, one per paragraph)"
(cd film && python3 intro.py)

echo "   · outro card (held to the closing paragraph)"
python3 film/slides.py

echo "3/5 · browser segment (live prod, one beat per paragraph)"
python3 film/browser.py

echo "   · integrations segment (fresh context)"
(cd film && python3 partners.py)

echo "   · native WebMCP segment (real Chrome, document.modelContext)"
(cd film && python3 webmcp.py)

echo "4/5 · join picture"
for seg in intro browser partners webmcp outro; do
  ffmpeg -y -loglevel error -i "demo/seg-${seg}.mp4" \
    -vf "fps=30,scale=1920:1080:flags=lanczos,format=yuv420p" \
    -c:v libx264 -preset medium -crf 21 -an "demo/.${seg}30.mp4"
done
printf "file '.intro30.mp4'\nfile '.browser30.mp4'\nfile '.partners30.mp4'\nfile '.webmcp30.mp4'\nfile '.outro30.mp4'\n" > demo/.seg30.txt
ffmpeg -y -loglevel error -f concat -safe 0 -i demo/.seg30.txt -c copy demo/.picture.mp4

if [ "$SILENT" = "1" ]; then
  mv demo/.picture.mp4 demo/demo-silent.mp4
  rm -f demo/.intro30.mp4 demo/.browser30.mp4 demo/.partners30.mp4 demo/.webmcp30.mp4 demo/.outro30.mp4 demo/.seg30.txt
  echo "WROTE demo/demo-silent.mp4"
  exit 0
fi

echo "5/5 · mux (fails if voice and picture disagree)"
render_voice
# Each recorded segment carries a few frames of encoder padding, so the joined
# picture always runs a little past the voice. Cut it to the voice plus the
# planned tail — the film then ends when the sentence does, every time.
OUTNAME=demo/demo-final.mp4
[ "$SUBS" = "1" ] && OUTNAME=demo/demo-final-sub.mp4

PIC_END=$(python3 -c "import json;d=json.load(open('demo/.cues.json'));print(round(d['voice_end']+d['tail'],3))")
ffmpeg -y -loglevel error -i demo/.picture.mp4 -i demo/voiceover.mp3 \
  -map 0:v -map 1:a -t "$PIC_END" \
  -c:v libx264 -preset medium -crf 21 -pix_fmt yuv420p \
  -c:a aac -b:a 160k -movflags +faststart "$OUTNAME"
rm -f demo/.picture.mp4 demo/.intro30.mp4 demo/.browser30.mp4 demo/.partners30.mp4 demo/.webmcp30.mp4 demo/.outro30.mp4 demo/.seg30.txt

if [ "$SUBS" = "0" ]; then
  (cd film && python3 verify_film.py)
fi

DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUTNAME")
echo
echo "WROTE $OUTNAME (${DUR}s)"
echo "     demo/voiceover.mp3 · demo/demo-final.srt"
echo "Watch end to end before YouTube upload."
