# Product Strategy: SecondLook

**Tagline:** Look twice before you buy it used.

**One sentence:** SecondLook checks a secondhand listing, or a photo of its label, against every U.S. CPSC recall since 2005 and federal sale bans. It then tells you exactly what to ask the seller.

## Problem
Recalls stop new sales; they don't get products out of homes. CPSC's 2018 recall-effectiveness report found a 65% overall correction rate across 865 closed recalls (FY2014–2016), so roughly a third of recalled units were never refunded, replaced or repaired. Some of those flow into Facebook Marketplace, Craigslist, garage sales and thrift stores. (An often-quoted ≈6% consumer-response figure comes from the 2017 workshop slides; its exact definition is ambiguous across sources, so we don't rely on it.) Reselling a recalled product is illegal under CPSA §19, but in practice nobody checks:
- In a 2026 investigation, Consumer Reports found banned infant products (inclined sleepers, drop-side cribs, padded bumpers, in-bed sleepers) on every major resale platform. Facebook Marketplace had all four.
- Members of Congress reported that CPSC sent Meta ~1,000 takedown requests a month for one recalled lounger. Marketplace got ~75% of CPSC's takedown requests in 2022.
- The official tools (cpsc.gov, recalls.gov) expect an exact product name or model number. Listings say "baby sleeper/rocker".

## Target users
1. **Primary:** parents and caregivers buying used baby gear. These are often the families with the tightest budgets, for whom secondhand is the only option.
2. **Secondary:** casual sellers, thrift and resale stores, and donation drives, who are legally barred from selling recalled items.
3. **Tertiary:** anyone who already owns the item and needs the remedy.

## Existing alternatives and the gap
| Alternative | Gap |
|---|---|
| cpsc.gov / recalls.gov search | Exact-name search; no understanding of listing slang; no ban rules; no guidance on what to verify |
| Recall-alert apps (RecallDefense, Kept, CoverKeep) | Track things you *already own*; not built for the pre-purchase moment |
| Marketplace platforms | Reactive takedowns; Consumer Reports found no listing-time warnings on several platforms |

**Gap:** no tool works at the moment of a secondhand purchase, with the inputs a buyer actually has: a vague listing and maybe a photo.

## Solution
1. Paste a listing or snap the label (OCR in the browser, optional AI vision).
2. **Federal ban rules** run deterministically.
3. **Ranked retrieval** over the CPSC corpus (snapshot + live delta), with a slang→recall vocabulary bridge, brand resolution and exact model/UPC matching.
4. **Optional Claude step** identifies the product and adjudicates candidates. It is schema-validated, and can't invent recalls or override bans.
5. **Verdict + verification:** do not buy / verify first / no match. It lists the identifying details pulled from the notice, a ready-to-send message for the seller, and remedy info for owners.
6. **Batch mode** for resale stores: an intake list in, a sorted flag table and CSV out.

## Core differentiator
It's evidence-first and built for the purchase moment. Every verdict is traceable to a CPSC notice or a cited law, it explains *what to verify*, and it turns that into a message you can send the seller.

## Why it can win
- **Impact:** documented infant deaths, a clear legal hook, and a timely Consumer Reports investigation.
- **Originality:** listing-level checking plus seller questions; we found no direct competitor.
- **Technical:** a real federal dataset, a live refresh, a custom retrieval engine, a legal rules engine and a constrained AI layer.
- **Design:** a "printed safety notice" visual identity rather than a generic AI dashboard.
- **Demo:** the most impressive moment ("sleeper/rocker" → banned + recall) takes under 10 seconds.

## Primary user journey
Landing → paste listing (or tap an example) → about 1 s progress → verdict banner → ban card → matching recalls with images, hazards and injuries → "How to tell if this item is covered" → copy the seller message.

## Essential features (shipped)
- Single-listing check (text + photo/OCR)
- Ban rules engine with citations
- CPSC retrieval with live delta
- Optional Claude understanding + adjudication
- Seller message composer
- Batch mode + CSV export
- Methodology/limits page

## Future possibilities
Browser extension that annotates Marketplace listings in place; NHTSA car-seat recalls; Health Canada recalls; SMS/WhatsApp bot; thrift-store POS integration; a share link for a result.

## Relevant tracks
Best AI Hack · Best Deployed / Shipped App · Best Design & UX · Overall

## Weaknesses and mitigations
| Weakness | Mitigation |
|---|---|
| False positives from brand-only matches | Strength grading, "why this matched", and identifier checks; similar-but-different recalls are collapsed |
| False sense of safety on "no match" | Explicit non-guarantee copy and an inspection checklist |
| AI cost/abuse on a public URL | Per-IP rate limit; batch mode is rules-only; graceful fallback |
| Corpus staleness | Live CPSC delta every 6 h on top of the shipped snapshot |
| U.S.-only scope | Stated in the limits section; roadmap item |
