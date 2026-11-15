// Orchestrates a listing check: understand → bans → retrieve → (AI adjudicate) → verdict.
import type { CheckResult, Candidate, ListingProfile } from "./types";
import { getCorpus } from "./recalls";
import { checkBans } from "./bans";
import { profileFromText, searchRecalls } from "./match";
import { aiAvailable, aiAdjudicate, aiUnderstand, aiModelName } from "./ai";

export interface CheckInput {
  text: string;
  image?: { data: string; mediaType: "image/jpeg" | "image/png" | "image/webp" };
}

export async function runCheck(input: CheckInput): Promise<CheckResult> {
  const t0 = Date.now();
  const corpus = await getCorpus();
  const text = input.text.slice(0, 4000);

  let profile: ListingProfile = profileFromText(text, corpus);
  let aiError: string | undefined;
  const useAi = aiAvailable();

  if (useAi) {
    try {
      const understood = await aiUnderstand(text, input.image);
      profile = {
        ...profile,
        brand: understood.brand ?? profile.brand,
        productType: understood.productType ?? profile.productType,
        productLine: understood.productLine,
        modelNumbers: [...new Set([...profile.modelNumbers, ...understood.modelNumbers])].slice(0, 12),
        approxYear: understood.approxYear ?? profile.approxYear,
        searchTerms: understood.searchTerms,
        categories: [...new Set([...profile.categories, ...understood.categories])],
        source: "ai",
      };
    } catch (e) {
      aiError = e instanceof Error ? e.message : "AI step failed";
    }
  }

  // Bans are checked against the listing plus what AI read off any photo.
  const banText = [text, profile.productLine, profile.productType, profile.brand].filter(Boolean).join(" ");
  const bans = checkBans(banText);

  let candidates = searchRecalls(text, profile, corpus, useAi && !aiError ? 8 : 6);

  if (useAi && !aiError && candidates.length) {
    try {
      const verdicts = await aiAdjudicate(text, profile, candidates);
      candidates = candidates
        .map((c) => {
          const v = verdicts.get(c.recall.id);
          if (!v) return c;
          const strength = v.verdict === "same_product" ? "strong" : v.verdict === "possibly_same" ? "possible" : "weak";
          return {
            ...c,
            strength,
            aiVerdict: v.verdict,
            aiReason: v.reason,
            checks: v.checks.length ? v.checks : c.checks,
          } as Candidate;
        })
        .sort((a, b) => order(b) - order(a) || b.score - a.score)
        .slice(0, 6);
    } catch (e) {
      aiError = e instanceof Error ? e.message : "AI step failed";
    }
  }

  const strong = candidates.filter((c) => c.strength === "strong");
  const possible = candidates.filter((c) => c.strength === "possible");
  const banned = bans.filter((b) => b.severity === "banned");
  const modelConfirmed = strong.some((c) => c.signals.some((s) => s.startsWith("Identifier")));
  const aiConfirmedUnconditional = strong.some((c) => c.aiVerdict === "same_product" && c.checks.length === 0);

  let verdict: CheckResult["verdict"];
  let headline: string;
  let explanation: string;
  if (banned.length) {
    verdict = "do_not_buy";
    headline = "Don't buy this. It's illegal to sell.";
    explanation = `${banned[0].title}. ${strong.length ? "It also matches a CPSC recall." : ""}`.trim();
  } else if (modelConfirmed || aiConfirmedUnconditional) {
    verdict = "do_not_buy";
    headline = "Don't buy this. It matches a recall.";
    explanation = `This listing matches “${strong[0].recall.title}”. Federal law prohibits selling recalled products.`;
  } else if (strong.length || possible.length || bans.length) {
    verdict = "verify";
    headline = strong.length ? "Likely recalled. Confirm before you pay." : "Possible recall. Ask the seller first.";
    explanation = strong.length
      ? `This looks like a product covered by “${strong[0].recall.title}”. Recalls usually cover specific model numbers or dates, so confirm the details below with the seller.`
      : bans.length
        ? bans[0].title + "."
        : `We found ${possible.length} recall${possible.length > 1 ? "s" : ""} for similar products from this brand. Ask the seller for the details below to rule them out.`;
  } else {
    verdict = "no_recall_found";
    headline = "No matching recall found.";
    explanation =
      "Nothing in the CPSC recall database matched this listing. That's not a safety guarantee: check that the item is complete, undamaged and has its original labels.";
  }

  const sellerQuestions = buildQuestions(candidates.filter((c) => c.strength !== "weak"), bans.length > 0, profile);
  return {
    verdict,
    headline,
    explanation,
    profile,
    bans,
    candidates,
    sellerQuestions,
    sellerMessage: buildMessage(sellerQuestions),
    engine: {
      mode: useAi && !aiError ? "ai" : "rules",
      model: useAi ? aiModelName() : undefined,
      aiError,
      recallsSearched: corpus.recalls.length,
      liveRecalls: corpus.liveCount,
      dataAsOf: corpus.dataAsOf,
      ms: Date.now() - t0,
    },
  };
}

function order(c: Candidate) {
  return c.strength === "strong" ? 2 : c.strength === "possible" ? 1 : 0;
}

function buildQuestions(cands: Candidate[], hasBan: boolean, profile: ListingProfile): string[] {
  const qs: string[] = [];
  qs.push("Could you send a clear photo of the label or sticker showing the brand, model number and manufacture date?");
  const text = cands.flatMap((c) => c.checks).join(" ").toLowerCase();
  if (/date code|manufactur|production|date/.test(text)) qs.push("What date code or manufacture date is printed on it?");
  if (/lot|serial/.test(text)) qs.push("Is there a lot or serial number? Could you photograph it?");
  if (/sold|between/.test(text)) qs.push("Roughly when and where was it bought new?");
  if (cands.length) qs.push("Has it ever had a recall repair, replacement part or retrofit kit installed?");
  if (profile.categories.some((c) => ["crib", "bassinet", "play-yard", "infant-sleeper"].includes(c)) && !hasBan)
    qs.push("Is every part, screw and the original instructions still included?");
  return qs.slice(0, 5);
}

function buildMessage(qs: string[]): string {
  return [
    "Hi! I'm interested in this. Before I buy, I like to check secondhand items against the CPSC recall list. Could you help with a few details?",
    "",
    ...qs.map((q, i) => `${i + 1}. ${q}`),
    "",
    "Thanks so much!",
  ].join("\n");
}
