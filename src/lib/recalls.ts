// Recall corpus: a compact CPSC snapshot shipped with the app + a live delta fetched from the
// CPSC Recalls API at runtime, so results include recalls published after the last build.
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Recall, Snapshot } from "./types";
import { compactRecall } from "./compact.mjs";
import { bigrams, normalize, squash, tokenize } from "./text";

const LIVE_TTL_MS = 6 * 60 * 60 * 1000;
const CPSC_API = "https://www.saferproducts.gov/RestWebServices/Recall";

export interface Corpus {
  recalls: Recall[];
  liveCount: number;
  dataAsOf: string | null;
  liveCheckedAt: string | null;
  index: Index;
}

interface Index {
  docTf: Map<string, number>[];
  docLen: number[];
  avgLen: number;
  df: Map<string, number>;
  postings: Map<string, number[]>;
  brandOf: Set<string>[]; // normalized brand phrases per doc
  brandPhrases: Map<string, number>; // phrase -> doc count
  modelBlob: string[]; // squashed identifiers per doc
  modelTokens: Set<string>[]; // individual squashed identifier tokens per doc
  lineTokens: Set<string>[]; // tokens+bigrams from title & product names (the "product line")
}

const GENERIC_BRAND = new Set(
  "the baby kids home best pro smart company products group brands international usa america american global trading new life health sports outdoor toys toy little first".split(" "),
);

export function brandKey(s: string): string {
  return normalize(s)
    .replace(/\b(the|inc|llc|ltd|co|corp|corporation|company|international|intl|usa|us|products|group|brands|enterprises|industries|limited|of|and)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function firmFromTitle(title: string): string | null {
  const m = title.match(/^(.+?)\s+(Re-?announces|Recalls|Recall|Expands|Issues|Is Recalling|to Recall)\b/i);
  return m ? m[1] : null;
}

function addTerms(tf: Map<string, number>, terms: string[], w: number) {
  for (const t of terms) tf.set(t, (tf.get(t) ?? 0) + w);
}

function buildIndex(recalls: Recall[]): Index {
  const docTf: Map<string, number>[] = [];
  const docLen: number[] = [];
  const df = new Map<string, number>();
  const postings = new Map<string, number[]>();
  const brandOf: Set<string>[] = [];
  const brandPhrases = new Map<string, number>();
  const modelBlob: string[] = [];
  const modelTokens: Set<string>[] = [];
  const lineTokens: Set<string>[] = [];

  recalls.forEach((r, i) => {
    const tf = new Map<string, number>();
    const titleT = tokenize(r.title);
    const prodT = tokenize(r.products.map((p) => p.name).join(" | "));
    addTerms(tf, titleT, 3);
    addTerms(tf, bigrams(titleT), 3);
    addTerms(tf, prodT, 3);
    addTerms(tf, bigrams(prodT), 3);
    addTerms(tf, tokenize(r.products.map((p) => p.type).join(" ")), 2);
    addTerms(tf, tokenize(r.firms.join(" ")), 2);
    const descT = tokenize(r.description);
    addTerms(tf, descT, 1);
    addTerms(tf, bigrams(descT), 0.5);

    let len = 0;
    for (const [term, v] of tf) {
      len += v;
      df.set(term, (df.get(term) ?? 0) + 1);
      let p = postings.get(term);
      if (!p) postings.set(term, (p = []));
      p.push(i);
    }
    docTf.push(tf);
    docLen.push(len);

    const brands = new Set<string>();
    const licensed = [...`${r.title} ${r.description}`.matchAll(/([A-Z][\w&'’.-]*(?:\s[A-Z][\w&'’.-]*){0,2})[-\s][Bb]randed\b/g)].map((m) => m[1]);
    const underBrand = [...r.description.matchAll(/(?:under the|sold under)\s+([A-Z][\w&'’.-]*(?:\s[A-Z][\w&'’.-]*){0,2})\s+(?:brand|name|label)/g)].map((m) => m[1]);
    for (const f of [...r.firms, firmFromTitle(r.title) ?? "", ...licensed, ...underBrand]) {
      const k = brandKey(f);
      if (k.length >= 3 && !GENERIC_BRAND.has(k)) brands.add(k);
    }
    brandOf.push(brands);
    for (const b of brands) brandPhrases.set(b, (brandPhrases.get(b) ?? 0) + 1);

    modelBlob.push(
      squash(r.products.map((p) => p.model).join(" ")) + "|" + squash(r.description) + "|" + r.upcs.map(squash).join("|"),
    );
    const idSource = `${r.products.map((p) => p.model).join(" ")} ${r.description} ${r.upcs.join(" ")}`;
    modelTokens.push(new Set(idSource.split(/[\s,;:()/]+/).map(squash).filter((t) => t.length >= 4 && /\d/.test(t))));
    lineTokens.push(new Set([...titleT, ...bigrams(titleT), ...prodT, ...bigrams(prodT)]));
  });

  const avgLen = docLen.reduce((a, b) => a + b, 0) / Math.max(1, docLen.length);
  return { docTf, docLen, avgLen, df, postings, brandOf, brandPhrases, modelBlob, modelTokens, lineTokens };
}

async function loadSnapshot(): Promise<Snapshot> {
  const file = path.join(process.cwd(), "data", "recalls.json");
  return JSON.parse(await readFile(file, "utf8")) as Snapshot;
}

async function fetchLiveDelta(since: string): Promise<Recall[]> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 6000);
  try {
    const res = await fetch(`${CPSC_API}?format=json&RecallDateStart=${since}`, {
      signal: ctrl.signal,
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const raw = (await res.json()) as unknown[];
    return raw.map((r) => compactRecall(r) as Recall | null).filter((r): r is Recall => !!r && !!r.title);
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

const g = globalThis as unknown as {
  __slSnapshot?: Promise<Snapshot>;
  __slCorpus?: { corpus: Corpus; builtAt: number };
  __slBuilding?: Promise<Corpus>;
};

export async function getCorpus(): Promise<Corpus> {
  const cached = g.__slCorpus;
  if (cached && Date.now() - cached.builtAt < LIVE_TTL_MS) return cached.corpus;
  if (g.__slBuilding) return g.__slBuilding;

  g.__slBuilding = (async () => {
    g.__slSnapshot ??= loadSnapshot();
    const snap = await g.__slSnapshot;
    const since = snap.latestRecallDate ?? snap.since;
    const live = await fetchLiveDelta(since);
    const known = new Set(snap.recalls.map((r) => r.id));
    const fresh = live.filter((r) => !known.has(r.id));
    const recalls = [...fresh, ...snap.recalls];
    const latestLive = fresh.reduce<string | null>((m, r) => (!m || r.date > m ? r.date : m), null);
    const corpus: Corpus = {
      recalls,
      liveCount: fresh.length,
      dataAsOf: latestLive && latestLive > (since ?? "") ? latestLive : since,
      liveCheckedAt: live.length || fresh.length ? new Date().toISOString() : null,
      index: buildIndex(recalls),
    };
    g.__slCorpus = { corpus, builtAt: Date.now() };
    return corpus;
  })();

  try {
    return await g.__slBuilding;
  } finally {
    g.__slBuilding = undefined;
  }
}
