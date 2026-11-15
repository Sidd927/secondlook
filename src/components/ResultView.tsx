"use client";

import { useState } from "react";
import { AlertOctagon, AlertTriangle, CheckCircle2, Copy, Check, ExternalLink, Gavel, Sparkles, Cpu } from "lucide-react";
import type { Candidate, CheckResult } from "@/lib/types";

const VERDICT = {
  do_not_buy: { Icon: AlertOctagon, bar: "bg-stop", bg: "bg-stop-bg", ink: "text-stop-ink", tag: "Do not buy" },
  verify: { Icon: AlertTriangle, bar: "bg-caution", bg: "bg-caution-bg", ink: "text-caution-ink", tag: "Verify first" },
  no_recall_found: { Icon: CheckCircle2, bar: "bg-clear", bg: "bg-clear-bg", ink: "text-clear-ink", tag: "No match" },
} as const;

function fmtDate(d: string | null) {
  if (!d) return "";
  return new Date(d + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function ResultView({ result }: { result: CheckResult }) {
  const v = VERDICT[result.verdict];
  const relevant = result.candidates.filter((c) => c.strength !== "weak");
  const similar = result.candidates.filter((c) => c.strength === "weak");
  const p = result.profile;

  return (
    <section aria-label="Check result" className="rise mt-8 space-y-6">
      {/* Verdict */}
      <div className={`relative overflow-hidden rounded-xl border hairline ${v.bg}`}>
        <div className={`absolute inset-y-0 left-0 w-1.5 ${v.bar}`} aria-hidden />
        <div className="px-6 py-6 pl-8 sm:px-8 sm:pl-10">
          <p className={`flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] ${v.ink}`}>
            <v.Icon className="h-4 w-4" aria-hidden /> {v.tag}
          </p>
          <h2 className={`serif mt-2 text-[34px] leading-[1.05] sm:text-[44px] ${v.ink}`}>{result.headline}</h2>
          <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-ink-2">{result.explanation}</p>
          <EngineLine result={result} />
        </div>
      </div>

      {/* What we understood */}
      <div className="grid gap-px overflow-hidden rounded-xl border hairline bg-rule sm:grid-cols-4">
        <Fact label="Brand" value={p.brand ? titleCase(p.brand) : "Not identified"} muted={!p.brand} />
        <Fact label="Product" value={p.productLine ?? p.productType ?? "Not identified"} muted={!p.productLine && !p.productType} />
        <Fact label="Model / UPC" value={p.modelNumbers.length ? p.modelNumbers.join(", ") : "None given"} muted={!p.modelNumbers.length} mono />
        <Fact label="Understood by" value={p.source === "ai" ? "AI + rules" : "Rules engine"} />
      </div>

      {/* Bans */}
      {result.bans.map((b) => (
        <div key={b.id} className="rounded-xl border border-stop/25 bg-card p-6">
          <div className="flex items-start gap-3">
            <Gavel className={`mt-1 h-5 w-5 shrink-0 ${b.severity === "banned" ? "text-stop" : "text-caution"}`} aria-hidden />
            <div className="space-y-2">
              <p className="eyebrow">{b.severity === "banned" ? "Federal ban" : "Federal standard"}</p>
              <h3 className="text-[19px] font-semibold leading-snug">{b.title}</h3>
              <p className="max-w-3xl text-[15px] leading-relaxed text-ink-2">{b.summary}</p>
              <p className="text-[13px] text-muted">
                {b.law} ·{" "}
                <a href={b.sourceUrl} target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-ink">
                  Source
                </a>{" "}
                · matched “{b.matched}”
              </p>
            </div>
          </div>
        </div>
      ))}

      {/* Seller message */}
      {result.verdict !== "do_not_buy" && relevant.length > 0 && <SellerMessage message={result.sellerMessage} />}

      {/* Candidates */}
      {relevant.length > 0 && (
        <div className="space-y-4">
          <h3 className="eyebrow">
            {relevant.length} matching recall{relevant.length > 1 ? "s" : ""} from CPSC
          </h3>
          {relevant.map((c, i) => (
            <RecallCard key={c.recall.id} c={c} defaultOpen={i === 0} />
          ))}
        </div>
      )}

      {result.verdict === "do_not_buy" && relevant.length > 0 && (
        <OwnerNote c={relevant[0]} />
      )}

      {similar.length > 0 && (
        <details className="group rounded-xl border hairline bg-card/60 px-5 py-4">
          <summary className="cursor-pointer list-none text-[14px] text-ink-2 marker:hidden">
            <span className="underline decoration-rule-strong underline-offset-4 group-open:no-underline">
              {similar.length} similar recall{similar.length > 1 ? "s" : ""} that probably aren&apos;t this item
            </span>
          </summary>
          <ul className="mt-3 space-y-2 text-[14px]">
            {similar.map((c) => (
              <li key={c.recall.id} className="flex gap-3">
                <span className="w-24 shrink-0 font-mono text-[12px] text-muted">{fmtDate(c.recall.date)}</span>
                <a href={c.recall.url} target="_blank" rel="noreferrer" className="text-ink-2 hover:text-ink hover:underline">
                  {c.recall.title}
                </a>
              </li>
            ))}
          </ul>
        </details>
      )}

      {result.verdict === "no_recall_found" && (
        <div className="rounded-xl border hairline bg-card p-6 text-[15px] leading-relaxed text-ink-2">
          <p className="font-medium text-ink">Before you buy anyway:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Ask for a photo of the label with the model number and date, then check it here again.</li>
            <li>Skip anything for infant sleep that has extra padding, an incline, or missing parts.</li>
            <li>Inspect in person: no cracks, loose hardware, frayed straps or missing pieces.</li>
          </ul>
        </div>
      )}
    </section>
  );
}

function EngineLine({ result }: { result: CheckResult }) {
  const e = result.engine;
  return (
    <p className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-muted">
      <span className="inline-flex items-center gap-1">
        {e.mode === "ai" ? <Sparkles className="h-3 w-3" aria-hidden /> : <Cpu className="h-3 w-3" aria-hidden />}
        {e.mode === "ai" ? `AI-assisted (${e.model})` : "Rules engine (AI off)"}
      </span>
      <span>{e.recallsSearched.toLocaleString()} CPSC recalls searched</span>
      {e.dataAsOf && <span>data through {fmtDate(e.dataAsOf)}</span>}
      {e.liveRecalls > 0 && <span>{e.liveRecalls} fetched live</span>}
      <span>{e.ms} ms</span>
      {e.aiError && <span className="text-caution-ink">AI unavailable, rules-only result</span>}
    </p>
  );
}

function Fact({ label, value, muted, mono }: { label: string; value: string; muted?: boolean; mono?: boolean }) {
  return (
    <div className="bg-card px-4 py-3">
      <p className="eyebrow">{label}</p>
      <p className={`mt-1 truncate text-[15px] ${muted ? "text-muted" : "text-ink"} ${mono ? "font-mono text-[13px]" : ""}`} title={value}>
        {value}
      </p>
    </div>
  );
}

const STRENGTH = {
  strong: { label: "Strong match", cls: "border-stop/30 bg-stop-bg text-stop-ink" },
  possible: { label: "Possible match", cls: "border-caution/30 bg-caution-bg text-caution-ink" },
  weak: { label: "Weak", cls: "border-rule bg-paper-2 text-muted" },
};

function RecallCard({ c, defaultOpen }: { c: Candidate; defaultOpen: boolean }) {
  const r = c.recall;
  const s = STRENGTH[c.strength];
  const units = r.products.map((p) => p.units).find(Boolean);
  return (
    <article className="overflow-hidden rounded-xl border hairline bg-card">
      <div className="grid gap-0 sm:grid-cols-[180px_1fr]">
        <div className="relative hidden border-r hairline bg-paper-2 sm:block">
          {r.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={r.image} alt={`Recalled product: ${r.products[0]?.name ?? r.title}`} className="h-full max-h-64 w-full object-cover" loading="lazy" />
          ) : (
            <div className="grid h-full place-items-center p-6 text-center text-[12px] text-muted">No image in notice</div>
          )}
        </div>
        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2 text-[12px]">
            <span className={`rounded-full border px-2.5 py-0.5 font-medium ${s.cls}`}>{s.label}</span>
            <span className="font-mono text-muted">Recall #{r.id}</span>
            <span className="font-mono text-muted">{fmtDate(r.date)}</span>
            {units && <span className="font-mono text-muted">{units} units</span>}
          </div>
          <h4 className="mt-2.5 text-[18px] font-semibold leading-snug">
            <a href={r.url} target="_blank" rel="noreferrer" className="hover:underline">
              {r.title}
              <ExternalLink className="ml-1.5 inline h-3.5 w-3.5 -translate-y-0.5 text-muted" aria-label="(opens cpsc.gov)" />
            </a>
          </h4>
          {r.hazard && <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{r.hazard}</p>}
          {r.injuries && <p className="mt-2 text-[14px] leading-relaxed text-stop-ink">{r.injuries}</p>}

          {c.aiReason && (
            <p className="mt-3 flex gap-2 rounded-md bg-paper px-3 py-2 text-[14px] text-ink-2">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden />
              <span>
                <span className="font-medium text-ink">AI assessment:</span> {c.aiReason}
              </span>
            </p>
          )}

          <details className="mt-4 group" open={defaultOpen}>
            <summary className="cursor-pointer text-[14px] font-medium text-ink marker:text-muted">How to tell if this item is covered</summary>
            <div className="mt-3 space-y-4 text-[14px] leading-relaxed text-ink-2">
              {c.checks.length > 0 ? (
                <ul className="space-y-2">
                  {c.checks.map((k, i) => (
                    <li key={i} className="flex gap-2.5">
                      <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-ink" aria-hidden />
                      <span>{k}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>The notice doesn&apos;t limit the recall to specific model numbers. It appears to cover every unit of this product.</p>
              )}
              {c.signals.length > 0 && (
                <div>
                  <p className="eyebrow mb-1">Why this matched</p>
                  <p className="text-muted">{c.signals.join(" · ")}</p>
                </div>
              )}
              {r.remedy && (
                <div>
                  <p className="eyebrow mb-1">If you already own it</p>
                  <p>{r.remedy}</p>
                  {r.contact && <p className="mt-1 text-muted">{r.contact}</p>}
                </div>
              )}
            </div>
          </details>
        </div>
      </div>
    </article>
  );
}

function SellerMessage({ message }: { message: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="rounded-xl border border-ink/80 bg-card">
      <div className="flex items-center justify-between border-b hairline px-5 py-3">
        <div>
          <p className="text-[15px] font-semibold">Message the seller before you pay</p>
          <p className="text-[13px] text-muted">These questions are built from the recall notices below. Copy and paste them into your chat.</p>
        </div>
        <button
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(message);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
          }}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-rule-strong px-3 py-1.5 text-[13px] hover:border-ink"
        >
          {copied ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="whitespace-pre-wrap px-5 py-4 font-sans text-[14px] leading-relaxed text-ink-2">{message}</pre>
    </div>
  );
}

function OwnerNote({ c }: { c: Candidate }) {
  return (
    <div className="rounded-xl border hairline bg-paper-2/60 p-6 text-[14px] leading-relaxed text-ink-2">
      <p className="font-medium text-ink">Already have one at home? Or are you the seller?</p>
      <p className="mt-1">
        Stop using it and don&apos;t pass it on. Selling or giving away a recalled product is illegal under the Consumer Product Safety Act (15 U.S.C.
        § 2068). {c.recall.remedyOptions.length > 0 && <>This recall offers: {c.recall.remedyOptions.join(", ").toLowerCase()}. </>}
        <a href={c.recall.url} target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-ink">
          Read the full notice on cpsc.gov
        </a>
        .
      </p>
    </div>
  );
}

function titleCase(s: string) {
  return s.replace(/\b\w/g, (m) => m.toUpperCase());
}
