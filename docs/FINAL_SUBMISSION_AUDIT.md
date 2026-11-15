# Final Submission Audit: SecondLook (IceHacks 2026)

Audited Nov 15, 2026, about 03:00 PT. **Deadline: Sun Nov 15, 2026, 6:00 PM PT (Mon Nov 16, 7:30 AM IST).** Solo entry by Siddhant Patil.

**Final submission commit:** `3e1faedd37b1f4769ebf1a71480a6b2410e09b1e` (`3e1faed`) on `main`, which holds the corrected app copy (`264df07`) and the recaptured media. The next commit only records this hash in this file.

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
- **Gallery:** `submission/assets/devpost-gallery/`. Nine genuine 2400×1600 captures of the live app (6 recommended + 3 optional). The order and captions are in `submission/DEVPOST_MEDIA_GUIDE.md`. They contain no personal data or credentials.
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

## Pre-paste corrections (requested review, Nov 15)
1. **CPSC statistic.** Every document now says: "CPSC staff reported a 65% overall correction rate across 865 closed Section 15 cases from FY 2014–2016, a figure that counts manufacturer, distributor, retailer and consumer corrections together." The derived "≈1 in 3 never corrected" claim was removed from the Devpost copy, README, product strategy and final review.
2. **Storage claim.** "Nothing is stored" was not demonstrably true in absolute terms:
   - the rate limiter keeps IP timestamps in memory
   - failed checks are logged with `console.error`
   - shareable `?q=` links carry the listing text in the URL, which the hosting platform can log

   What *is* true, verified in the code: there's no account or auth code, there's no database or persistence, and label photos aren't uploaded while AI is disabled (`Checker.tsx` only sends the image when `ai.enabled`). The copy now says exactly that.
3. **Legal claims, checked against their citations:**

   | Claim | Source |
   |---|---|
   | Inclined sleepers for infants (>10°) and crib bumpers (padded bumpers, vinyl bumper guards, vertical slat covers; non-padded mesh liners excluded) are banned hazardous products; manufacture, sale, distribution and import are prohibited | Safe Sleep for Babies Act of 2022, Pub. L. 117-126; CPSC final rules effective Sept. 15, 2023 |
   | Lawn darts are banned | 16 CFR 1306 (1988) |
   | Cribs sold or resold since June 28, 2011 must meet the standards; CPSC's reseller guidance says drop-side cribs can't comply | 16 CFR 1219/1220 |
   | Pre-2011 cribs and infant sleep products are "verify" warnings, not bans | 16 CFR 1236 |
   | Selling a product under a CPSC recall is unlawful | 15 U.S.C. § 2068(a)(2)(B) |

   Removed: "illegal to sell no matter what", "can't legally be sold at all", and "each verdict comes with evidence" (a *No match* result has no notice to show).
4. **Gallery.** The folder holds exactly nine images. The guide and the Devpost copy now list all nine: six recommended (1–6) and three optional (7–9, including `05-label-result.png`).
5. **Tags.** Each of the 19 tags was checked against the repo (the mapping is in the Devpost doc). Claude Code is kept in the tags and the disclosure. The Anthropic API is not listed.
6. **AI disclosure.** States: deterministic rules engine; browser-based Tesseract.js OCR as the only live ML; the optional Anthropic integration disabled; Claude Code used during development; synthetic narration in the video.

### Live-app copy corrections (deployed)
Text-only changes in three files: `src/app/page.tsx`, `src/app/how-it-works/page.tsx` and the inclined-sleeper `summary` string in `src/lib/bans.ts`. There were no engine, API, data, dependency or design changes.

| Before | After |
|---|---|
| Landing fact card "≈1 in 3: recalled units never refunded, replaced or repaired…" | "65%: overall correction rate CPSC staff reported across 865 closed Section 15 cases (FY 2014–2016). It counts corrections by manufacturers, distributors, retailers and consumers together." |
| "Free, no account, nothing stored" | "Free, no account, no database" |
| "Nothing you paste is stored." (How it works) | No account and no application database. Discloses in-memory rate-limit data (IP and request times), the hosting provider's error logs, and listing text in shareable URLs. Label photos are read in the browser and not uploaded while the AI step is off. |
| Inclined sleepers: "illegal to sell them, new or used, no matter when they were made" | "…banned hazardous products under the Safe Sleep for Babies Act, which prohibits their manufacture, sale, distribution and import in the U.S." |

**Verification:**
- `npm run build` ✓.
- `npx tsx scripts/smoke.mts`: all 10 listings return the same verdicts as before (engine unchanged).
- Production deployed by the GitHub push (Vercel Git integration).
- Live HTML contains the new strings, and the old strings are absent.
- `POST /api/check` returns the new ban summary.

**Recaptured:** gallery `01`, `02`, `04`, `05`, `07` and `09` (content changed), the full set re-shot; `devpost-thumbnail.png`; and the README's `docs/screenshots/home.png`, `result-banned.png` and `how-it-works.png`.

### Published video vs. the corrected app (not changed; needs your approval)
Checked frame by frame on the master file, which is the same render as https://youtu.be/q6ousB0I6-I.

| Outdated on-screen text (live-app footage) | Where | Timestamps |
|---|---|---|
| Hero bullet "Free, no account, nothing stored" | Brand-reveal landing shot; start of each demo before the camera punches in | **0:45.0–0:50.0**, **0:59.6–1:00.3**, **1:12.0–1:14.0**, **1:17.7–1:18.3**, **1:25.0–1:27.7** |
| Inclined-sleeper ban card "…illegal to sell them, new or used, no matter when they were made…" | Demo 1 (pasted listing) and Demo 2 (label photo) result screens; readable when the camera punches in on the ban card | **1:00.4–1:07.4** (in close-up 1:03.3–1:07.3), **1:18.4–1:25.0** |
| "≈1 in 3" fact card | Not visible anywhere in the film | — |

The narration, captions and motion-graphic scenes contain none of the three claims.

**Fix feasibility (no full rebuild needed):** the pipeline is reproducible from `submission/video/`.
1. Re-run `capture.mjs` for the four affected clips (landing, sleeper, photo, swing) against the corrected site. Check event markers and nudge `FOOTAGE` media offsets if the timing shifted.
2. Rebuild the scenes and re-render.

Narration, music, graphics and captions stay as they are, and the work is roughly 20–30 minutes including QA. The catch is that YouTube can't replace a file under an existing URL. A fix means a **new upload and a new link** in Devpost, the README and the docs.

## Outstanding manual actions (owner: Siddhant)
1. Fill in the Devpost form from `submission/DEVPOST_SUBMISSION.md`, upload the thumbnail and gallery, and select the prizes.
2. Tick the rules / Terms of Service checkbox yourself, then **Submit before 6:00 PM PT**.
3. After submitting, open the public project page and check that the video embed, links and images render.
