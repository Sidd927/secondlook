import Link from "next/link";
import { Checker } from "@/components/Checker";

const FACTS = [
  {
    figure: "≈6%",
    text: "On average, that's the share of recalled products consumers actually return or get fixed. The rest stay in homes, and then get resold.",
    source: "CPSC Recall Effectiveness Workshop report, 2018",
    href: "https://www.cpsc.gov/s3fs-public/Recall_Effectiveness_Workshop_Report-2018.pdf",
  },
  {
    figure: "4 of 4",
    text: "Banned infant products Consumer Reports looked for (inclined sleepers, drop-side cribs, padded bumpers, in-bed sleepers) were all listed on Facebook Marketplace.",
    source: "Consumer Reports investigation, 2026",
    href: "https://www.consumerreports.org/babies-kids/how-to-avoid-unsafe-used-baby-gear-when-shopping-online-a7805010094/",
  },
  {
    figure: "≈75%",
    text: "Share of CPSC takedown requests for recalled products sent to Facebook Marketplace in 2022, according to members of Congress.",
    source: "NBC News, 2023",
    href: "https://www.nbcnews.com/business/consumer/recalled-products-linked-100-infant-deaths-still-sale-facebook-lawmake-rcna101169",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Understand the listing",
    body: "Sellers write “baby sleeper/rocker”, not “Rock 'n Play”. SecondLook maps listing slang to recall vocabulary and pulls out brands, model numbers and years. If you add a photo, it reads the label too.",
  },
  {
    n: "02",
    title: "Check federal sale bans",
    body: "Some products are illegal to sell no matter the brand, like inclined infant sleepers, padded crib bumpers and drop-side cribs. These are hard legal rules, applied deterministically.",
  },
  {
    n: "03",
    title: "Search every CPSC recall",
    body: "A ranked search across every CPSC recall since 2005, plus anything published since the last build, fetched live from the CPSC API. Exact model-number and UPC hits are weighted highest.",
  },
  {
    n: "04",
    title: "Tell you what to verify",
    body: "Most recalls cover specific model numbers or date codes. SecondLook pulls those out of the notice and writes the exact questions to send the seller before you pay.",
  },
];

export default function Home() {
  return (
    <>
      <section className="grain border-b hairline">
        <div className="mx-auto max-w-6xl px-5 pb-16 pt-14 sm:pt-20">
          <Checker
            intro={
              <>
                <p className="eyebrow">Pre-purchase safety check · U.S. CPSC data</p>
              <h1 className="serif mt-4 text-[52px] leading-[0.98] sm:text-[72px]">
                Look twice before you buy it <span className="italic">used.</span>
              </h1>
              <p className="mt-6 max-w-md text-[17px] leading-relaxed text-ink-2">
                Paste a Marketplace or Craigslist listing, or snap the label. SecondLook checks it against U.S. product recalls and
                federal sale bans, then tells you exactly what to ask the seller.
              </p>
              <ul className="mt-8 space-y-2.5 text-[14px] text-ink-2">
                <li className="flex gap-3">
                  <span className="mt-[9px] h-px w-5 bg-ink" aria-hidden /> Built for parents buying secondhand baby gear
                </li>
                <li className="flex gap-3">
                  <span className="mt-[9px] h-px w-5 bg-ink" aria-hidden /> Free, no account, nothing stored
                </li>
                <li className="flex gap-3">
                  <span className="mt-[9px] h-px w-5 bg-ink" aria-hidden /> Every result links to the official CPSC notice
                </li>
              </ul>
              </>
            }
          />
        </div>
      </section>

      <section aria-labelledby="why" className="mx-auto max-w-6xl px-5 py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_2fr]">
          <div>
            <p className="eyebrow">The problem</p>
            <h2 id="why" className="serif mt-3 text-[40px] leading-[1.05]">
              A recall stops new sales. It doesn&apos;t stop resales.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-ink-2">
              Federal law already prohibits selling recalled products. But the check happens nowhere: not when the seller lists it,
              not when the buyer pays. The official database expects you to know the exact product name and model number. Secondhand
              listings rarely have either.
            </p>
          </div>
          <div className="grid gap-px overflow-hidden rounded-xl border hairline bg-rule sm:grid-cols-3">
            {FACTS.map((f) => (
              <figure key={f.figure} className="flex flex-col bg-card p-6">
                <p className="serif text-[48px] leading-none">{f.figure}</p>
                <blockquote className="mt-4 flex-1 text-[14px] leading-relaxed text-ink-2">{f.text}</blockquote>
                <figcaption className="mt-5 text-[12px] text-muted">
                  <a href={f.href} target="_blank" rel="noreferrer" className="underline decoration-rule-strong underline-offset-4 hover:text-ink">
                    {f.source}
                  </a>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="how" className="border-y hairline bg-paper-2/50">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">How it works</p>
              <h2 id="how" className="serif mt-3 text-[40px] leading-[1.05]">
                Four checks in about a second.
              </h2>
            </div>
            <Link href="/how-it-works" className="text-[14px] underline decoration-rule-strong underline-offset-4 hover:decoration-ink">
              Methodology, sources &amp; limits →
            </Link>
          </div>
          <ol className="mt-10 grid gap-px overflow-hidden rounded-xl border hairline bg-rule md:grid-cols-4">
            {STEPS.map((s) => (
              <li key={s.n} className="bg-card p-6">
                <p className="font-mono text-[12px] text-muted">{s.n}</p>
                <h3 className="mt-3 text-[17px] font-semibold">{s.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-ink-2">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="who" className="mx-auto max-w-6xl px-5 py-20">
        <p className="eyebrow">Who it&apos;s for</p>
        <h2 id="who" className="serif mt-3 max-w-2xl text-[40px] leading-[1.05]">
          Anyone about to hand over cash for something used.
        </h2>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          <div className="border-t-2 border-ink pt-5">
            <h3 className="text-[17px] font-semibold">Parents &amp; caregivers</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-2">
              Used cribs, swings and car seats save families hundreds of dollars. Check the listing from your phone before you drive
              over to pick it up.
            </p>
          </div>
          <div className="border-t-2 border-ink pt-5">
            <h3 className="text-[17px] font-semibold">Sellers, thrift stores &amp; donation drives</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-2">
              Reselling a recalled product is illegal. Paste a whole intake list into{" "}
              <Link href="/batch" className="underline underline-offset-4">
                Batch check
              </Link>{" "}
              and get a flag for every item.
            </p>
          </div>
          <div className="border-t-2 border-ink pt-5">
            <h3 className="text-[17px] font-semibold">Anyone who already owns it</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-2">
              Every match includes the remedy (refund, repair or replacement) and how to contact the company, straight from the
              recall notice.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
