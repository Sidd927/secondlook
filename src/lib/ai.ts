// Claude integration. Two narrow, structured calls:
//  1. understand — turn a messy listing (and optional photo of a label) into a product identity
//  2. adjudicate — compare that identity with retrieved CPSC recalls and say what must be verified
// The deterministic engine stays the source of truth for retrieval and bans; Claude never invents
// recalls, it only judges candidates the engine retrieved from CPSC data.
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import type { Candidate, ListingProfile } from "./types";
import { CONCEPTS } from "./taxonomy";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-5-5";

export function aiAvailable(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}
export function aiModelName(): string {
  return MODEL;
}

let client: Anthropic | null = null;
function getClient() {
  client ??= new Anthropic({ timeout: 25_000, maxRetries: 1 });
  return client;
}

const Understanding = z.object({
  brand: z.string().nullable().describe("Manufacturer/brand as printed, e.g. 'Fisher-Price'. null if unknown."),
  productType: z.string().nullable().describe("Plain generic product type, e.g. 'infant inclined sleeper'."),
  productLine: z
    .string()
    .nullable()
    .describe("Specific product line / official product name if identifiable, e.g. \"Rock 'n Play Sleeper\"."),
  modelNumbers: z.array(z.string()).describe("Model, item, SKU or UPC numbers visible in text or photo. Never guess."),
  approxYear: z.number().int().nullable().describe("Manufacture or purchase year if stated."),
  searchTerms: z
    .array(z.string())
    .describe("3-8 phrases a CPSC recall notice would use for this exact product (official names, category words)."),
  categories: z.array(z.string()).describe("Zero or more category ids from the provided list."),
});

const Adjudication = z.object({
  results: z.array(
    z.object({
      recallId: z.string(),
      verdict: z.enum(["same_product", "possibly_same", "different"]),
      reason: z.string().describe("One or two plain sentences a parent could understand."),
      checks: z
        .array(z.string())
        .describe(
          "Concrete things to verify on the physical item to confirm it is covered (model numbers, date codes, colors). Empty if the recall covers every unit of this product.",
        ),
    }),
  ),
});

const SYSTEM_UNDERSTAND = `You read secondhand marketplace listings (Facebook Marketplace, Craigslist, garage sales) and photos of product labels, and identify exactly what product is being sold so it can be checked against U.S. CPSC recalls.
Sellers often use vague or wrong names (a Fisher-Price Rock 'n Play may be listed as "baby sleeper/rocker" or "floor cradle"). Infer the most likely official product line when the description and photo support it, but put only identifiers you can actually see or read into modelNumbers.
Category ids you may use: ${CONCEPTS.map((c) => `${c.id} (${c.label})`).join(", ")}.`;

const SYSTEM_ADJUDICATE = `You compare a secondhand listing with candidate U.S. CPSC recall notices that a search engine retrieved. For each candidate, decide:
- same_product: the listing is the same product line from the same brand the recall covers (it may still be limited to certain model numbers/dates; list those in checks).
- possibly_same: plausible but the listing lacks the details to tell (e.g., brand unknown, or the brand recalled a similar product).
- different: a different product, brand or category.
Base every judgment only on the listing and the recall text provided. checks must quote or closely paraphrase identifying details from the recall text (model numbers, date codes, lot codes, colors, sale dates). Do not invent model numbers.`;

type ImageInput = { data: string; mediaType: "image/jpeg" | "image/png" | "image/webp" };

async function parse<T extends z.ZodType>(schema: T, system: string, content: Anthropic.Beta.BetaContentBlockParam[]) {
  const res = await getClient().beta.messages.parse({
    model: MODEL,
    max_tokens: 4000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "low", format: betaZodOutputFormat(schema) },
    system,
    messages: [{ role: "user", content }],
  });
  if (res.stop_reason === "refusal") throw new Error("The AI model declined this request");
  if (!res.parsed_output) throw new Error("The AI model returned an unreadable response");
  return res.parsed_output as z.infer<T>;
}

export async function aiUnderstand(text: string, image?: ImageInput) {
  const content: Anthropic.Beta.BetaContentBlockParam[] = [];
  if (image) content.push({ type: "image", source: { type: "base64", media_type: image.mediaType, data: image.data } });
  content.push({
    type: "text",
    text: `<listing>\n${text || "(no text — identify the product from the photo)"}\n</listing>`,
  });
  const out = await parse(Understanding, SYSTEM_UNDERSTAND, content);
  const valid = new Set(CONCEPTS.map((c) => c.id));
  return {
    ...out,
    modelNumbers: out.modelNumbers.map((m) => m.trim()).filter((m) => m.length >= 3).slice(0, 8),
    searchTerms: out.searchTerms.slice(0, 8),
    categories: out.categories.filter((c) => valid.has(c)),
  };
}

export async function aiAdjudicate(text: string, profile: ListingProfile, candidates: Candidate[]) {
  const recalls = candidates.map((c) => ({
    recallId: c.recall.id,
    date: c.recall.date,
    title: c.recall.title,
    products: c.recall.products.map((p) => ({ name: p.name, model: p.model.slice(0, 300) })),
    description: c.recall.description.slice(0, 900),
    soldAt: c.recall.soldAt.slice(0, 200),
  }));
  const out = await parse(Adjudication, SYSTEM_ADJUDICATE, [
    {
      type: "text",
      text: `<listing>\n${text}\n</listing>\n<identified_product>\n${JSON.stringify({
        brand: profile.brand,
        productType: profile.productType,
        productLine: profile.productLine,
        modelNumbers: profile.modelNumbers,
      })}\n</identified_product>\n<candidate_recalls>\n${JSON.stringify(recalls)}\n</candidate_recalls>`,
    },
  ]);
  const ids = new Set(candidates.map((c) => c.recall.id));
  const map = new Map<string, (typeof out.results)[number]>();
  for (const r of out.results) if (ids.has(r.recallId)) map.set(r.recallId, { ...r, checks: r.checks.slice(0, 4) });
  return map;
}
