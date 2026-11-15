# SecondLook Demo Film: Production

**Final film:** `final/SecondLook_IceHacks_2026_Demo.mp4`. It's kept out of git because it's 114 MB, over GitHub's file limit. Publish it to YouTube.

- **Format:** 2:33 · 1920×1080 · 30 fps · H.264 High (CRF 12) · AAC-LC 48 kHz stereo
- **Audio:** −14.3 LUFS integrated, −1.4 dBTP true peak
- **Captions:** burned in, plus `final/SecondLook_IceHacks_2026_Demo.srt` for YouTube
- **Thumbnail:** `final/thumbnail.png` (1280×720, taken from the hook)

## What's real
- **Every product shot is genuine footage of the production app** (https://secondlook-nu.vercel.app). It was recorded by `capture/capture.mjs` with real clicks, typing, a real file upload and a real CSV download. Event timestamps were logged to `raw/*.marks.json` so the narration and sound line up with what actually happened on screen.
- **Recall facts** shown in motion graphics (Recall #19105, ≈4.7M units, Apr 12, 2019) come from the CPSC data in `data/recalls.json`. The product photo is the official CPSC image.
- **The hook's listing card is a dramatization** and is labelled on screen "Illustrative listing".
- **The sample label photo** used in the OCR demo is marked "SAMPLE LABEL FOR DEMO PURPOSES".
- **The narration never claims generative AI runs in the live app.** It says the live app runs on the deterministic rules engine.

## Pipeline
```
capture/capture.mjs     Playwright + CDP screencast → raw/<clip>.mp4 (2560×1440) + raw/<clip>.marks.json
vo/lines.json           narration (caption text + TTS text) → audio/vo/<id>.wav (Kokoro-82M, local)
src/timeline.py         single source of truth: scene boundaries, VO starts, footage trims, SFX cues
src/make_music.py       original score synthesized with numpy → audio/music.wav
src/mix_audio.py        VO + SFX + score ducked under VO → audio/mix.wav (loudnorm −14 LUFS)
src/build_scenes.py     → film/index.html + film/compositions/*.html (HyperFrames) + final/*.srt
film/                   HyperFrames project (HTML/GSAP compositions rendered frame-by-frame)
```

## Rebuild from scratch
```bash
# 1. Footage (≈2 min). Needs network access to the live app.
cd submission/video/capture && npm install && npx playwright install chromium && node capture.mjs
# pad each clip with a held last frame and stage it for the film
cd .. && mkdir -p film/assets/footage film/assets/audio
for c in landing sleeper photo swing batch; do ffmpeg -y -i raw/$c.mp4 -vf "tpad=stop_mode=clone:stop_duration=5" -c:v libx264 -crf 14 -pix_fmt yuv420p -an film/assets/footage/$c.mp4; done

# 2. Voiceover (local Kokoro; needs Python 3.10+ with kokoro-onnx + soundfile)
python3.12 -m venv ~/.cache/hf-kokoro-venv && ~/.cache/hf-kokoro-venv/bin/pip install kokoro-onnx soundfile
export HYPERFRAMES_PYTHON=~/.cache/hf-kokoro-venv/bin/python
# for each line in vo/lines.json: npx hyperframes tts "<tts>" -v af_heart -s 1.05 -o audio/vo/<id>.wav
# (durations are recorded in vo/durations.json)

# 3. Score, mix, scenes
cd src && ~/.cache/hf-kokoro-venv/bin/python make_music.py ../audio/music.wav
python3 mix_audio.py && python3 build_scenes.py && cp ../audio/mix.wav ../film/assets/audio/mix.wav

# 4. Check and render
cd ../film && npx hyperframes check
npx hyperframes render --quality delivery --crf 12 --video-frame-format png -o ../final/SecondLook_IceHacks_2026_Demo.mp4
```

To replace the synthetic voice with a human recording, see `VOICEOVER_SCRIPT.md` → "Swapping in your recording".

## Verification performed
- `npx hyperframes check`: ok (no errors; remaining warnings are small mono labels and caption-track density).
- `ffprobe`: 153.000 s, 1920×1080, 30/1 fps, h264 High yuv420p, aac LC 48 kHz stereo.
- Full decode with `ffmpeg -f null`: no errors.
- `blackdetect`: no black frames. `freezedetect` (3 s): one narrated 3.2 s hold in "How it works".
- Frames from every scene inspected visually, including the Copy click (shows "✓ Copied"), the label OCR, the verdicts and the end card.
- Narration intelligibility checked by transcribing the synthetic voice back with Whisper.

## Credits
- **Rendering:** HyperFrames (HTML → video), GSAP. **Capture:** Playwright / Chrome DevTools Protocol. **Encoding:** FFmpeg.
- **Voice:** Kokoro-82M (open-weight TTS), voice `af_heart`, run locally.
- **Music:** original, synthesized for this film (`src/make_music.py`).
- **Sound effects:** Pixabay (Pixabay Content License), bundled with the HyperFrames media-use skill.
- **Fonts:** Instrument Serif, Geist and Geist Mono (SIL Open Font License), via Fontsource.
- **Data and product image:** U.S. Consumer Product Safety Commission (public domain).
- **Third-party finding cited on screen:** Consumer Reports (2026).
