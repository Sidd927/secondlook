# SecondLook Demo: Voiceover Script

**Final length:** 2:33 (153 s) · **Speech:** ~118 s across 23 lines · **Format:** 1920×1080, 30 fps

## How the current narration was produced
The narration in the rendered film is **synthetic**. It was generated on-device with **Kokoro-82M** (open-weight TTS, run locally through `npx hyperframes tts`), voice `af_heart`, speed 1.05. No paid service or account was used. Each line is its own file in `audio/vo/` so it can be placed exactly on the timeline. We checked intelligibility by transcribing the lines back with Whisper. Pronunciation of "Rock 'n Play", "CPSC", "4moms" and "SecondLook" came back correct.

**Recommended:** if you're happy recording your own voice, it will sound more natural than any synthetic voice. Record using the script below, then follow "Swapping in your recording" at the end. The pipeline is built for it.

## Delivery
- **Tone:** calm, credible, quietly confident. A product designer explaining something they care about, not an announcer.
- **Pace:** about 155 words per minute. Slow down for numbers and the closing line.
- **Emphasis:** lean on the contrast words in **bold**. Don't oversell the scary parts. Let the facts carry them.
- **Pauses:** `/` is a short breath (≈0.3 s), `//` is a full stop (≈0.7 s).
- **Mic:** a quiet room, phone or headset mic at about 15 cm, slightly off-axis. Record each line as its own take.

## Pronunciation
| Write | Say |
|---|---|
| Rock 'n Play | "rock-in-play" |
| CPSC | "C-P-S-C" (letters) |
| 4moms | "four moms" |
| SecondLook | "second look" (two words, even stress) |
| API · CSV | letters: "A-P-I", "C-S-V" |
| 7,192 | "seven thousand, one hundred ninety-two" |
| 4.7 million | "four point seven million" |

## Script (global timestamps = where each line starts in the film)

### Scene 1 · Hook (0:00–0:11)
| ID | Start | Line | Notes |
|---|---|---|---|
| l01 | 0:00.5 | Here's a listing you might scroll past / any day. | Casual, almost offhand. |
| l02 | 0:03.2 | A baby sleeper. / Barely used. / Twenty-five dollars, // pickup only. | Read it like a listing. |
| l03 | 0:07.6 | It looks perfectly safe. // But what if it **isn't**? | Small drop in pitch on the question. |

### Scene 2 · The problem (0:11–0:39)
| l04 | 0:11.9 | This is the Fisher-Price Rock 'n Play. // In 2019 it was recalled, / about four point seven million units, / after reports of infant deaths. | Steady, factual. No drama. |
| l05 | 0:21.1 | Inclined infant sleepers like it are now **banned** from sale, / entirely. | |
| l06 | 0:25.7 | But a recall stops **new** sales, / not **re**sales. // And this listing never says "Rock 'n Play." / It says, "sleeper, rocker." | The turn of the film. |
| l07 | 0:32.8 | This year, Consumer Reports found banned baby gear listed on **every** major resale platform it checked. | |

### Scene 3 · Meet SecondLook (0:39–0:53)
| l08 | 0:39.7 | So we built SecondLook. | Warm; lands on the logo. |
| l09 | 0:41.5 | A safety check, / for the moment before you buy something used. | |
| l10 | 0:45.0 | Paste a listing, / or snap the label. // It checks U.S. recalls and federal sale bans, / then tells you exactly what to ask the seller. | |

### Scene 4 · Live demo (0:53–1:51)
| l11 | 0:54.3 | Here's that same listing, / pasted in exactly as the seller wrote it. | Over the typing. |
| l12 | 1:00.6 | The verdict: // don't buy this. // Inclined sleepers are banned, / and it matches the actual C-P-S-C recall. | Starts as the red verdict appears. |
| l14 | 1:12.4 | Sellers often send a photo of the label instead. // SecondLook reads it, / right in your browser. | |
| l15 | 1:20.6 | It picks up the brand, / and the model number, / and runs the same check. | |
| l16 | 1:25.4 | Many recalls are narrower. // This infant swing matches a four moms recall… / but only some models are covered. | |
| l17 | 1:32.2 | So SecondLook writes the questions for you, / ready to copy, / and send to the seller. | The copy click happens at 1:34.4. |
| l18 | 1:37.6 | And it shows exactly which models the notice covers. | |
| l19 | 1:42.0 | For thrift stores and donation drives, / batch mode screens a whole intake list at once, / and exports a C-S-V. | |

### Scene 5 · How it works (1:51–2:21)
| l20 | 1:52.1 | Under the hood: // seven thousand, one hundred ninety-two C-P-S-C recalls, indexed. // Plus newer recalls, pulled live, from the public C-P-S-C A-P-I. | Let the number land. |
| l21 | 2:02.7 | A matching engine translates listing slang into recall language, / resolves brands, / and matches model numbers. | |
| l22 | 2:09.7 | Federal bans are explicit rules, / each with its legal citation. // The live app runs entirely on this deterministic engine… / and every match links back to its evidence. | Important honesty line; say it plainly. |

### Scene 6 · Impact (2:21–2:26)
| l24 | 2:21.6 | Before you buy it. // Before you sell it. // Look **twice**. | Slowest line in the film. |

### Scene 7 · Close (2:26–2:33)
| l25 | 2:26.9 | SecondLook. // Free, and live today. | Smile slightly. |

## Swapping in your recording
1. Save each take as `audio/vo/<id>.wav` (mono or stereo, any sample rate), replacing the synthetic file, e.g. `audio/vo/l04.wav`.
2. Update each line's `dur` in `vo/durations.json` (or rerun the duration step in `README.md`).
3. If a take runs longer than the gap before the next line, nudge the start times in `src/timeline.py` (`VO`).
4. Rebuild: `cd src && python3 mix_audio.py && python3 build_scenes.py`, then re-render (see `README.md`).
