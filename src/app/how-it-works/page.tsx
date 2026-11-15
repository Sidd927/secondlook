import type { Metadata } from "next";
import Link from "next/link";
import { BAN_RULES } from "@/lib/bans";

export const metadata: Metadata = {
  title: "How it works: SecondLook",
  description: "SecondLook's data sources, matching method, use of AI, and limitations.",
};

function Section({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="grid gap-6 border-t hairline py-12 lg:grid-cols-[280px_1fr]">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 id={id} className="serif mt-2 text-[32px] leading-[1.05]">
          {title}
        </h2>
      </div>
      <div className="max-w-3xl space-y-4 text-[15px] leading-relaxed text-ink-2">{children}</div>
    </section>
  );
}

export default function HowItWorks() {
  return (
    <div className="mx-auto max-w-6xl px-5 pt-14">
      <p className="eyebrow">Methodology</p>
      <h1 className="serif mt-3 max-w-3xl text-[52px] leading-[1.02] sm:text-[64px]">How SecondLook decides.</h1>
      <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-ink-2">
        Every verdict comes from public federal data and published law. Hard rules decide what can be decided with certainty. Ranked
        search finds candidate recalls, and an optional AI step reads messy listings and photos. You can always see which of them
        produced a result.
      </p>

      <div className="mt-12">
        <Section id="data" eyebrow="01 · Data" title="Every CPSC recall since 2005, kept current">
          <p>
            The recall corpus comes from the U.S. Consumer Product Safety Commission&apos;s public{" "}
            <a className="underline underline-offset-4" href="https://www.saferproducts.gov/RestWebServices">
              Recalls REST API
            </a>
            . A compact snapshot ships with the app, about 7,200 recalls with titles, product names, model numbers, hazards, remedies,
            injuries and retailer information. At runtime the server asks the same API for anything published after the snapshot and
            merges it in. That refreshes every six hours, so a recall announced this week is searchable today.
          </p>
          <p>
            There's no account and no application database: SecondLook doesn't save the listings you check. The server briefly holds
            rate-limit data (IP address and request times) in memory, errors go to the hosting provider's logs, and a shareable link
            carries the listing text in its URL. Label photos are read in your browser. With the AI step off, as in this deployment,
            they aren't uploaded.
          </p>
        </Section>

        <Section id="bans" eyebrow="02 · Law" title="Federal sale bans, applied as rules">
          <p>
            Some products can&apos;t legally be sold at all, regardless of brand or recall status. These checks are deterministic because a
            ban is a legal fact, not a probability.
          </p>
          <ul className="divide-y divide-rule overflow-hidden rounded-xl border hairline bg-card">
            {BAN_RULES.map((b) => (
              <li key={b.id} className="px-5 py-4">
                <p className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-ink">{b.title}</span>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[11px] ${
                      b.severity === "banned" ? "border-stop/30 bg-stop-bg text-stop-ink" : "border-caution/30 bg-caution-bg text-caution-ink"
                    }`}
                  >
                    {b.severity === "banned" ? "Banned" : "Standard: verify"}
                  </span>
                </p>
                <p className="mt-1 text-[14px]">{b.summary}</p>
                <p className="mt-1 text-[12px] text-muted">
                  {b.law} ·{" "}
                  <a className="underline underline-offset-4" href={b.sourceUrl}>
                    source
                  </a>
                </p>
              </li>
            ))}
          </ul>
          <p>
            Selling any recalled consumer product is also prohibited under Section 19 of the Consumer Product Safety Act (15 U.S.C.
            § 2068).
          </p>
        </Section>

        <Section id="matching" eyebrow="03 · Matching" title="Bridging how people list and how recalls are written">
          <p>
            Consumer Reports found recalled Rock &apos;n Play sleepers listed as “baby sleeper/rocker”, “floor cradle” and “bassinet”. The
            official search expects the exact product name. SecondLook closes that gap in four layers:
          </p>
          <ol className="list-decimal space-y-2 pl-5">
            <li>
              <span className="font-medium text-ink">Vocabulary bridge.</span> A taxonomy of 23 product concepts maps listing language
              (“pack n play”, “sleeper/rocker”, “dresser”) to the vocabulary recall notices use (“play yard”, “inclined sleeper”, “chest”,
              “tip-over”).
            </li>
            <li>
              <span className="font-medium text-ink">Ranked retrieval.</span> Field-weighted BM25 over titles, product names, product
              types, firms and descriptions, including two-word phrases, so “Rock &apos;n Play” beats a generic “play”.
            </li>
            <li>
              <span className="font-medium text-ink">Brand resolution.</span> Brands are resolved against recalling firms and licensed
              brand names (“Sharper Image-branded… by Allstar”). A brand mismatch heavily discounts a candidate.
            </li>
            <li>
              <span className="font-medium text-ink">Exact identifiers.</span> Model numbers and UPCs from the listing or label photo are
              matched against the recall&apos;s identifiers. An exact hit from the same brand is the strongest signal there is.
            </li>
          </ol>
          <p>
            Each candidate is graded <em>strong</em>, <em>possible</em> or <em>weak</em>. The interface shows why each one matched, and
            pulls the identifying details (model numbers, date codes, sale windows) out of the notice so you know what to ask the seller.
          </p>
        </Section>

        <Section id="ai" eyebrow="04 · AI" title="Where AI helps, and where it isn't allowed to decide">
          <p>When an Anthropic API key is configured, Claude handles two narrow, structured steps:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <span className="font-medium text-ink">Understanding.</span> It reads the listing (and the label photo, if any) and returns
              the brand, likely official product line, visible model numbers, and the phrases a recall notice would use. This feeds the
              search; it doesn&apos;t replace it.
            </li>
            <li>
              <span className="font-medium text-ink">Adjudication.</span> It compares the listing with the recalls the engine retrieved and
              explains, in plain language, whether each is the same product and what to check on the physical item.
            </li>
          </ul>
          <p>
            Claude never invents recalls: it can only judge candidates retrieved from CPSC data, and responses are schema-validated.
            Federal bans are never decided by the model. If AI is unavailable, the rules engine still produces a complete result, and
            every result is labeled with the engine that produced it.
          </p>
          <p>
            Without a photo-capable AI step, label photos are still read: text recognition runs entirely in your browser (Tesseract.js),
            so the photo never leaves your device.
          </p>
        </Section>

        <Section id="limits" eyebrow="05 · Limits" title="What SecondLook can't tell you">
          <ul className="list-disc space-y-2 pl-5">
            <li>“No matching recall found” is not a safety certification. Listings are often incomplete, and some unsafe products were never recalled.</li>
            <li>The corpus covers CPSC consumer-product recalls since 2005. Vehicles and car seats with NHTSA campaigns, food, drugs and cosmetics are outside it.</li>
            <li>Most recalls cover specific model numbers or production dates. A strong match means “confirm with the seller”, not “definitely recalled”, unless the identifiers match.</li>
            <li>SecondLook is independent and isn&apos;t affiliated with the CPSC. Always confirm on the official notice linked in each result.</li>
          </ul>
          <p>
            <Link href="/#check" className="font-medium text-ink underline underline-offset-4">
              Check a listing →
            </Link>
          </p>
        </Section>
      </div>
    </div>
  );
}
