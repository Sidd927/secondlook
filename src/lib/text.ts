// Tokenization and identifier extraction tuned for product-recall language.

const STOP = new Set(
  `a an and are as at be been but by for from has have in into is it its of on or that the this to was were will with
   recall recalls recalled due risk hazard hazards pose poses posing serious injury injuries consumers consumer
   about units sold also inc llc co ltd corp company announce announces reannounce reannounces after deaths death
   reports report following because can may could include includes including new used like good great condition
   excellent works working price obo firm pick pickup only cash please message dm local barely gently clean smoke
   free pet home must sell selling sale asking`.split(/\s+/),
);

export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['’`]/g, "")
    .replace(/&/g, " and ");
}

function stem(t: string): string {
  if (t.length <= 3 || /\d/.test(t)) return t;
  if (t.endsWith("ies") && t.length > 4) return t.slice(0, -3) + "y";
  if (/(ches|shes|sses|xes)$/.test(t)) return t.slice(0, -2);
  if (t.endsWith("s") && !t.endsWith("ss") && !t.endsWith("us")) return t.slice(0, -1);
  return t;
}

export function tokenize(s: string): string[] {
  const out: string[] = [];
  for (const raw of normalize(s).split(/[^a-z0-9]+/)) {
    if (!raw || raw.length < 2 || STOP.has(raw)) continue;
    if (/^\d+$/.test(raw) && raw.length < 3) continue;
    out.push(stem(raw));
  }
  return out;
}

export function bigrams(tokens: string[]): string[] {
  const out: string[] = [];
  for (let i = 0; i < tokens.length - 1; i++) out.push(`${tokens[i]}_${tokens[i + 1]}`);
  return out;
}

/** Collapse an identifier so "BJD-45", "bjd 45" and "BJD45" compare equal. */
export function squash(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Pull model-number-like identifiers out of free text: mixed letter+digit tokens
 * (CHP55, FHJ-2000, X6178) and long digit runs (UPCs, 5+ digit item numbers).
 */
export function extractModelNumbers(text: string): string[] {
  const found = new Set<string>();
  const re = /\b([A-Z]{0,6}[-\s]?\d{2,}[A-Z0-9-]*|[A-Z]{1,6}\d+[A-Z0-9-]*|\d{5,14})\b/gi;
  for (const m of text.matchAll(re)) {
    const v = m[1].trim();
    const sq = squash(v);
    if (sq.length < 4) continue;
    if (/^(19|20)\d{2}$/.test(sq)) continue; // years
    if (!/[a-z]/i.test(sq) && sq.length < 5) continue;
    if (/^\d+(mm|cm|in|lb|lbs|oz|kg|ft|ml|w|v|mah)$/i.test(sq)) continue;
    found.add(v.toUpperCase().replace(/\s+/g, ""));
  }
  return [...found].slice(0, 12);
}

export function extractYear(text: string): number | null {
  const m = text.match(/\b(19[89]\d|20[0-2]\d)\b/);
  return m ? Number(m[1]) : null;
}
