# Final Submission Audit: SecondLook (IceHacks 2026)

Audited Nov 15, 2026, about 03:00 PT. **Deadline: Sun Nov 15, 2026, 6:00 PM PT (Mon Nov 16, 7:30 AM IST).** Solo entry by Siddhant Patil.

**Final submission commit:** `967f49482bcd831477de4e1be21851ccdda995ef` (`967f494`) on `main`. A later commit only records this hash in this file.

## Official requirements (re-verified on https://icehacks.devpost.com/ today)
| Requirement | Status |
|---|---|
| Demo video: public YouTube/Vimeo/Youku link, ≤ 3 min, shows the project working, explains the problem, the demo and how it was built | **Done.** https://youtu.be/q6ousB0I6-I: Public (`isUnlisted:false`, `isPrivate:false`), 153 s, plays signed out |
| Project write-up | **Done.** `submission/DEVPOST_SUBMISSION.md` (field-by-field, paste-ready) |
| Code or live link | **Done.** https://github.com/Sidd927/secondlook (public) · https://secondlook-nu.vercel.app (200) |
| Built with (languages, frameworks, AI tools, sponsor tools) | **Done.** 19 tags, including claude-code; the Anthropic API is deliberately excluded |
| Tracks | **Done.** Recommendation below |
| AI-assisted work disclosed | **Done.** README, write-up, YouTube description |
| Built during the hacking period; third-party credits | **Done.** Repo history starts Nov 15, 2026; credits are in the README and `submission/video/README.md` |
| Five equally weighted judging criteria | Technical Execution, Creativity & Originality, Impact & Usefulness, Design & UX, Presentation (verified) |

## Application status (verified against production today)
- `GET /api/check` → 7,192 recalls, data through Nov 12, 2026, live CPSC delta checked, AI disabled.
- "Fisher Price baby sleeper/rocker…" → *Don't buy*. Inclined-sleeper ban; top recall #19105.
- "4moms mamaRoo infant seat swing" → *Verify first*. Model identifiers quoted from recall #22200.
- "Sharper Image tabletop fire pit" → strong match to recall #27082 (published Nov 12, 2026).
- Batch → correct mix of verdicts. `?q=` share links resolve. Label OCR exercised in the gallery capture.
- **Engine:** deterministic rules engine. The optional Claude integration is not enabled and is never described as live.
- **Citation fix made earlier today:** the live site's ambiguous "≈6%" figure was replaced with the CPSC report's 65% overall correction rate.

## Media status
- **Thumbnail:** `submission/assets/devpost-thumbnail.png`. 1500×1000 (3:2), 215 KB, brand lockup plus a real crop of the live verdict.
- **Gallery:** `submission/assets/devpost-gallery/`. Nine genuine 2400×1600 captures of the live app (6 recommended + 2 optional + 1 spare). The order and captions are in `submission/DEVPOST_MEDIA_GUIDE.md`. They contain no personal data or credentials.
- **Video:** published and verified. The master file stays local (114 MB, over GitHub's limit). QA: ffprobe, a clean decode, no black frames, −14.3 LUFS, and frames inspected in every scene.

## Prize-category recommendation
| Option | Select | Reason |
|---|---|---|
| Best Deployed / Shipped App – 1st, 2nd, 3rd | **Yes (all three)** | Three separate Devpost prizes (one winner each) with the same criteria. Opt-in is per prize, and a project can win only one track. |
| Best Design & UX | **Yes** | Matches "usability, visual polish, accessibility and consistency". |
| Best AI Hack | **Yes, flagged** | The official wording includes "AI app builders and vibe-coding tools" (we used Claude Code) and "models"; Tesseract OCR runs live. No generative AI runs in production, so it's a weaker fit. Disclosed plainly. |
| Best Hardware Hack | **No** | No physical component. |

## Document consistency
- `README.md`: live URL, the **video URL**, try-it steps, the corrected problem statistics, and the AI disclosure (build / product / video).
- `submission/DEVPOST_SUBMISSION.md`: complete field-by-field copy, **no PENDING placeholders**, video link verified.
- `submission/DEVPOST_MEDIA_GUIDE.md`: thumbnail, gallery order, captions.
- `submission/video/*`: the video is marked published, with the same URL.

## Outstanding manual actions (owner: Siddhant)
1. Fill in the Devpost form from `submission/DEVPOST_SUBMISSION.md`, upload the thumbnail and gallery, and select the prizes.
2. Tick the rules / Terms of Service checkbox yourself, then **Submit before 6:00 PM PT**.
3. After submitting, open the public project page and check that the video embed, links and images render.
