"""Builds the final soundtrack: voiceover lines placed on the timeline, sound effects, and the
original score ducked under the narration. Output is loudness-normalised for YouTube
(-14 LUFS integrated, -1.5 dBTP).

Usage: python mix_audio.py   (run from submission/video/src)
"""
import json
import subprocess
from pathlib import Path

from timeline import SFX, TOTAL, VO

ROOT = Path(__file__).resolve().parent.parent
SFX_DIR = Path.home() / ".claude/skills/media-use/audio/assets/sfx"
AUDIO = ROOT / "audio"


def run(args):
    subprocess.run(args, check=True)


# 1) Voiceover bus: every line at its timeline position.
lines = {l["id"]: l for l in json.load(open(ROOT / "vo/durations.json"))}
inputs, filters, labels = [], [], []
for i, (lid, start) in enumerate(sorted(VO.items(), key=lambda kv: kv[1])):
    inputs += ["-i", str(AUDIO / "vo" / f"{lid}.wav")]
    ms = int(start * 1000)
    filters.append(f"[{i}:a]aresample=48000,pan=stereo|c0=c0|c1=c0,adelay={ms}|{ms}[v{i}]")
    labels.append(f"[v{i}]")
n = len(labels)
filters.append(f"{''.join(labels)}amix=inputs={n}:normalize=0,apad=whole_dur={TOTAL}[vo]")
run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", ";".join(filters), "-map", "[vo]",
     "-t", str(TOTAL), "-ar", "48000", str(AUDIO / "vo_bus.wav")])

# 2) SFX bus.
inputs, filters, labels = [], [], []
for i, (name, start, gain) in enumerate(SFX):
    inputs += ["-i", str(SFX_DIR / name)]
    ms = max(0, int(start * 1000))
    filters.append(f"[{i}:a]aresample=48000,aformat=channel_layouts=stereo,volume={gain}dB,adelay={ms}|{ms}[s{i}]")
    labels.append(f"[s{i}]")
filters.append(f"{''.join(labels)}amix=inputs={len(labels)}:normalize=0,apad=whole_dur={TOTAL}[sfx]")
run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", ";".join(filters), "-map", "[sfx]",
     "-t", str(TOTAL), "-ar", "48000", str(AUDIO / "sfx_bus.wav")])

# 3) Final mix: music ducked by the VO (sidechain), VO lightly compressed, everything summed.
fc = (
    "[0:a]asplit=2[vo][key];"
    "[vo]highpass=f=80,acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120:makeup=2dB[vox];"
    "[2:a]volume=-9dB[mus];"
    "[mus][key]sidechaincompress=threshold=0.03:ratio=6:attack=25:release=450:makeup=1[duck];"
    "[1:a]volume=0dB[fx];"
    "[vox][duck][fx]amix=inputs=3:normalize=0,"
    f"loudnorm=I=-14:TP=-1.5:LRA=11,atrim=0:{TOTAL},afade=t=out:st={TOTAL-1.2}:d=1.2[out]"
)
run(["ffmpeg", "-v", "error", "-y", "-i", str(AUDIO / "vo_bus.wav"), "-i", str(AUDIO / "sfx_bus.wav"),
     "-i", str(AUDIO / "music.wav"), "-filter_complex", fc, "-map", "[out]", "-ar", "48000", "-c:a", "pcm_s16le",
     str(AUDIO / "mix.wav")])
print("wrote", AUDIO / "mix.wav")
