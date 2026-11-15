# Devpost Media Guide: SecondLook

All media are genuine captures of the live app (https://secondlook-nu.vercel.app), taken Nov 15, 2026 by `submission/video/capture/gallery.mjs`. That script loads the production site, types and clicks for real, and uploads the sample label. No image is mocked or edited, and none contains personal data, credentials or API keys.

## Thumbnail (Project Overview → Thumbnail)
| File | Size | Notes |
|---|---|---|
| `submission/assets/devpost-thumbnail.png` | 1500 × 1000 (3:2), 215 KB | The SecondLook lockup, the tagline "Look twice before you buy it used.", a one-line purpose statement and three fact chips (7,192 CPSC recalls · Federal ban rules · Label OCR), next to a real crop of the live "Don't buy this. It's illegal to sell." verdict. The source HTML is in `submission/assets/thumbnail-src/`. |

## Image gallery (Project Details → Image gallery)
Folder: `submission/assets/devpost-gallery/`. It contains exactly **nine** images: **six recommended (1–6) and three optional (7–9)**. Every image is a 2400 × 1600 (3:2) PNG under 1 MB. Upload in this order. The order tells the story: input → verdict → evidence → photo → action → scale.

| Order | File | Caption | What it proves |
|---|---|---|---|
| 1 | `01-landing.png` | Paste a listing or add a label photo: one box, no account. | The product and its single entry point. |
| 2 | `02-verdict-banned.png` | A listing that never says "Rock 'n Play" is flagged: inclined infant sleepers are banned from sale, and it matches the CPSC recall. | The core value: vague listing → decisive, cited verdict. |
| 3 | `03-recall-evidence.png` | The evidence: official recall photo, hazard, reported deaths, units affected, remedy and a link to the notice. | Results are traceable to official data. |
| 4 | `04-label-ocr.png` | Label photo read in the browser (Tesseract.js): brand and model number "CHP55". | The photo workflow and on-device OCR. |
| 5 | `06-seller-message.png` | Questions to send the seller, built from the recall notice, with one-click copy. | It ends in an action, not a search page. |
| 6 | `08-batch-screening.png` | Batch mode for thrift stores: 12 items screened, sorted by risk, exportable as CSV. | Second audience and scale. |
| 7 *(optional)* | `07-model-checks.png` | Narrow recalls: only 3-point-harness mamaRoo models are covered, quoted from the notice. | Precision: not every brand match is a recall. |
| 8 *(optional)* | `09-ban-rules.png` | The rules behind the ban check, each with its legal citation. | Methodology and legal grounding. |
| 9 *(optional)* | `05-label-result.png` | After the label check: brand "Fisher Price" and model "CHP55" carried into the result. | The OCR output feeds the real check. |

### Caption tips
- Devpost shows a caption field under each uploaded image. Paste the caption text exactly.
- If you only want six images, use 1–6. Add 7–9 if you want to show depth.

## Video (Project Details → Video demo link)
`https://youtu.be/q6ousB0I6-I`
- Verified Public (not unlisted or private), 153 s, plays signed out.
- The YouTube description includes chapters, links and the AI, voice and music disclosures.
- Captions are burned in. The SRT is at `submission/video/final/SecondLook_IceHacks_2026_Demo.srt` and can also be uploaded to YouTube.
