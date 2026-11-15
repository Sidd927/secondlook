// Product categories that are illegal to sell in the U.S. regardless of brand or recall status.
// These are deterministic on purpose: a ban is a legal fact, not a probability.
import type { BanHit } from "./types";

interface BanRule {
  id: string;
  title: string;
  severity: BanHit["severity"];
  summary: string;
  law: string;
  sourceUrl: string;
  /** Matches if ANY pattern matches the normalized listing text. */
  any: RegExp[];
  /** Rule is skipped if any of these match (e.g. mesh liners are exempt from the bumper ban). */
  unless?: RegExp[];
}

const RULES: BanRule[] = [
  {
    id: "inclined-sleeper",
    title: "Inclined infant sleepers are banned",
    severity: "banned",
    summary:
      "Infant sleep products with a sleep surface inclined more than 10° are banned hazardous products. It is illegal to sell them, new or used, no matter when they were made. The Fisher-Price Rock 'n Play is the best-known example.",
    law: "Safe Sleep for Babies Act of 2022 (Pub. L. 117-126); CPSC final rule effective Sept. 15, 2023",
    sourceUrl:
      "https://www.cpsc.gov/Newsroom/News-Releases/2023/CPSC-Approves-Rules-Implementing-Bans-on-Inclined-Sleepers-for-Infants-and-Crib-Bumpers",
    any: [
      /\binclin\w*\s+(infant\s+|baby\s+)?sleep/,
      /\bsleep\w*\s+(at\s+an?\s+)?incline/,
      /\brock\s*(n|and)?\s*play\b/,
      /\brock\s+n\s+play\b/,
      /\bnap\s+nanny\b/,
      /\bsleeper\s*\/?\s*rocker\b|\brocker\s*\/?\s*sleeper\b|\brocking\s+sleeper\b/,
    ],
  },
  {
    id: "crib-bumper",
    title: "Padded crib bumpers are banned",
    severity: "banned",
    summary:
      "Padded crib bumpers, vinyl bumper guards and vertical slat covers are banned hazardous products. They cannot legally be sold. Non-padded mesh liners are not covered by the ban.",
    law: "Safe Sleep for Babies Act of 2022 (Pub. L. 117-126); CPSC final rule effective Sept. 15, 2023",
    sourceUrl:
      "https://www.cpsc.gov/Newsroom/News-Releases/2023/CPSC-Approves-Rules-Implementing-Bans-on-Inclined-Sleepers-for-Infants-and-Crib-Bumpers",
    any: [/\b(crib|cot|bed)\s+bumpers?\b/, /\bbumper\s+(pads?|set|guards?)\b/, /\bslat\s+covers?\b/, /\bbumpers?\b.*\bcrib\b/],
    unless: [/\bmesh\b/, /\bcar\b/, /\bpool\b/, /\bbumper\s+cars?\b/],
  },
  {
    id: "drop-side-crib",
    title: "Drop-side cribs are illegal to sell",
    severity: "banned",
    summary:
      "Since June 28, 2011, full-size and non-full-size cribs must meet federal standards that effectively ended drop-side designs. Selling, reselling or donating a crib that doesn't meet them is illegal. That includes garage sales and online listings.",
    law: "16 CFR parts 1219 and 1220 (crib safety standards, effective June 28, 2011)",
    sourceUrl: "https://www.cpsc.gov/Business--Manufacturing/Business-Education/Business-Guidance/Full-Size-Baby-Cribs",
    any: [/\bdrop\s*-?\s*side\b.*\bcrib\b/, /\bcrib\b.*\bdrop\s*-?\s*side\b/, /\bdropside\b/],
  },
  {
    id: "pre-2011-crib",
    title: "Cribs made before mid-2011 are likely illegal to resell",
    severity: "restricted",
    summary:
      "Cribs made before June 28, 2011 are very likely to fail the current federal crib standard, and selling a noncompliant crib is illegal. Ask the seller for the manufacture date printed on the crib's label.",
    law: "16 CFR parts 1219 and 1220 (crib safety standards, effective June 28, 2011)",
    sourceUrl: "https://www.cpsc.gov/Business--Manufacturing/Business-Education/Business-Guidance/Full-Size-Baby-Cribs",
    any: [/\bcrib\b.*\b(19[89]\d|200\d|2010)\b/, /\b(19[89]\d|200\d|2010)\b.*\bcrib\b/, /\bvintage\b.*\bcrib\b|\bcrib\b.*\bvintage\b|\bantique\b.*\bcrib\b/],
  },
  {
    id: "lawn-darts",
    title: "Lawn darts are banned",
    severity: "banned",
    summary:
      "Lawn darts with elongated tips were banned in 1988 after child deaths. Their sale is prohibited in the United States.",
    law: "16 CFR 1306 (Ban of Lawn Darts)",
    sourceUrl: "https://www.ecfr.gov/current/title-16/chapter-II/subchapter-B/part-1306",
    any: [/\blawn\s+darts?\b/, /\bjarts\b/, /\byard\s+darts?\b/],
  },
  {
    id: "infant-sleep-product",
    title: "Infant sleep products must meet a federal standard",
    severity: "restricted",
    summary:
      "Since 2022, any product marketed for infant sleep must meet the standard for a crib, bassinet, play yard or bedside sleeper. In-bed sleepers, baby nests and loungers marketed for sleep often do not. Consumer Reports found these on every major resale site in 2026. Don't use one for sleep.",
    law: "16 CFR 1236 (Infant Sleep Products, effective June 23, 2022)",
    sourceUrl: "https://www.ecfr.gov/current/title-16/chapter-II/subchapter-B/part-1236",
    any: [/\bin\s*-?\s*bed\s+sleeper\b/, /\bbaby\s+nest\b/, /\bdock\s*-?\s*a\s*-?\s*tot\b|\bdockatot\b/, /\bsnuggle\s+nest\b/, /\bco\s*-?\s*sleep(er|ing)?\s+(nest|pod|pillow)\b/, /\blounger\b.*\bsleep\b|\bsleep\b.*\blounger\b/],
  },
];

export function checkBans(text: string): BanHit[] {
  const t = text.toLowerCase().replace(/['’]/g, "").replace(/\s+/g, " ");
  const hits: BanHit[] = [];
  for (const r of RULES) {
    if (r.unless?.some((u) => u.test(t))) continue;
    const m = r.any.map((re) => t.match(re)).find(Boolean);
    if (!m) continue;
    hits.push({
      id: r.id,
      title: r.title,
      severity: r.severity,
      summary: r.summary,
      law: r.law,
      sourceUrl: r.sourceUrl,
      matched: m[0],
    });
  }
  // A drop-side crib finding supersedes the softer pre-2011 warning.
  if (hits.some((h) => h.id === "drop-side-crib")) return hits.filter((h) => h.id !== "pre-2011-crib");
  return hits;
}

export const BAN_RULES = RULES.map(({ id, title, severity, summary, law, sourceUrl }) => ({
  id,
  title,
  severity,
  summary,
  law,
  sourceUrl,
}));
