# Final Review: judged as a skeptical IceHacks judge would

Scored against the five official, equally weighted criteria. These are honest scores, not aspirational ones.

| Criterion | Score /10 | Notes |
|---|---:|---|
| Technical execution | 8 | Real federal dataset (7,192 recalls) with a live delta, a custom retrieval and matching engine, a legal rules engine, in-browser OCR, and structured-output AI with fallback. Deployed and verified. **Gap:** the Claude path is implemented and type-checked but was **not exercised end to end**, because no API key was available during the build. |
| Creativity & originality | 8 | We found no direct competitor that checks a *listing* at the moment of purchase. The "message the seller" output and the slang-to-recall vocabulary bridge are distinctive. Recall-alert apps exist for things you already own. |
| Impact & usefulness | 8 | Documented infant deaths, ≈6% recall response, and a fresh Consumer Reports investigation. Real users: parents buying used gear, sellers, thrift stores. It's U.S./CPSC-only, and NHTSA car seats aren't covered. |
| Design & UX | 8 | A distinctive "printed safety notice" identity; one-click examples; clear verdict hierarchy; mobile layout checked; skip link, focus rings, aria-live regions, reduced-motion support. Not audited with a screen reader. |
| Presentation | 6 → 8 once the video exists | README, architecture diagram, real screenshots, write-up and demo script are done. **The demo video is not recorded yet, and the submission is not judged without it.** |

## Three biggest weaknesses
1. **No demo video yet.** This is a hard requirement. It's a user action: record it from `submission/DEMO_VIDEO_SCRIPT.md`, upload it publicly, and paste the link into Devpost and the README.
2. **AI isn't live in production.** Without an `ANTHROPIC_API_KEY` the deployment runs the rules engine, which is correctly labeled and fully functional. That weakens the Best AI Hack case, and the AI code path is untested against the live API. *Mitigation:* add the key in Vercel, redeploy, and run one check. The code falls back to the rules engine on any AI error, so the risk is limited to the AI step itself.
3. **Matching is heuristic.** Brand-only matches can surface the wrong product from the same company (e.g. other Fisher-Price recalls for a Fisher-Price listing). *Mitigated by* strength grading, a "why this matched" line, and the "similar recalls that probably aren't this item" fold. AI adjudication would further reduce it.

## Fixed during review
- Ranking: a 2013 mold-inspection notice had outranked the 2019 Rock 'n Play death-related recall. Within a tier, exact product-line phrases now rank first, then severity.
- False positives from generic words detected as brands ("vintage") and from short model-number substrings ("TR02").
- Cold start: the page-load status request now warms the same function that serves checks.
- A broken citation URL for the crib standard (404) was replaced with the current CPSC page.
- Duplicate "units units" label, and mobile nav wrapping.

## Final checks
- [x] Application starts locally (`npm run dev`)
- [x] Production build succeeds (`npm run build`)
- [x] Public deployment works: https://secondlook-nu.vercel.app
- [x] Core user journey works (verified in the browser: examples, typed listing, photo OCR, batch)
- [x] No obvious broken buttons
- [x] No exposed secrets (`.env*` git-ignored; there's no key in the repo or client bundle)
- [x] README complete
- [x] GitHub repository public: https://github.com/Sidd927/secondlook
- [x] Screenshots are real, captured from production
- [x] AI tools disclosed (README and the Devpost write-up)
- [x] Third-party libraries and data credited
- [x] Devpost write-up prepared (`submission/DEVPOST_SUBMISSION.md`)
- [x] Demo script ready (`submission/DEMO_VIDEO_SCRIPT.md`)
- [ ] **Public demo video link obtained** (user action)
- [ ] **Devpost form submitted before Sun Nov 15, 6:00 PM PT / Mon Nov 16, 7:30 AM IST** (user action)
- [ ] Optional: `ANTHROPIC_API_KEY` added to Vercel to enable AI mode (user action)
