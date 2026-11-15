# Final Submission Audit: SecondLook (IceHacks 2026)

Audited Nov 15, 2026, about 03:00 PT. **Deadline: Sun Nov 15, 2026, 6:00 PM PT (Mon Nov 16, 7:30 AM IST).** Solo entry by Siddhant Patil.

**Final submission commit:** `a324b6a56365458f10cb5a86880a5819552955db` (`a324b6a`) on `main`, which holds the corrected Devpost copy. The next commit only records this hash in this file.

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

### Known inconsistencies in the live app copy (not changed, per instruction not to modify the app)
These are display strings in the deployed app. They're also visible in the gallery screenshots and the demo video:
- `src/app/page.tsx`: the landing fact card reads "≈1 in 3 — Recalled units never refunded, replaced or repaired…" (the same derived claim removed from the docs).
- `src/app/page.tsx` / `how-it-works/page.tsx`: "Free, no account, nothing stored" / "Nothing you paste is stored". These are broader than the precise statement above.
- `src/lib/bans.ts`: the inclined-sleeper summary says "illegal to sell them, new or used, no matter when they were made". The statute's text bans manufacture, sale, distribution and import, but whether that covers private resale of units made before the ban isn't confirmed by a primary source we checked.

A copy-only fix is possible (no logic change), but the published video and the screenshots would keep showing the old wording.

## Outstanding manual actions (owner: Siddhant)
1. Fill in the Devpost form from `submission/DEVPOST_SUBMISSION.md`, upload the thumbnail and gallery, and select the prizes.
2. Tick the rules / Terms of Service checkbox yourself, then **Submit before 6:00 PM PT**.
3. After submitting, open the public project page and check that the video embed, links and images render.
