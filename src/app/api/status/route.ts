import { connection } from "next/server";
import { getCorpus } from "@/lib/recalls";
import { aiAvailable, aiModelName } from "@/lib/ai";

export async function GET() {
  await connection();
  const corpus = await getCorpus();
  return Response.json({
    recalls: corpus.recalls.length,
    liveRecalls: corpus.liveCount,
    dataAsOf: corpus.dataAsOf,
    liveCheckedAt: corpus.liveCheckedAt,
    ai: aiAvailable() ? { enabled: true, model: aiModelName() } : { enabled: false },
  });
}
