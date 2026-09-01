#!/usr/bin/env bash
# Rejoin existing segments + regenerate voice + mux (skip browser capture).
set -euo pipefail
cd "$(dirname "$0")/.."

for seg in intro browser outro; do
  test -f "demo/seg-${seg}.mp4" || { echo "missing demo/seg-${seg}.mp4 — run ./film/build.sh"; exit 1; }
done

for seg in intro browser outro; do
  ffmpeg -y -loglevel error -i "demo/seg-${seg}.mp4" \
    -vf "fps=30,scale=1920:1080:flags=lanczos,format=yuv420p" \
    -c:v libx264 -preset medium -crf 21 -an "demo/.${seg}30.mp4"
done
printf "file '.intro30.mp4'\nfile '.browser30.mp4'\nfile '.outro30.mp4'\n" > demo/.seg30.txt
ffmpeg -y -loglevel error -f concat -safe 0 -i demo/.seg30.txt -c copy demo/.picture.mp4

VO_DIR="$HOME/CODE/voice-generation"
python3 film/split_voice.py
for f in demo/.vo-parts/p*.txt; do
  "$VO_DIR/kvenv/bin/python" "$VO_DIR/vo.py" "$f" -o "${f%.txt}.mp3" --preset demo --speed 1.2
done
python3 film/lay_voice.py
python3 film/make_srt.py

ffmpeg -y -loglevel error -i demo/.picture.mp4 -i demo/voiceover.mp3 \
  -map 0:v -map 1:a -c:v copy -c:a aac -b:a 160k demo/demo-final.mp4
rm -f demo/.picture.mp4 demo/.intro30.mp4 demo/.browser30.mp4 demo/.outro30.mp4 demo/.seg30.txt

DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 demo/demo-final.mp4)
echo "WROTE demo/demo-final.mp4 (${DUR}s)"
