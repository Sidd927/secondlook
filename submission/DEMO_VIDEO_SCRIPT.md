# Demo Video Script: SecondLook (target 2:20, hard limit 3:00)

**Setup before recording**
- Browser at https://secondlook-nu.vercel.app, 1440×900, zoom 110%, other tabs closed.
- Open the page once beforehand so the server is warm.
- In a second tab, open a real-looking Marketplace-style listing. A plain note or doc with the text is fine; don't show anyone else's real listing.
- For the photo segment, have a phone photo or a printed label ready on your desktop. *Don't* use a fabricated label for a real recall claim: say "sample label" on camera.
- Use a calm, conversational pace. Read the lines below as a guide, not word for word.

---

### 0:00–0:20 · The problem
**Screen:** landing page hero, then scroll slowly to the three statistics.

> "When a product gets recalled, stores stop selling it. People at home mostly don't send it back. CPSC research puts the response rate around six percent. So the rest ends up on Facebook Marketplace. This fall, Consumer Reports found banned baby sleep products on every major resale site."

### 0:20–0:40 · The solution
**Screen:** scroll back up to the checker. Hover over "Add label photo".

> "SecondLook is a safety check for the moment before you buy something used. Paste the listing, or snap the label. It checks every CPSC recall since 2005 plus federal sale bans, then tells you what to ask the seller. The hard part is that listings never use the official name."

### 0:40–1:50 · Live demo
**0:40:** Paste: *"Fisher Price baby sleeper/rocker, rainforest theme, barely used. $25 pickup only."* Click **Check listing**.

> "Here's a real-world kind of listing. It doesn't say 'Rock 'n Play' anywhere."

**0:50:** The red verdict appears. Point to the ban card, then scroll to the first recall card (image, deaths, 4.7 million units).

> "It recognizes an inclined infant sleeper, which has been banned since 2022, so it's illegal to sell at all. And here's the actual CPSC recall: the Rock 'n Play, linked to infant deaths, with a link to the official notice."

**1:05:** Click the **IKEA dresser** example.

> "Most recalls are more subtle than that. This MALM dresser matches a tip-over recall, but recalls usually cover specific models."

**1:15:** Expand "How to tell if this item is covered", then scroll up to **Message the seller** and click **Copy**.

> "So SecondLook pulls the identifying details out of the notice and writes the questions for you. One click, paste it into Marketplace chat."

**1:30:** Click **Add label photo** and choose the sample label. Show "Read from photo…", then **Check listing**.

> "If the seller sends a photo of the label, the text is read right in your browser, and model numbers give the most precise match."

**1:40:** Go to **Batch check**, click **Load sample intake list**.

> "And for thrift stores and donation drives, who also can't legally sell recalled items, batch mode screens a whole intake list at once and exports a CSV."

### 1:50–2:10 · How it's built
**Screen:** /how-it-works page; scroll through Data → Matching → AI. Optionally flash the README architecture diagram on GitHub.

> "Under the hood: a snapshot of 7,192 CPSC recalls that refreshes live from the CPSC API, a rules engine for federal bans with legal citations, and a custom matching engine. It translates listing slang into recall vocabulary, resolves brands and matches model numbers. Claude is used narrowly, to read messy listings and photos and judge the recalls the engine found. It can't invent a recall, and it never decides what's legal."

*(If the deployed app shows "Rules engine (AI off)", say: "The live demo is running the rules engine; with an API key, Claude adds photo understanding and per-recall judgments.")*

### 2:10–2:20 · Close
**Screen:** back to the hero headline.

> "SecondLook. Look twice before you buy it used. It's live and free at secondlook-nu.vercel.app."

---

**After recording:** upload to YouTube as **Public** or **Unlisted** (public is safest), check the link in a private window, then paste it into Devpost and the README.
