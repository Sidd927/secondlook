# SecondLook: IceHacks 2026 Devpost Submission

Field-by-field copy for the IceHacks Devpost form. Everything below was checked against the deployed app (https://secondlook-nu.vercel.app), the code in this repository, and the official rules page (https://icehacks.devpost.com/) on Nov 15, 2026. The submission deadline is **Sun Nov 15, 2026, 6:00 PM PT**.

---

## 1. Project Overview

### Project name
```
SecondLook
```

### Elevator pitch (max 200 characters)
```
Paste a secondhand listing or snap its label. SecondLook checks it against U.S. product recalls and federal sale bans, then tells you exactly what to ask the seller before you pay.
```
**Character count: 180 / 200**

### Thumbnail
`submission/assets/devpost-thumbnail.png`
- 1500 × 1000 px (3:2), PNG, 215 KB.
- Shows the SecondLook lockup, the tagline, a one-line purpose statement, and a real crop of the live app's "Don't buy this" verdict.

---

## 2. Project Details

### About the project
Paste everything between the lines into the "About the project" field (Devpost renders Markdown).

---

## Inspiration

A recall stops new sales, but it doesn't automatically reach the products already in people's homes. CPSC staff reported a 65% overall correction rate across 865 closed Section 15 cases from FY 2014–2016, a figure that counts corrections by manufacturers, distributors, retailers and consumers together. Recalled products that stay in circulation can resurface on Facebook Marketplace, Craigslist or a garage-sale table.

In 2026, Consumer Reports looked for four kinds of banned infant products on resale sites (inclined sleepers, drop-side cribs, padded crib bumpers and in-bed sleepers) and found listings on Facebook Marketplace, eBay, Mercari and Craigslist. It also showed why a buyer can't easily catch this: the recalled Fisher-Price Rock 'n Play was listed as "baby sleeper/rocker", "floor cradle" and "bassinet". Official recall search works best when you already know the product's exact name or model number. A secondhand listing usually gives you neither.

The moment that matters is the few minutes between seeing a listing and handing over cash. That's the moment SecondLook is built for.

## What it does

SecondLook screens a secondhand listing **before you buy**.

- **Paste the listing** exactly as the seller wrote it, or **add a photo of the product label**. The label is read with OCR right in your browser.
- **Federal sale-ban check.** Some product categories are restricted by federal law regardless of brand, and each rule shows its citation:
  - **Inclined sleepers for infants** (sleep surface inclined more than 10°) and **crib bumpers** (padded bumpers, vinyl bumper guards and vertical slat covers; non-padded mesh liners are excluded). The Safe Sleep for Babies Act of 2022 (Pub. L. 117-126) made both banned hazardous products, prohibiting their manufacture, sale, distribution and import.
  - **Lawn darts:** banned since 1988 (16 CFR 1306).
  - **Cribs:** since June 28, 2011, cribs sold or resold in the U.S. must meet the federal crib standards (16 CFR 1219/1220). CPSC's guidance for resellers says drop-side cribs can't meet them.
  - **"Verify" warnings, not bans:** cribs that may predate mid-2011, and infant sleep products such as in-bed sleepers that fall under the infant sleep products rule (16 CFR 1236).
- **Recall search.** Ranked matching against 7,192 CPSC recalls since 2005, plus anything published after that snapshot, which the server checks for on the public CPSC API.
- **A clear verdict:** *Don't buy*, *Verify first* or *No matching recall*. Every flagged result comes with its evidence: the official recall photo, the hazard, reported injuries, units affected, the remedy, and a link to the notice on cpsc.gov.
- **What to verify.** Many recalls cover only certain models or date codes, so SecondLook pulls those identifiers out of the notice ("How to tell if this item is covered") and turns them into a **ready-to-send message for the seller**.
- **Batch mode** for thrift stores, donation drives and sellers: paste up to 200 items, get a sorted flag table, and export it as CSV.
- **Shareable checks:** every text check has its own link.

No account is needed. SecondLook has no database: the app doesn't save the listings you check, and label photos are read in your browser rather than uploaded. A shareable link does carry the listing text in its URL.

## What makes it different

Most recall tools start from things you already own: you register a product or import a receipt, and you get alerted later. A secondhand buyer is in a different position. They have a vague listing, maybe a photo, and a few minutes to decide. SecondLook is built around that **listing-first, pre-purchase** moment:

1. It works on the input buyers actually have, not exact model numbers.
2. It treats **legal sale bans** as separate from recalls, because a banned category is a hard "no" whatever the brand.
3. It ends with an **action**, the questions to send the seller, rather than just a list of search results.

## How we built it

- **Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4**, deployed on **Vercel**. Two server routes do the work: `/api/check` for single listings and `/api/batch` for lists.
- **Recall data.** A build script normalizes the **CPSC Recalls REST API** into a compact snapshot of 7,192 recalls (products, model numbers, UPCs, hazards, remedies, injuries, retailers). At runtime, the server requests every recall published after the snapshot date and merges it in, with a 6-hour cache. If CPSC is unreachable, the snapshot still serves.
- **Matching engine** (custom TypeScript, no external search service):
  - **Vocabulary bridge.** 23 product concepts map listing language ("pack n play", "sleeper/rocker", "dresser") to how recall notices are written ("play yard", "inclined sleeper", "chest", "tip-over").
  - **Field-weighted BM25** over titles, product names, product types, firms and descriptions, including two-word phrases, so "Rock 'n Play" outranks a generic "play".
  - **Brand resolution** against recalling firms *and* licensed brand names mined from notice text ("Sharper Image-branded… recalled by Allstar").
  - **Exact model-number and UPC matching** from the listing or the OCR'd label.
  - **Strength grading** (strong / possible / weak) with a plain "why this matched" for every candidate. Within a tier, exact product-line phrases rank first, then recalls involving deaths or injuries.
- **Federal ban rules:** deterministic pattern rules with citations, including exemptions (non-padded mesh crib liners aren't banned).
- **OCR:** **Tesseract.js** runs in the browser, so the label photo never has to leave the device.
- **Decision-making is deterministic.** The live app runs entirely on the rules engine, and every result is labelled "Rules engine (AI off)". We also wrote an optional Claude integration (structured-output listing understanding and recall adjudication), but it is **not enabled** in the deployment and makes no decisions in the live product.

## Challenges we ran into

- **The vocabulary gap cuts both ways.** Expanding "sleeper/rocker" into recall terms found the Rock 'n Play, but concept words alone also pulled in unrelated recalls (a Graco stroller for a Pack 'n Play listing). The fix: expansions can *support* a match but never *create* one without a term from the listing itself.
- **Brands hide behind licensees.** Sharper Image fire pits were recalled by Allstar, so firm names alone missed them. We mine "X-branded" and "sold under the X brand" phrases from notices.
- **Short identifiers collide.** "TR02" substring-matched an unrelated bicycle recall. Short identifiers now need an exact token match, and a model-number hit only counts as strong when the brand agrees.
- **Ranking what matters.** A 2013 mold-inspection notice was outranking the 2019 Rock 'n Play recall tied to infant deaths. Ranking now puts exact product-line phrases first, then hazard severity.
- **Generic words as brands.** "Vintage" was being read as a brand because some company has it in its name. A generic-word list fixed it.
- **Serverless cold starts.** The page-load status request goes to the same function that serves checks, so the 7,192-recall index is already warm when the user submits.

## Accomplishments that we're proud of

These are real results from the live app:
- **Vague listing:** "Fisher Price baby sleeper/rocker, barely used" → **Don't buy**. It flags the inclined-sleeper ban and ranks the 2019 Rock 'n Play recall (#19105, about 4.7 million units) first, without the listing ever naming the product.
- **Label photo:** OCR in the browser reads "Model No. CHP55" off a label, and the check runs with brand and model filled in.
- **Narrow recall:** "4moms mamaRoo infant seat swing" → **Verify first**. The app quotes from the notice that only 3-point-harness models are covered (4M-005, 1026, 1037), not the 5-point-harness version, and writes the questions to send the seller.
- **Recent data:** a Sharper Image tabletop fire pit listing matches a recall CPSC published on Nov 12, 2026, three days before the deadline.
- **Batch:** a 12-item intake list is sorted into 3 "don't sell", 7 "verify" and 2 "no match", with CSV export.

## What we learned

- Many recalls are conditional (model ranges, date codes), so "matches a recall" is often not the whole answer. The most useful output is *what to verify*.
- Public federal data is rich enough to build a real product on, but most of the work is normalizing it and bridging how ordinary people describe things.
- Legal facts belong in deterministic, citable code. We kept every product-safety decision explainable.

## What's next for SecondLook

- A browser extension that checks Marketplace and Craigslist listings in place
- More official sources: NHTSA (car seats), Health Canada and other national recall databases
- Better product identification from photos, and more product concepts
- Check-by-photo over SMS for people without a laptop
- Accessibility and language support, starting with Spanish
- Intake tooling for thrift stores and donation drives

## Built with AI assistance (disclosure)

SecondLook was built during IceHacks 2026 by a solo developer, with substantial help from **Claude Code** (Anthropic's AI coding assistant). It was used for research, design, most of the code, the demo-film production and documentation. I directed and reviewed the work and can explain every part of it.

In the product, every verdict comes from the deterministic rules engine. The only machine-learning component running live is browser-based Tesseract.js OCR, which reads label photos on the device. The optional Anthropic (Claude) integration in the codebase is disabled in the deployment and makes no decisions. In the demo video, the narration is synthetic (Kokoro-82M, generated locally), the music is original, and every product shot is real screen capture of the live app.

**Credits:** recall data and product images from the U.S. Consumer Product Safety Commission (public domain). Consumer Reports' 2026 investigation is cited. Open-source libraries are listed in the README.

---

### Built with
Paste into the "Built with" field, one tag at a time or comma-separated (19 tags):
```
nextjs, react, typescript, javascript, tailwindcss, nodejs, vercel, tesseract.js, ocr, bm25, rest-api, cpsc-recalls-api, zod, lucide, playwright, ffmpeg, hyperframes, python, claude-code
```
- **App:** nextjs, react, typescript, javascript, tailwindcss, nodejs, vercel, tesseract.js, ocr, bm25, rest-api, cpsc-recalls-api, zod, lucide.
- **Demo-film pipeline (in the repo under `submission/video/`):** playwright, ffmpeg, hyperframes, python.
- **AI tool used to build it:** claude-code. The rules ask for the AI tools used.
- **Deliberately not listed:** Anthropic API. It isn't enabled in the deployed product.
- **Verified against the repo:**
  - nextjs, react, typescript, tailwindcss, vercel and nodejs come from the app stack and deployment.
  - javascript: `.mjs` scripts.
  - tesseract.js / ocr: `Checker.tsx`.
  - bm25: `src/lib/match.ts`.
  - rest-api / cpsc-recalls-api: `src/lib/recalls.ts` and `scripts/sync-cpsc.mjs`.
  - zod: API route validation.
  - lucide: icons.
  - playwright, ffmpeg, hyperframes and python: the demo-film pipeline in `submission/video/`.
  - claude-code: the AI tool used during development.

### "Try it out" links
| Label | URL |
|---|---|
| Live app | https://secondlook-nu.vercel.app |
| Source code (GitHub) | https://github.com/Sidd927/secondlook |

### Image gallery
The folder `submission/assets/devpost-gallery/` contains exactly nine images: **six recommended (1–6) and three optional (7–9)**. Upload them in this order. All are genuine screenshots of the live app at 2400 × 1600 (3:2). Full guidance is in `submission/DEVPOST_MEDIA_GUIDE.md`.

| # | File | Caption |
|---|---|---|
| 1 | `01-landing.png` | Paste a listing or add a label photo: one box, no account. |
| 2 | `02-verdict-banned.png` | A listing that never says "Rock 'n Play" is flagged: inclined infant sleepers are banned from sale, and it matches the CPSC recall. |
| 3 | `03-recall-evidence.png` | The evidence: official recall photo, hazard, reported deaths, units affected, remedy and a link to the notice. |
| 4 | `04-label-ocr.png` | Label photo read in the browser (Tesseract.js): brand and model number "CHP55". |
| 5 | `06-seller-message.png` | Questions to send the seller, built from the recall notice, with one-click copy. |
| 6 | `08-batch-screening.png` | Batch mode for thrift stores: 12 items screened, sorted by risk, exportable as CSV. |
| 7 *(optional)* | `07-model-checks.png` | Narrow recalls: only 3-point-harness mamaRoo models are covered, quoted from the notice. |
| 8 *(optional)* | `09-ban-rules.png` | The rules behind the ban check, each with its legal citation. |
| 9 *(optional)* | `05-label-result.png` | After the label check: brand "Fisher Price" and model "CHP55" carried into the result. |

### Video demo link
```
https://youtu.be/q6ousB0I6-I
```
- Verified Nov 15, 2026: **Public** (not unlisted or private), plays signed out, 2:33 (153 s).
- Title: "SecondLook | Look Twice Before You Buy It Used — IceHacks 2026", channel Siddhant Patil.

---

## 3. Additional Information

### Sponsor / Special Prizes
**Select:** Best Deployed / Shipped App – 1st, – 2nd, – 3rd · Best Design & UX · Best AI Hack.
**Do not select:** Best Hardware Hack.

| Option | Select? | Why |
|---|---|---|
| **Best Deployed / Shipped App – 1st / 2nd / 3rd** | **Yes, all three** | Devpost lists these as three separate prizes (one winner each) with the same judging description: "working public URL, reliability, completeness and docs". Opting in is per prize, so selecting only one would exclude SecondLook from the other placements. The rules say "select every track your project fits" and "each project can win only one track", so selecting all three can't produce more than one win. If organizers say otherwise on Discord, follow them. |
| **Best Design & UX** | **Yes** | "Usability, visual polish, accessibility and consistency": a distinctive, consistent identity, a clear verdict hierarchy, accessible contrast, a skip link and focus states, and a responsive layout. |
| **Best AI Hack** | **Yes, eligible by the published wording but a weaker fit** | Official text: "Best use of AI, whether through AI app builders and vibe-coding tools or models, APIs and agents." SecondLook was built with Claude Code (an AI coding tool) and runs ML-based OCR live. But no generative AI makes decisions in the deployed product, and judges score "usefulness, technical depth, polish, smart use of the tools, and impact". The write-up says this plainly. Never describe the product as AI-powered. |
| Best Hardware Hack | **No** | No physical component. |

---

## 4. Final Submit Checklist (manual)
- [ ] Project name "SecondLook", and the elevator pitch pasted exactly (180 characters).
- [ ] Thumbnail uploaded: `submission/assets/devpost-thumbnail.png`.
- [ ] "About the project" pasted, and the Markdown preview looks right.
- [ ] Built-with tags added; Anthropic API **not** listed.
- [ ] Try-it-out links: Live app and GitHub, both open while signed out.
- [ ] Gallery: images 1–6 (plus optional 7–9) uploaded in order, with captions.
- [ ] Video link `https://youtu.be/q6ousB0I6-I` entered in the video field; the embed preview plays.
- [ ] Prizes: Deployed 1st/2nd/3rd, Design & UX and AI Hack selected; Hardware not selected.
- [ ] Team: solo entry (Siddhant Patil); registered for IceHacks on Devpost.
- [ ] Eligibility: student, 13+, project started during the hacking period (repo history begins Nov 15, 2026).
- [ ] AI contributions disclosed (Claude Code; synthetic narration; optional Claude integration not enabled).
- [ ] Third-party assets credited (CPSC data and images, Consumer Reports citation, open-source libraries, Pixabay SFX, OFL fonts).
- [ ] Official rules and Devpost Terms re-read. **You** tick the agreement checkbox.
- [ ] Submitted before **6:00 PM PT, Sun Nov 15** (7:30 AM IST, Mon Nov 16). Then open the public project page and check it.

---

## 5. Final Review

**Why this submission works** (evidence mapped to the five equally weighted criteria):
- **Technical execution:** a live deployment over real federal data, a custom matching engine with documented failure modes and fixes, citable ban rules, in-browser OCR and a live-delta data pipeline. Judges can verify all of it in the app and the repo.
- **Creativity & originality:** listing-first, pre-purchase screening; legal bans treated separately from recalls; the output is an action (seller questions), not a search page.
- **Impact & usefulness:** a sourced safety problem (CPSC staff's reported 65% overall correction rate, the Consumer Reports 2026 investigation) and concrete outputs a parent or thrift store can use right away.
- **Design & UX:** a distinctive "printed safety notice" identity, one-box input, example chips, a clear verdict hierarchy and responsive accessibility basics. The gallery shows the real states.
- **Presentation:** a 2:33 produced film built entirely from real app footage, a concise story, verified claims and genuine screenshots.

**Remaining weaknesses (honest):**
1. **Best AI Hack is a stretch.** The live product's only ML is OCR, so AI-native projects will likely score higher on "smart use of the tools".
2. **Matching is heuristic.** Brand-only matches can surface the wrong product from the same company. Strength grading and "verify first" mitigate this, but it isn't eliminated.
3. **U.S. CPSC scope only.** No vehicle or car-seat (NHTSA), food or drug recalls.
4. **No user research.** We make no claims about real users or measured impact.
5. **The video uses a synthetic voice.** It's disclosed, but a human voice would come across warmer.
