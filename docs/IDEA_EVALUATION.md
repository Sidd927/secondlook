# Idea Evaluation

Internal selection weights (not the official judging weights): Impact 20%, Originality 20%, Technical execution 15%, UX potential 15%, Demonstrability 15%, Feasibility 15%. Scores are out of 10.

Research time was capped at about 30 minutes. "Verified" means we checked a source during that window; everything else is a hypothesis.

## Candidates

### 1. Financial-aid award letter decoder
Upload college aid offers; extract grants vs. loans; compute the true net price.
- **Verified problem:** GAO-23-104708 found ~91% of colleges omit or understate net price, and three-quarters call loans an "award". uAspire/New America (2018) counted 136 different terms for the unsubsidized loan.
- **Verified competition:** Niche Financial Aid Decoder (launched Mar 2026), VSAC Award Advisor (AI), TuitionFit (OCR), College Raptor, CollegeLens, DecidED. The space is crowded.

### 2. Household recall sweep from purchase history
Import Amazon/Walmart order history and flag recalled products you own.
- **Verified problem:** the consumer recall response rate is ≈6% (CPSC 2017 workshop / 2018 report).
- **Verified competition:** RecallDefense already imports Amazon/Walmart CSVs and receipts. Kept, CoverKeep and RecallSentry do inventory matching.

### 3. Secondhand listing safety check (SecondLook)
Paste a Marketplace/Craigslist listing or photo → check it against CPSC recalls and federal sale bans → get exact questions for the seller.
- **Verified problem:** Consumer Reports (fall 2026) found banned infant products on Facebook Marketplace, eBay, Mercari and Craigslist. Recalled items are listed under vague names ("baby sleeper/rocker"). The CPSC sent Meta ~1,000 takedown requests a month for one product. Resale of recalled products is illegal (CPSA §19).
- **Verified competition:** none found for listing-level checks. The official tools (recalls.gov, cpsc.gov) need the exact product name or model.

### 4. Hallucinated-citation checker
Verify references in AI-written papers and briefs against CrossRef/CourtListener.
- **Competition:** GPTZero's citation check, CourtListener's citation lookup API, and Scite. Crowded, and the audience is narrower.

### 5. Benefits-renewal letter navigator
Explain Medicaid/SNAP renewal letters and build a deadline checklist.
- **Hypothesis:** real procedural-churn problem. But generic "explain my letter" AI tools abound, and building a realistic demo needs sample state letters we don't have.

### 6. Accessible chart sonification for blind students
- **Hypothesis:** original, but hard to demonstrate in a 3-minute video, and existing work exists (Highcharts sonification, MIT Olli).

## Weighted matrix

| Idea | Impact 20% | Originality 20% | Tech 15% | UX 15% | Demo 15% | Feasible 15% | **Weighted** |
|---|---:|---:|---:|---:|---:|---:|---:|
| 1. Aid letter decoder | 8 | 4 | 7 | 8 | 8 | 7 | **6.90** |
| 2. Household recall sweep | 7 | 4 | 7 | 7 | 7 | 7 | **6.40** |
| **3. SecondLook** | **8** | **8** | **8** | **8** | **9** | **8** | **8.15** |
| 4. Citation checker | 6 | 5 | 7 | 6 | 7 | 7 | **6.25** |
| 5. Benefits letters | 8 | 5 | 6 | 7 | 6 | 5 | **6.20** |
| 6. Chart sonification | 6 | 8 | 7 | 6 | 4 | 5 | **6.10** |

## Stress test of the winner
- **Does it solve a real problem?** Yes: documented deaths linked to recalled infant products, plus active federal takedown efforts that platforms aren't keeping up with.
- **Is AI necessary?** It's useful, not decorative. Listing language doesn't match recall language, and photos of labels hold the decisive identifiers. Bans stay deterministic on purpose.
- **Value in one sentence:** "Check a secondhand listing against U.S. recalls and sale bans before you hand over cash."
- **Impressive in 60 seconds:** paste "baby sleeper/rocker" → it's identified as a banned product → the actual recall is cited → seller questions are ready to copy.
- **More than a wrapper?** Yes. Deterministic retrieval over the real CPSC corpus with live refresh, a legal rules engine, identifier extraction, and an AI layer constrained to adjudicate retrieved evidence.
