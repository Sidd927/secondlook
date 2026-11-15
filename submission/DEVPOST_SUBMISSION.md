# Devpost Submission: SecondLook

## Project title
SecondLook

## Tagline
Check a secondhand listing against U.S. recalls and federal sale bans before you hand over cash.

## Links
- **Live app:** https://secondlook-nu.vercel.app
- **Code:** https://github.com/Sidd927/secondlook
- **Demo video (2:33):** **PENDING — paste the public YouTube link here after upload.** The file is `submission/video/final/SecondLook_IceHacks_2026_Demo.mp4`. Projects without a working video link are not judged.

---

## Inspiration
We kept running into the same fact: a product recall stops *new* sales, but it barely touches the products already in people's homes. In CPSC's own data, roughly one in three recalled units is never refunded, replaced or repaired (a 65% overall correction rate across 865 closed recalls). Those products don't vanish. Some get listed on Facebook Marketplace for $25.

This fall, Consumer Reports went looking for four kinds of banned infant products (inclined sleepers, drop-side cribs, padded crib bumpers and in-bed sleepers) and found them on every major resale platform. They also showed why the official recall search doesn't help: the recalled Fisher-Price Rock 'n Play was listed as "baby sleeper/rocker", "floor cradle" and "bassinet". You can't look up a recall for a product whose name you don't know.

Selling a recalled product is already illegal. What's missing is the check, at the one moment it matters: right before someone buys.

## What it does
You paste a listing, or snap a photo of the product's label, and SecondLook returns one of three verdicts in about a second:

- **Don't buy:** the item is in a federally banned category, or it matches a recall by model number.
- **Verify first:** it matches a recall, but many recalls cover only specific model numbers or date codes, so it shows exactly which ones.
- **No matching recall:** with a clear note that this isn't a safety guarantee, and what to inspect in person.

Every result includes:
- the actual CPSC notice, with image, hazard, injuries, units recalled and a link
- the federal law behind any ban
- "How to tell if this item is covered": identifiers extracted from the notice
- **a ready-to-copy message to the seller** asking for exactly the details that settle it
- remedy and contact information for anyone who already owns it

**Batch mode** lets thrift stores, donation drives and garage-sale sellers paste a whole intake list (up to 200 items) and get a sorted flag table with CSV export.

## How we built it
- **Data:** a compact snapshot of 7,192 CPSC recalls since 2005, built from the public CPSC Recalls REST API. At runtime the server fetches every recall published after the snapshot and merges it in (6-hour cache), so this week's recalls are searchable today. A fire-pit recall published three days before the deadline is matched in the app.
- **Federal ban engine:** deterministic rules with legal citations for the Safe Sleep for Babies Act (inclined sleepers and padded bumpers, with the mesh-liner exemption), the 2011 crib standards (drop-side and pre-2011 cribs), the lawn-dart ban, and the infant sleep products rule.
- **Matching engine** (TypeScript, no external search service):
  - a 23-concept vocabulary bridge from listing slang to recall language
  - field-weighted BM25 with phrase matching
  - brand resolution against recalling firms *and* licensed brands ("Sharper Image-branded… by Allstar")
  - exact model-number and UPC matching
  - strong/possible/weak grading with an explanation for every candidate
- **Optional AI layer (Claude via the Anthropic TypeScript SDK), not enabled in the public demo:** two narrow structured-output steps validated with Zod.
  1. Identify the product from listing text and, optionally, a label photo (vision).
  2. Adjudicate the candidates the engine retrieved: same product, possibly the same, or different, with a reason and what to check.

  Claude can't invent recalls or override legal bans. **The live demo runs the deterministic rules engine**; we chose to ship it that way and didn't run the Claude steps against the live API during the hackathon. Every result is labeled with the engine that produced it ("Rules engine (AI off)"). The ML piece judges will see live is the in-browser OCR.
- **OCR:** Tesseract.js runs in the browser, so label photos are read on-device.
- **App:** Next.js 16 (App Router), React 19, Tailwind CSS v4, deployed on Vercel. The UI uses a "printed safety notice" visual language (warm paper, ink and one signal color per verdict) instead of a generic AI dashboard.

## Challenges we ran into
- **The vocabulary gap cuts both ways.** Expanding "sleeper/rocker" into recall terms found the Rock 'n Play, but it also let concept words alone pull in unrelated recalls (a Graco stroller for a Pack 'n Play listing). We settled on a rule: expansions can support a match but can't create one without a term from the listing itself.
- **Brands hide behind licensees and parents.** Sharper Image fire pits were recalled by Allstar, so firm names alone missed them. We now mine "X-branded" and "sold under the X brand" patterns from the notices.
- **Short identifiers collide.** "TR02" substring-matched an unrelated bicycle recall. Short identifiers now need an exact token match, and a model hit only counts as strong when the brand agrees.
- **Ranking what matters first.** A 2013 mold-inspection notice was outranking the 2019 Rock 'n Play recall tied to infant deaths. Within a strength tier we now rank exact product-line phrases first, then hazard severity.
- **Serverless cold starts.** The page-load status request now goes to the same function that serves checks, so the index is warm before the first real query.

## Accomplishments we're proud of
- It works on the messy input real people have: a vague listing, or a photo of a sticker.
- Every flag is traceable to a CPSC notice or a cited law; nothing is a black box.
- It turns a recall notice into an action: the questions to send the seller.
- It's live, public and fast (about 0.5 s per warm check), with no account and nothing stored.

## What we learned
- Many recalls are conditional (model ranges, date codes), so "matches a recall" is often not the whole answer. The useful output is *what to verify*.
- The best use of an LLM here is narrow: reading messy input and judging retrieved evidence. Legal facts stay in deterministic code.
- Public government data (the CPSC API) is rich enough to build a real product on, if you put in the work to normalize it.

## What's next for SecondLook
- A browser extension that annotates Marketplace and Craigslist listings in place
- NHTSA car-seat and Health Canada recalls
- Check-by-photo over SMS/WhatsApp for people without a laptop
- Intake integration for thrift stores and donation centers
- Partnering with organizations that run baby-gear swaps and donation drives

## Built with
**App:** TypeScript · Next.js 16 · React 19 · Tailwind CSS v4 · Node.js · Zod · Tesseract.js · Lucide · Vercel · CPSC Recalls REST API · GitHub

**Optional, not enabled in the live demo:** Anthropic Claude API (`@anthropic-ai/sdk`)

**Demo video:** HyperFrames · GSAP · Playwright · FFmpeg · Kokoro-82M (local text-to-speech) · Pixabay sound effects

**AI tools used to build it (disclosed):** Claude Code

## AI tools disclosure
- **Building it:** SecondLook was built with substantial assistance from **Claude Code** (Anthropic), which was used for research, design, most of the implementation, the demo-video production and documentation. The team directed and reviewed the work and can explain every part of it.
- **In the product:** there's an optional Claude integration (listing understanding and recall adjudication), but it is **not enabled** in the public deployment. The live app runs the deterministic rules engine and says so on every result. Label OCR (Tesseract.js) runs in the browser.
- **In the video:** the narration is synthetic, generated locally with Kokoro-82M. The music is original and was synthesized for the film. All product footage is real screen capture of the live app.

## Tracks to select
Each project can win only one track, so entering every track that genuinely fits costs nothing.

| Track | Enter? | Why |
|---|---|---|
| **Best Deployed / Shipped App** | **Yes (strongest fit)** | Public URL, live CPSC data refresh, graceful degradation, batch mode, full docs and README. Matches "working public URL, reliability, completeness and docs". |
| **Best Design & UX** | **Yes** | Distinctive visual identity, clear verdict hierarchy, accessible contrast, skip link and focus states, responsive layout. |
| **Best AI Hack** | **Yes, with honest framing (ambiguous)** | The official description counts "AI app builders and vibe-coding tools", and we built with Claude Code. But the live product's only ML is in-browser OCR; the Claude layer is optional and off. Judges weigh "smart use of the tools", so AI-native projects may score higher. Say this plainly if asked. |
| Overall (1st–3rd) | Automatic | Judged on all five criteria. |
| Best Hardware Hack | No | No physical component. |
