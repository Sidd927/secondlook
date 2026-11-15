"""Single source of truth for the SecondLook demo film timing (seconds, 30 fps, 1920x1080).

Scene boundaries are global. VO line starts are global and were placed against event markers
recorded during capture (raw/*.marks.json), so narration lands on the real on-screen moments.
"""

TOTAL = 153.0

# (id, start, end)
SCENES = [
    ("hook", 0.0, 11.4),
    ("problem", 11.4, 39.2),
    ("meet", 39.2, 53.6),
    ("demoa", 53.6, 72.0),
    ("demob", 72.0, 85.0),
    ("democ", 85.0, 101.5),
    ("demod", 101.5, 111.6),
    ("how", 111.6, 141.2),
    ("impact", 141.2, 146.4),
    ("close", 146.4, TOTAL),
]

# Voiceover line id -> global start time.
VO = {
    "l01": 0.5, "l02": 3.2, "l03": 7.6,
    "l04": 11.9, "l05": 21.1, "l06": 25.7, "l07": 32.8,
    "l08": 39.7, "l09": 41.5, "l10": 45.0,
    "l11": 54.3, "l12": 60.6,
    "l14": 72.4, "l15": 80.6,
    "l16": 85.4, "l17": 92.2, "l18": 97.6,
    "l19": 102.0,
    "l20": 112.1, "l21": 122.7, "l22": 129.7,
    "l24": 141.6,
    "l25": 146.9,
}

# Footage trims: scene -> (file, media_start). Event times in scene-local seconds = mark - media_start.
FOOTAGE = {
    "meet": ("landing.mp4", 0.0),
    "demoa": ("sleeper.mp4", 2.0),   # type 1.32, verdict 6.69, toBan 9.29, toRecall 13.61
    "demob": ("photo.mp4", 2.2),     # upload 1.0, ocr 2.3, verdict 6.42, toFacts 8.43
    "democ": ("swing.mp4", 1.8),     # verdict 2.69, toMessage 5.1, copied 9.45, toChecks 11.45
    "demod": ("batch.mp4", 1.8),     # results 2.66, exported 6.5
}

# Sound effects: (file, global time, gain dB). Pixabay-licensed, bundled with the media-use skill.
SFX = [
    ("whoosh-short.mp3", 0.15, -14),
    ("impact-bass-1.mp3", 8.95, -18),
    ("whoosh-short.mp3", 11.85, -14),
    ("impact-bass-2.mp3", 19.3, -20),   # swell peaks on the BANNED stamp (~21.1)
    ("whoosh-short.mp3", 25.65, -15),
    ("pop.mp3", 33.3, -18), ("pop.mp3", 33.7, -18), ("pop.mp3", 34.1, -18), ("pop.mp3", 34.5, -18),
    ("riser.mp3", 39.65 - 10.03, -20),
    ("impact-bass-1.mp3", 39.65, -18),
    ("whoosh.mp3", 44.75, -16),
    # Demo A: typing, Check click, verdict
    ("typing.mp3", 54.95, -22), ("typing.mp3", 56.45, -22),
    ("click-soft.mp3", 59.8, -12),
    ("ping.mp3", 60.3, -20),
    # Demo B: upload, check, verdict
    ("click-soft.mp3", 72.95, -12),
    ("click-soft.mp3", 77.95, -12),
    ("ping.mp3", 78.45, -20),
    # Demo C: example click, copy
    ("click-soft.mp3", 87.2, -12),
    ("click.mp3", 94.4, -12),
    # Demo D: load sample, export
    ("click-soft.mp3", 103.7, -12),
    ("click.mp3", 108.1, -12),
    ("whoosh.mp3", 111.55, -16),
    ("pop.mp3", 112.6, -20), ("pop.mp3", 113.6, -20), ("pop.mp3", 114.6, -20),
    ("pop.mp3", 116.1, -20), ("pop.mp3", 117.6, -20), ("pop.mp3", 119.1, -20),
    ("whoosh-short.mp3", 141.15, -15),
    ("impact-bass-2.mp3", 141.2 + 2.2 - 0.9, -18),
    ("chime.mp3", 146.95, -20),
]
