// Builds the compact CPSC recall snapshot shipped with the app (data/recalls.json).
// Source: CPSC Recalls REST API (public, no key) — https://www.saferproducts.gov/RestWebServices
// Usage: node scripts/sync-cpsc.mjs [startDate=2005-01-01]
import { writeFile, mkdir } from "node:fs/promises";
import { compactRecall } from "../src/lib/compact.mjs";

const start = process.argv[2] ?? "2005-01-01";
const url = `https://www.saferproducts.gov/RestWebServices/Recall?format=json&RecallDateStart=${start}`;

console.log(`Fetching ${url}`);
const res = await fetch(url, { headers: { Accept: "application/json" } });
if (!res.ok) throw new Error(`CPSC API returned ${res.status}`);
const raw = await res.json();

const recalls = raw
  .map(compactRecall)
  .filter((r) => r && r.title)
  .sort((a, b) => b.date.localeCompare(a.date));

const snapshot = {
  source: "U.S. Consumer Product Safety Commission — Recalls REST API",
  sourceUrl: "https://www.saferproducts.gov/RestWebServices/Recall",
  generatedAt: new Date().toISOString(),
  since: start,
  latestRecallDate: recalls[0]?.date ?? null,
  count: recalls.length,
  recalls,
};

await mkdir("data", { recursive: true });
await writeFile("data/recalls.json", JSON.stringify(snapshot));
console.log(`Wrote ${recalls.length} recalls (latest ${snapshot.latestRecallDate}).`);
