# SecondLook Demo Film: Storyboard

**Runtime:** 2:33 · **1920×1080 · 30 fps · H.264/AAC** · Burned-in captions plus a separate `.srt`

**Visual system:** the product's own identity, a "printed safety notice" look:
- **Colours:** warm paper `#f5f2eb`, ink `#15130f`, signal red `#b3311a`, amber `#a8650f`.
- **Type:** Instrument Serif for display, Geist for UI, Geist Mono for labels.
- **Ruled out:** gradients, glow, stock footage and fake UI.

**Honesty rules:**
- Every product screen is genuine footage of `https://secondlook-nu.vercel.app`, captured with real clicks, typing and uploads (`capture/capture.mjs`).
- Motion graphics show only verified facts, each with a visible source.
- The hook's listing card is labelled "Illustrative listing".

| # | Time | Scene | Picture | Sound | Source / truth |
|---|---|---|---|---|---|
| 1 | 0:00–0:11 | **Hook** | An ordinary marketplace listing card ("Baby sleeper/rocker · $25 · pickup only") using the official CPSC product photo. It slowly pushes in, then slides left as serif type rises: *It looks perfectly safe.* / *But what if it isn't?* (red italic) | Soft whoosh; low bass hit on "isn't" | Card is labelled "Illustrative listing · product photo: U.S. CPSC" |
| 2 | 0:11–0:39 | **Problem** | A red scan line sweeps the card. The listing text morphs into the real recall: "U.S. CPSC · Recall #19105 · Apr 12, 2019 · Fisher-Price Recalls Rock 'n Play Sleepers Due to Reports of Deaths · ≈4.7M units · refund or voucher". A "BANNED FROM SALE" stamp lands, citing the Safe Sleep for Babies Act (2022). Then "A recall stops new sales. Not resales." Then a comparison: "Baby sleeper/rocker" ≠ "Rock 'n Play Sleeper". Then the Consumer Reports 2026 finding, with four platform chips | Whoosh, swelling bass hit on the stamp, pops on the chips | CPSC recall data (in-app snapshot); Pub. L. 117-126; Consumer Reports 2026 investigation (named on screen) |
| 3 | 0:39–0:53 | **Meet SecondLook** | The magnifier mark draws itself, the check stroke draws in red, and the wordmark wipes in. Tagline. The brand dissolves into the live landing page (camera eases from 1.12× to 1×), then pushes into the listing box | Riser cresting into a bass hit at the reveal | Real footage: `landing.mp4` |
| 4a | 0:53–1:12 | **Demo: paste a listing** | Chapter tag "01 Paste a listing". Typing in close-up, then pull back for the Check click. Push in on the red verdict "Don't buy this. It's illegal to sell.", then the federal-ban card, then the matching CPSC recall card (photo, deaths, 4.7M units). Callouts sit top-right | Typing, click, soft ping on the verdict | Real footage: `sleeper.mp4` |
| 4b | 1:12–1:25 | **Demo: snap the label** | The sample label photo (marked as sample) flies into the upload box. Push in on "Read from photo: FISHER-PRICE Rock 'n Play Sleeper Model No. CHP55…". Then the result facts (Brand Fisher Price · Model CHP55) | Clicks, ping | Real footage: `photo.mp4`; OCR is real Tesseract.js in the browser |
| 4c | 1:25–1:41 | **Demo: know what to ask** | The "Infant swing" example produces amber "Likely recalled. Confirm before you pay." Then the seller message, with the Copy button clicked ("Copied"). Then "How to tell if this item is covered": only 3-point-harness MamaRoo models (4M-005, 1026, 1037) | Click, click | Real footage: `swing.mp4` |
| 4d | 1:41–1:51 | **Demo: batch** | The batch page: load the sample intake list, then the results "3 don't sell · 7 verify · 2 no match", then Export CSV (a real download) | Clicks | Real footage: `batch.mp4`; the downloaded CSV is kept in `raw/` |
| 5 | 1:51–2:21 | **How it works** | A six-node pipeline builds left to right: Listing/photo → On-device OCR → Product identification → CPSC recall index → Matching + ban rules → Evidence-backed verdict. Then a stats band: a 7,192 counter, "+ live" API, 23 concepts. Then a slang→recall mapping table. Then the ban-rule list with citations, and a dark badge: "Deterministic rules engine. No generative AI makes the decision." | Pops as nodes appear | Numbers checked against `data/recalls.json` (7,192, latest Nov 12, 2026) and `src/lib/taxonomy.ts` (23 concepts) |
| 6 | 2:21–2:26 | **Impact** | Three serif lines rise: "Before you buy it. / Before you sell it. / *Look twice.*" (red) | Bass swell on "Look twice" | — |
| 7 | 2:26–2:33 | **Close** | Mark and wordmark redraw. Tagline, then two link chips (secondlook-nu.vercel.app · github.com/Sidd927/secondlook). Footer: "Built for IceHacks 2026 · Recall data: U.S. CPSC". Hold, with the music resolving to the end | Soft chime; music resolves | — |

**Deliberately left out:**
- **The often-quoted "≈6% of consumers respond to recalls":** its source definition is ambiguous across citations (see `docs/FINAL_SUBMISSION_AUDIT.md`).
- **Any suggestion that live AI makes decisions.**
