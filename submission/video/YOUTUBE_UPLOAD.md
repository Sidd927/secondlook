# Publishing the Demo Video

**Status: published.** https://youtu.be/q6ousB0I6-I. Verified Public (not unlisted or private), 153 s, plays signed out (checked Nov 15, 2026).

The steps and metadata below are kept for reference.

**File to upload:** `submission/video/final/SecondLook_IceHacks_2026_Demo.mp4` (2:33, 1080p30, 114 MB)

- **Subtitles:** `submission/video/final/SecondLook_IceHacks_2026_Demo.srt`. They're already burned in; uploading the SRT also makes them searchable.
- **Thumbnail:** `submission/video/final/thumbnail.png`

## Steps
1. Go to https://studio.youtube.com, click **Create → Upload videos**, and choose the MP4.
2. Paste the title and description below.
3. **Thumbnail:** upload `thumbnail.png`. YouTube may require phone verification for custom thumbnails; skip this if it isn't available.
4. **Audience:** "No, it's not made for kids". The video *is about* baby products but is aimed at adults.
5. **Subtitles (optional):** Video elements → Add subtitles → Upload file → "With timing" → the `.srt`.
6. **Visibility:** **Public**. Unlisted also works for Devpost, but Public is what the rules literally ask for.
7. Open the link in a private/incognito window to confirm it plays without signing in.
8. Paste the link into Devpost's video field and tell me, so I can add it to the README and `submission/DEVPOST_SUBMISSION.md`.

## Title
SecondLook: check a secondhand listing for recalls & federal sale bans (IceHacks 2026)

## Description
Recalled and banned baby products keep showing up on resale sites, often under vague names like "baby sleeper/rocker". SecondLook checks a secondhand listing, or a photo of its label, against every U.S. CPSC recall since 2005 and federal sale bans, then tells you exactly what to ask the seller before you pay.

▶ Live app: https://secondlook-nu.vercel.app
▶ Code: https://github.com/Sidd927/secondlook

Chapters
0:00 The listing
0:11 The problem
0:39 Meet SecondLook
0:53 Demo: paste a listing
1:12 Demo: snap the label (on-device OCR)
1:25 Demo: know what to ask the seller
1:41 Demo: batch check for thrift stores
1:51 How it works
2:21 Look twice

How it works: a deterministic rules engine. A ranked search over 7,192 CPSC recalls plus newer ones fetched live from the public CPSC API, a listing-slang → recall-vocabulary bridge, brand and model-number matching, and federal sale-ban rules with legal citations. The live app runs entirely on this engine; no generative AI makes the decisions.

Built for IceHacks 2026. Recall data and product image: U.S. Consumer Product Safety Commission. Built with assistance from Claude Code (AI coding assistant). The narration is synthetic (Kokoro-82M, generated locally), the music is original, and all product footage is real screen capture of the live app. Sound effects: Pixabay.

Not affiliated with the CPSC. SecondLook is a screening aid, not a safety guarantee.
