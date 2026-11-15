"""Original ambient score for the SecondLook demo, synthesized from scratch (no samples, no
third-party music), so it carries no licensing questions.

Structure follows timeline.SCENES: a sparse, slightly tense pad under the hook/problem, a
brighter progression with a soft arpeggio from the brand reveal through the demos, a lift for
the impact line, and a resolve on the end card.

Usage: python make_music.py <out.wav>
"""
import sys
import numpy as np

SR = 48000
from timeline import TOTAL

rng = np.random.default_rng(7)
N = int(TOTAL * SR)
t_all = np.arange(N) / SR


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def lowpass(x, cutoff):
    """Gentle low-pass applied in the frequency domain (fast for whole-track buffers)."""
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    H = 1 / np.sqrt(1 + (f / cutoff) ** 4)  # 2nd-order-ish rolloff
    return np.fft.irfft(X * H, n=len(x))


def pad_voice(freq, dur, detune=0.12):
    """Soft, slightly detuned additive pad note."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    for d in (-detune, 0.0, detune):
        f = freq * 2 ** (d / 12)
        ph = rng.uniform(0, 2 * np.pi)
        for h, amp in ((1, 1.0), (2, 0.35), (3, 0.16), (4, 0.07), (5, 0.03)):
            out += amp * np.sin(2 * np.pi * f * h * t + ph * h)
    return out / 3


def envelope(n, attack, release):
    e = np.ones(n)
    a, r = int(attack * SR), int(release * SR)
    e[:a] = np.linspace(0, 1, a) ** 2
    e[-r:] *= np.linspace(1, 0, r) ** 2
    return e


def place(buf, sig, start):
    i = int(start * SR)
    j = min(len(buf), i + len(sig))
    if j > i:
        buf[i:j] += sig[: j - i]


pad = np.zeros(N)
sub = np.zeros(N)
arp = np.zeros(N)

# Chord tables (MIDI). Problem: B minor colour; product sections: D major with added 9ths.
TENSE = [[47, 54, 59, 62, 66], [43, 50, 59, 62, 66], [45, 52, 57, 61, 64], [42, 49, 57, 61, 66]]  # Bm9, Gmaj7, A6/9, F#m7
BRIGHT = [[50, 57, 62, 66, 69, 76], [47, 54, 59, 62, 69, 73], [43, 50, 57, 62, 66, 71], [45, 52, 57, 61, 64, 71]]  # Dmaj9, Bm11, Gmaj9, A6
RESOLVE = [50, 57, 62, 66, 69, 73, 76]  # Dmaj9 spread

CHORD = 6.0  # seconds per chord


def lay_chords(t0, t1, table, level, cutoff):
    seg = np.zeros(N)
    t = t0
    k = 0
    while t < t1:
        dur = min(CHORD + 2.5, t1 - t + 2.0)
        notes = table[k % len(table)]
        for m in notes:
            v = pad_voice(midi(m), dur) * envelope(int(dur * SR), 1.8, 2.4)
            place(seg, v * (0.55 if m < 52 else 0.32), t)
        # sub bass on the root
        root = notes[0] - 12
        n = int(dur * SR)
        tt = np.arange(n) / SR
        place(sub, 0.5 * level * np.sin(2 * np.pi * midi(root) * tt) * envelope(n, 1.2, 2.0), t)
        t += CHORD
        k += 1
    seg = lowpass(seg, cutoff)
    pad[:] += level * seg


def lay_arp(t0, t1, table, bpm, level):
    step = 60 / bpm / 2  # eighth notes
    t = t0
    i = 0
    while t < t1:
        chord = table[int((t - t0) // CHORD) % len(table)]
        tones = sorted(set(chord[1:] + [chord[2] + 12]))
        pattern = [0, 2, 1, 3, 2, 4, 1, 3]
        m = tones[pattern[i % len(pattern)] % len(tones)] + 12
        dur = 1.6
        n = int(dur * SR)
        tt = np.arange(n) / SR
        f = midi(m)
        note = (np.sin(2 * np.pi * f * tt) + 0.25 * np.sin(2 * np.pi * 2 * f * tt)) * np.exp(-tt * 3.2)
        note *= np.minimum(1, tt / 0.004)
        accent = 1.0 if i % 4 == 0 else 0.7
        place(arp, level * accent * note, t)
        t += step
        i += 1


# Hook: near-silent drone that opens up.
lay_chords(0.0, 11.4, [TENSE[0]], 0.32, 800)
# Problem: tense progression, filter slowly darker.
lay_chords(11.4, 39.0, TENSE, 0.75, 1300)
# Brand reveal → demos → how it works: bright progression with arpeggio.
lay_chords(39.3, 141.0, BRIGHT, 0.7, 2600)
lay_arp(39.6, 140.6, BRIGHT, 96, 0.16)
# Impact + close: lift then resolve.
lay_chords(141.2, 146.4, [BRIGHT[2]], 0.85, 3400)
for m in RESOLVE:
    dur = TOTAL - 146.2
    v = pad_voice(midi(m), dur) * envelope(int(dur * SR), 0.8, 4.0)
    place(pad, 0.33 * v * (0.6 if m < 55 else 0.35), 146.2)

mix = pad + 0.35 * lowpass(sub, 160) + arp


def highpass(x, cutoff):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    H = (f / cutoff) ** 2 / np.sqrt(1 + (f / cutoff) ** 4)
    return np.fft.irfft(X * H, n=len(x))


mix = highpass(mix, 55)

# Long, soft reverb: convolution with a decaying stereo noise impulse.
ir_len = int(3.2 * SR)
ti = np.arange(ir_len) / SR
irL = rng.standard_normal(ir_len) * np.exp(-ti * 2.1)
irR = rng.standard_normal(ir_len) * np.exp(-ti * 2.1)
irL, irR = lowpass(irL, 5000), lowpass(irR, 5000)
irL /= np.sqrt((irL ** 2).sum())
irR /= np.sqrt((irR ** 2).sum())


def conv(x, h):
    L = len(x) + len(h) - 1
    nfft = 1 << (L - 1).bit_length()
    return np.fft.irfft(np.fft.rfft(x, nfft) * np.fft.rfft(h, nfft), nfft)[: len(x)]


wetL, wetR = conv(mix, irL), conv(mix, irR)
L = 0.72 * mix + 0.55 * wetL
R = 0.72 * mix + 0.55 * wetR

# Global fades.
fade_in = np.minimum(1, t_all / 1.5)
fade_out = np.clip((TOTAL - t_all) / 4.5, 0, 1)
L *= fade_in * fade_out
R *= fade_in * fade_out

stereo = np.stack([L, R], axis=1)
stereo /= np.max(np.abs(stereo)) / 0.5  # peak -6 dBFS; final level set in the mix

out = sys.argv[1] if len(sys.argv) > 1 else "music.wav"
pcm = (np.clip(stereo, -1, 1) * 32767).astype("<i2")
import wave

with wave.open(out, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print("wrote", out, f"{TOTAL:.1f}s")
