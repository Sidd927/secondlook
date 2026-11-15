// Candidate retrieval + deterministic scoring: field-weighted BM25 with taxonomy query
// expansion, brand resolution against recalling firms, and exact model/UPC matching.
import type { Candidate, ListingProfile, MatchStrength, Recall } from "./types";
import type { Corpus } from "./recalls";
import { brandKey } from "./recalls";
import { CONCEPTS, detectConcepts } from "./taxonomy";
import { bigrams, extractModelNumbers, extractYear, normalize, squash, tokenize } from "./text";

const K1 = 1.2;
const B = 0.75;

/** Rules-only understanding of a listing (used when no AI provider is configured). */
export function profileFromText(text: string, corpus: Corpus): ListingProfile {
  const concepts = detectConcepts(text);
  return {
    brand: detectBrand(text, corpus),
    productType: concepts[0]?.label ?? null,
    productLine: null,
    modelNumbers: extractModelNumbers(text),
    approxYear: extractYear(text),
    searchTerms: [],
    categories: concepts.map((c) => c.id),
    source: "rules",
  };
}

export function detectBrand(text: string, corpus: Corpus): string | null {
  const hay = " " + brandKey(text) + " ";
  let best: string | null = null;
  for (const [phrase, count] of corpus.index.brandPhrases) {
    if (phrase.length < 4 && count < 3) continue;
    if (hay.includes(" " + phrase + " ") && (!best || phrase.length > best.length)) best = phrase;
  }
  return best;
}

function stemPhrase(p: string): string[] {
  const toks = tokenize(p.replace(/_/g, " "));
  return toks.length > 1 ? [toks.join("_")] : toks;
}

export function searchRecalls(text: string, profile: ListingProfile, corpus: Corpus, limit = 6): Candidate[] {
  const { index, recalls } = corpus;
  const N = recalls.length;

  // ---- Build weighted query ----
  const q = new Map<string, number>();
  const add = (terms: string[], w: number) => terms.forEach((t) => q.set(t, Math.max(q.get(t) ?? 0, w)));
  const base = tokenize(text);
  add(base, 1);
  add(bigrams(base), 1.4);
  for (const extra of [profile.productLine, profile.productType, ...profile.searchTerms]) {
    if (!extra) continue;
    const t = tokenize(extra);
    add(t, 1);
    add(bigrams(t), 1.4);
  }
  const conceptIds = new Set(profile.categories);
  for (const c of CONCEPTS) if (conceptIds.has(c.id)) add(c.expand.flatMap(stemPhrase), 0.6);

  const brand = profile.brand ? brandKey(profile.brand) : null;
  const brandTokens = new Set(brand ? tokenize(brand) : []);

  // ---- BM25 over postings ----
  const scores = new Map<number, number>();
  const hits = new Map<number, Set<string>>();
  for (const [term, qw] of q) {
    const post = index.postings.get(term);
    if (!post) continue;
    const df = index.df.get(term) ?? 1;
    const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));
    for (const d of post) {
      const tf = index.docTf[d].get(term) ?? 0;
      const s = (idf * tf * (K1 + 1)) / (tf + K1 * (1 - B + (B * index.docLen[d]) / index.avgLen));
      scores.set(d, (scores.get(d) ?? 0) + qw * s);
      if (!hits.has(d)) hits.set(d, new Set());
      hits.get(d)!.add(term);
    }
  }

  // ---- Exact identifier matches (model numbers / UPCs) across the whole corpus ----
  const models = profile.modelNumbers.map(squash).filter((m) => m.length >= 4);
  const modelHits = new Map<number, string[]>();
  if (models.length) {
    index.modelBlob.forEach((blob, d) => {
      const toks = index.modelTokens[d];
      const found = models.filter((m) => toks.has(m) || (m.length >= 6 && blob.includes(m)));
      if (found.length) {
        modelHits.set(d, found);
        scores.set(d, (scores.get(d) ?? 0) + 30 * found.length);
      }
    });
  }

  // ---- Brand adjustment + strength classification ----
  const genericProduct = new Set(["baby", "infant", "child", "children", "kid", "product", "set", "seat", "toy", "model"]);
  const results: Candidate[] = [];
  for (const [d, raw] of scores) {
    const brandMatch = !!brand && [...index.brandOf[d]].some(
        (b) => b === brand || ` ${b} `.includes(` ${brand} `) || ` ${brand} `.includes(` ${b} `),
      );
    const brandInTitle = !!brand && normalize(recalls[d].title).replace(/[^a-z0-9]+/g, " ").includes(brand);
    let score = raw;
    if (brand) score *= brandMatch || brandInTitle ? 1.9 : 0.5;

    const line = index.lineTokens[d];
    const lineOverlap = [...q.keys()].filter(
      (t) =>
        line.has(t) &&
        !t.split("_").some((p) => brandTokens.has(p)) &&
        !genericProduct.has(t) &&
        (q.get(t) ?? 0) >= 0.6 &&
        (index.df.get(t) ?? 0) < N * 0.03,
    );
    // Concept expansions may support a match but can't create one on their own.
    const anchored = lineOverlap.some((t) => (q.get(t) ?? 0) >= 1);
    if (!anchored) lineOverlap.length = 0;
    const bigramOverlap = lineOverlap.filter((t) => t.includes("_"));
    const model = modelHits.get(d);

    let strength: MatchStrength = "weak";
    if (model && (!brand || brandMatch || brandInTitle)) strength = "strong";
    else if (model) strength = "possible";
    else if ((brandMatch || brandInTitle) && (bigramOverlap.length >= 1 || lineOverlap.length >= 2)) strength = "strong";
    else if ((brandMatch || brandInTitle) && lineOverlap.length >= 1) strength = "possible";
    else if (!brand && lineOverlap.length >= 3 && bigramOverlap.length >= 1) strength = "possible";

    const signals: string[] = [];
    if (model) signals.push(`Identifier ${model.map((m) => m.toUpperCase()).join(", ")} appears in this recall`);
    if (brandMatch || brandInTitle) signals.push(`Same brand/recalling firm (${profile.brand})`);
    if (lineOverlap.length)
      signals.push(
        `Product terms in common: ${lineOverlap
          .slice(0, 5)
          .map((t) => t.replace(/_/g, " "))
          .join(", ")}`,
      );

    results.push({
      recall: recalls[d],
      score,
      phraseHits: bigramOverlap.length,
      strength,
      signals,
      checks: identifyingChecks(recalls[d]),
    });
  }

  results.sort((a, b) => rank(b) - rank(a));
  const top = results.slice(0, 40);
  const confident = top.filter((c) => c.strength !== "weak");
  const weak = top.filter((c) => c.strength === "weak" && c.score > 8).slice(0, confident.length ? 2 : 3);
  return [...confident, ...weak].slice(0, limit);
}

// Within a tier, the most serious hazards surface first: a recall tied to deaths outranks a cosmetic one.
function rank(c: Candidate) {
  const tier = c.strength === "strong" ? 2000 : c.strength === "possible" ? 1000 : 0;
  const text = `${c.recall.title} ${c.recall.injuries}`.toLowerCase();
  const severity = /\bdeaths?\b|\bdied\b|fatal/.test(text) ? 2.5 : /injur|burn|lacerat/.test(text) ? 1.2 : 1;
  // Exact product-line phrases ("rock play") dominate severity, so the named product comes first.
  return tier + Math.min(c.phraseHits ?? 0, 2) * 250 + Math.min(c.score * severity, 240);
}

/**
 * Turn a recall notice into the concrete things a buyer must verify on the physical item:
 * model/item numbers, date codes, lot codes, sale windows. Extracted from CPSC's own text.
 */
export function identifyingChecks(r: Recall): string[] {
  const checks: string[] = [];
  const models = r.products
    .map((p) => p.model)
    .filter((m) => m && !/^n\/?a$/i.test(m))
    .join("; ");
  if (models) checks.push(`Model / item numbers covered: ${models.length > 260 ? models.slice(0, 260) + "…" : models}`);

  const sentences = r.description.split(/(?<=[.!?])\s+(?=[A-Z])/);
  const cue = /(model|item|style|sku|upc|lot|date code|serial|manufactur|production|printed|label|sticker|stamped|tag)/i;
  for (const s of sentences) {
    if (checks.length >= 4) break;
    if (cue.test(s) && s.length < 420 && !checks.some((c) => c.includes(s.slice(0, 40)))) checks.push(s.trim());
  }
  const window = r.soldAt.match(/from\s+([A-Z][a-z]+\.?\s+\d{4}|\d{4})\s+(through|to|until)\s+([A-Z][a-z]+\.?\s+\d{4}|\d{4})/);
  if (window) checks.push(`Sold new between ${window[1]} and ${window[3]}`);
  return checks.slice(0, 4);
}
