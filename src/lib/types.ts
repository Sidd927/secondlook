export interface RecallProduct {
  name: string;
  model: string;
  type: string;
  units: string;
}

export interface Recall {
  id: string;
  date: string;
  title: string;
  url: string;
  description: string;
  products: RecallProduct[];
  hazard: string;
  remedy: string;
  remedyOptions: string[];
  contact: string;
  injuries: string;
  soldAt: string;
  image: string;
  firms: string[];
  upcs: string[];
}

export interface Snapshot {
  source: string;
  sourceUrl: string;
  generatedAt: string;
  since: string;
  latestRecallDate: string | null;
  count: number;
  recalls: Recall[];
}

/** What we understand about the item being sold. */
export interface ListingProfile {
  brand: string | null;
  productType: string | null;
  productLine: string | null;
  modelNumbers: string[];
  approxYear: number | null;
  searchTerms: string[];
  categories: string[]; // taxonomy concept ids
  source: "ai" | "rules";
}

export type MatchStrength = "strong" | "possible" | "weak";

export interface Candidate {
  recall: Recall;
  score: number;
  strength: MatchStrength;
  signals: string[]; // human-readable reasons this recall surfaced
  checks: string[]; // identifiers a buyer must verify on the physical item
  aiReason?: string;
  aiVerdict?: "same_product" | "possibly_same" | "different";
}

export type BanSeverity = "banned" | "restricted";

export interface BanHit {
  id: string;
  title: string;
  severity: BanSeverity;
  summary: string;
  law: string;
  sourceUrl: string;
  matched: string;
}

export type Verdict = "do_not_buy" | "verify" | "no_recall_found";

export interface CheckResult {
  verdict: Verdict;
  headline: string;
  explanation: string;
  profile: ListingProfile;
  bans: BanHit[];
  candidates: Candidate[];
  sellerQuestions: string[];
  sellerMessage: string;
  engine: {
    mode: "ai" | "rules";
    model?: string;
    aiError?: string;
    recallsSearched: number;
    liveRecalls: number;
    dataAsOf: string | null;
    ms: number;
  };
}
