// Batch screening for thrift stores, donation drives and sellers: one item per line, rules engine only
// (deterministic, fast, no per-item AI cost). Each row returns a verdict and the top matching recall.
import { z } from "zod";
import { getCorpus } from "@/lib/recalls";
import { checkBans } from "@/lib/bans";
import { profileFromText, searchRecalls } from "@/lib/match";

const Body = z.object({ items: z.array(z.string().max(500)).min(1).max(200) });

export async function POST(req: Request) {
  let items: string[];
  try {
    items = Body.parse(await req.json()).items.map((s) => s.trim()).filter((s) => s.length >= 3);
  } catch {
    return Response.json({ error: "Send between 1 and 200 items, one per line." }, { status: 400 });
  }
  const t0 = Date.now();
  const corpus = await getCorpus();
  const rows = items.map((text) => {
    const profile = profileFromText(text, corpus);
    const bans = checkBans(text);
    const cands = searchRecalls(text, profile, corpus, 3).filter((c) => c.strength !== "weak");
    const top = cands[0];
    const modelHit = top?.strength === "strong" && top.signals.some((s) => s.startsWith("Identifier"));
    const verdict = bans.some((b) => b.severity === "banned") || modelHit ? "do_not_buy" : cands.length || bans.length ? "verify" : "no_recall_found";
    return {
      text,
      verdict,
      ban: bans[0] ? { title: bans[0].title, severity: bans[0].severity, url: bans[0].sourceUrl } : null,
      recall: top
        ? { id: top.recall.id, title: top.recall.title, url: top.recall.url, date: top.recall.date, strength: top.strength }
        : null,
      more: Math.max(0, cands.length - 1),
    };
  });
  return Response.json({ rows, recallsSearched: corpus.recalls.length, dataAsOf: corpus.dataAsOf, ms: Date.now() - t0 });
}
