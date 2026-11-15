import { runCheck } from "@/lib/check";
import { getCorpus } from "@/lib/recalls";
import { aiAvailable, aiModelName } from "@/lib/ai";
import { connection } from "next/server";
import { z } from "zod";

export const maxDuration = 60;

const Body = z.object({
  text: z.string().max(6000).default(""),
  image: z
    .object({
      data: z.string().max(7_000_000),
      mediaType: z.enum(["image/jpeg", "image/png", "image/webp"]),
    })
    .optional(),
});

// Simple per-instance rate limit so a public demo can't be used to burn the AI budget.
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 20;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (limited(ip)) {
    return Response.json({ error: "Too many checks in a minute. Please wait a moment and try again." }, { status: 429 });
  }
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return Response.json({ error: "Send a listing description or a photo to check." }, { status: 400 });
  }
  if (body.text.trim().length < 3 && !body.image) {
    return Response.json({ error: "Paste a listing or describe the item (brand, product, model) first." }, { status: 400 });
  }
  try {
    const result = await runCheck({ text: body.text.trim(), image: body.image });
    return Response.json(result);
  } catch (e) {
    console.error("check failed", e);
    return Response.json({ error: "Something went wrong while checking. Please try again." }, { status: 500 });
  }
}

// Status + warm-up: the page calls this on load so the same function instance that serves
// checks has already loaded the recall index and fetched the live CPSC delta.
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
