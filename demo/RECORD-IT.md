# Record ReadyCounter — ATA hybrid (recommended)

1. Play `demo/voiceover.mp3` in headphones (115s).
2. Screen-record silent at 1920×1080 while you click the teleprompter in `FILM-AND-SUBMIT.md`.
3. Open title cards anytime: `open demo/flipbook.html` (arrow keys).
4. Mux:

```bash
cd ~/CODE/tooltruth-webmcp
ffmpeg -y -i ~/Desktop/Screen\ Recording.mov -i demo/voiceover.mp3 \
  -c:v libx264 -preset medium -crf 22 -c:a aac -b:a 128k \
  -shortest demo/demo-final.mp4
```

5. Upload `demo/demo-final.mp4` to YouTube (unlisted) · paste URL into Devpost · submit.

Re-render VO after script edits:

```bash
cd ~/CODE/voice-generation
./kvenv/bin/python vo.py ~/CODE/tooltruth-webmcp/demo/voiceover.txt \
  -o ~/CODE/tooltruth-webmcp/demo/voiceover.mp3 --preset demo
```
