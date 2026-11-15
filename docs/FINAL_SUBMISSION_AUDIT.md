# Final Submission Audit: SecondLook (IceHacks 2026)

Audited Nov 15, 2026, around 02:50 PT. **Deadline: Sun Nov 15, 2026, 6:00 PM PT (Mon Nov 16, 7:30 AM IST).**

## Official requirements (re-verified on https://icehacks.devpost.com/ today)
| Requirement | Status |
|---|---|
| Demo video: public YouTube/Vimeo/Youku link, ≤ 3 min, shows the project working, explains the problem, the demo and how it was built | **Video produced (2:33). Upload pending (manual).** |
| Project write-up (what it does, how, challenges, learnings, next) | Done: `submission/DEVPOST_SUBMISSION.md` |
| Code or live link | Done: https://github.com/Sidd927/secondlook (public) · https://secondlook-nu.vercel.app |
| Built with (languages, frameworks, AI tools, sponsor tools) | Done (in the write-up) |
| Tracks: select every track the project fits | Recommendation below |
| AI-assisted work disclosed | Done: README, write-up, video description |
| Built during the hacking period, credits for libraries/assets | Done: the repo history starts Nov 15, 2026; credits are in the README and `submission/video/README.md` |

## Application status
- **Live:** https://secondlook-nu.vercel.app returns 200. `GET /api/check` reports 7,192 recalls, data through Nov 12, 2026, AI off. The single check, label OCR, batch and CSV export, seller message and copy link were all exercised in production while recording the video.
- **Engine:** deterministic rules engine only. The optional Claude integration is **not enabled** and is never described as live.
- **Fixed during this audit:** the live site attributed a "≈6%" consumer-response figure to the CPSC 2018 workshop report, which doesn't contain it. That report states a **65% overall correction rate** (865 closed recalls, FY2014–2016). The site, README, write-up and strategy docs now use that figure ("≈1 in 3 recalled units never corrected"). The 6% figure appears only in the 2017 workshop slides and transcript, and it's cited inconsistently: the Senate letter treats it as the average consumer participation rate, while an EU study treats it as the correction rate for press-release-only recalls. So it's no longer used anywhere.

## Video status
- **File:** `submission/video/final/SecondLook_IceHacks_2026_Demo.mp4`. Not committed: at 114 MB it's over GitHub's file limit.
  - 153.0 s · 1920×1080 · 30 fps · H.264 High (CRF 12) · AAC-LC 48 kHz stereo
  - −14.3 LUFS / −1.4 dBTP
- **QA performed:**
  - ffprobe
  - full decode without errors
  - blackdetect (none)
  - freezedetect (one narrated 3.2 s hold)
  - HyperFrames check (ok)
  - visual inspection of frames across every scene, including the copy-click state, label OCR, verdicts and end card
  - Whisper transcription of the narration for intelligibility
- **Honesty:**
  - All product shots are real capture of the live app.
  - The hook listing is labelled "Illustrative listing".
  - The sample label is marked "SAMPLE".
  - Every on-screen fact has a visible source.
  - The narration states that the live app runs on the deterministic engine.
- **Voice:** synthetic (Kokoro-82M, local). This is disclosed. A human recording can be swapped in using `submission/video/VOICEOVER_SCRIPT.md`.
- **Public URL:** **none yet. Do not paste a link into Devpost until it plays in a private window.**

## Prize-category recommendation
| Track | Recommendation | Reasoning |
|---|---|---|
| Best Deployed / Shipped App | **Enter (strongest)** | Judged on a working public URL, reliability, completeness and docs. All four are met. |
| Best Design & UX | **Enter** | Judged on usability, visual polish, accessibility and consistency. Distinctive, consistent identity; accessible contrast; responsive. |
| Best AI Hack | **Enter, flagged as ambiguous** | The official text counts "AI app builders and vibe-coding tools", which the project used (Claude Code). But the deployed product's only ML is Tesseract OCR, and judging weighs "smart use of the tools". We're eligible by the wording, though less competitive than AI-native projects. Never imply live LLM features. |
| Overall | Automatic | — |
| Best Hardware Hack | Do not enter | No physical component. |

Each project can win only one track, so entering every fitting track has no downside.

## README status
Complete:
- problem (with corrected citation), "Try it in 30 seconds", features, real screenshots
- architecture (Mermaid), stack, setup, limits
- AI disclosure (build, product, video), credits

The video link is still pending upload.

## Devpost write-up status
`submission/DEVPOST_SUBMISSION.md` is final and paste-ready. The only placeholder is the clearly marked **PENDING** video link.

## Outstanding manual actions (owner: you)
1. **Upload the video** to YouTube as Public, following `submission/video/YOUTUBE_UPLOAD.md` (title, description, chapters, thumbnail and SRT are prepared). Check it in a private window.
2. **Submit on Devpost** before **6:00 PM PT**: paste the write-up, the live and GitHub links and the video link; select the tracks above.
3. Optional: send me the YouTube link so I can add it to the README and the write-up and push.
4. Optional: record your own narration (script and swap steps in `submission/video/VOICEOVER_SCRIPT.md`) and re-render (about 2 min).

## URLs verified
- https://secondlook-nu.vercel.app: 200
- https://github.com/Sidd927/secondlook: public
- https://icehacks.devpost.com/: requirements unchanged

## Final commit
See `git log -1` on `main` (the hash is reported in the final hand-off message).
