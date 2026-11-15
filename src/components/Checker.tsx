"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, Loader2, ScanText, X, ArrowRight } from "lucide-react";
import type { CheckResult } from "@/lib/types";
import { EXAMPLES } from "./examples";
import { ResultView } from "./ResultView";

type Status = { recalls: number; liveRecalls: number; dataAsOf: string | null; ai: { enabled: boolean; model?: string } };
type Photo = { url: string; data: string; mediaType: "image/jpeg"; name: string };

const STEPS = ["Reading the listing", "Checking federal sale bans", "Searching CPSC recalls", "Comparing candidates"];

async function downscale(file: File, max = 1400): Promise<Photo> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  const url = canvas.toDataURL("image/jpeg", 0.85);
  return { url, data: url.split(",")[1], mediaType: "image/jpeg", name: file.name };
}

export function Checker({ intro }: { intro: React.ReactNode }) {
  const [text, setText] = useState("");
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [ocr, setOcr] = useState<{ state: "idle" | "running" | "done" | "error"; progress: number; text?: string }>({
    state: "idle",
    progress: 0,
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/check")
      .then((r) => (r.ok ? r.json() : null))
      .then(setStatus)
      .catch(() => {});
  }, []);

  // Shareable checks: /?q=<listing> pre-fills and runs the check.
  const autoRan = useRef(false);
  useEffect(() => {
    if (autoRan.current) return;
    const q = new URLSearchParams(window.location.search).get("q");
    if (q && q.trim().length >= 3) {
      autoRan.current = true;
      setText(q);
      submitRef.current?.(q);
    }
  }, []);

  const runOcr = useCallback(async (file: File) => {
    setOcr({ state: "running", progress: 0 });
    try {
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("eng", 1, {
        logger: (m: { status: string; progress: number }) => {
          if (m.status === "recognizing text") setOcr((o) => ({ ...o, progress: m.progress }));
        },
      });
      const { data } = await worker.recognize(file);
      await worker.terminate();
      const cleaned = data.text.replace(/[^\S\n]+/g, " ").replace(/\n{2,}/g, "\n").trim();
      setOcr({ state: "done", progress: 1, text: cleaned });
    } catch {
      setOcr({ state: "error", progress: 0 });
    }
  }, []);

  const onFile = useCallback(
    async (file: File | undefined) => {
      if (!file) return;
      if (!/^image\//.test(file.type)) {
        setError("That file isn't an image. Try a JPG or PNG photo of the label or listing.");
        return;
      }
      setError(null);
      setPhoto(await downscale(file));
      runOcr(file);
    },
    [runOcr],
  );

  const submit = useCallback(
    async (override?: string) => {
      const listing = (override ?? text).trim();
      const ocrText = ocr.state === "done" && ocr.text ? ocr.text : "";
      const combined = [listing, ocrText && `Text read from photo:\n${ocrText}`].filter(Boolean).join("\n\n");
      if (combined.length < 3 && !photo) {
        setError("Paste a listing, describe the item, or add a photo of its label.");
        return;
      }
      setError(null);
      setLoading(true);
      setResult(null);
      setStep(0);
      const timers = [600, 1300, 2200].map((ms, i) => setTimeout(() => setStep(i + 1), ms));
      try {
        const res = await fetch("/api/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: combined,
            image: photo && status?.ai.enabled ? { data: photo.data, mediaType: photo.mediaType } : undefined,
          }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Check failed");
        setResult(json);
        if (listing) {
          const url = new URL(window.location.href);
          url.searchParams.set("q", listing);
          window.history.replaceState(null, "", url.toString());
        }
        requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      } finally {
        timers.forEach(clearTimeout);
        setLoading(false);
      }
    },
    [text, ocr, photo, status],
  );

  const submitRef = useRef<typeof submit | null>(null);
  submitRef.current = submit;

  return (
    <>
    <div className="grid gap-8 lg:grid-cols-[1fr_1.15fr] lg:gap-14">
      <div className="lg:pt-6">{intro}</div>
      <div id="check" className="scroll-mt-20">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="overflow-hidden rounded-xl border border-rule-strong bg-card shadow-[0_1px_0_rgba(21,19,15,0.04),0_12px_32px_-18px_rgba(21,19,15,0.25)]"
      >
        <div className="flex items-center justify-between border-b hairline px-4 py-2.5">
          <label htmlFor="listing" className="eyebrow !text-ink-2">
            Listing text
          </label>
          <span className="font-mono text-[11px] text-muted" aria-live="polite">
            {status ? `${status.recalls.toLocaleString()} recalls indexed` : "Loading recall index…"}
          </span>
        </div>
        <textarea
          id="listing"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
          }}
          rows={4}
          placeholder="Paste the listing from Facebook Marketplace, Craigslist or OfferUp. Or just type the brand and product, e.g. “Graco Pack n Play with bassinet”."
          className="block w-full resize-y bg-transparent px-4 py-3.5 text-[16px] leading-relaxed text-ink placeholder:text-muted/80 focus:outline-none"
        />

        {photo && (
          <div className="flex items-start gap-3 border-t hairline px-4 py-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.url} alt="Uploaded photo" className="h-16 w-16 rounded-md border hairline object-cover" />
            <div className="min-w-0 flex-1 text-[13px]">
              <p className="truncate font-medium text-ink">{photo.name}</p>
              {ocr.state === "running" && (
                <p className="mt-1 flex items-center gap-1.5 text-muted">
                  <ScanText className="h-3.5 w-3.5" aria-hidden /> Reading text on the label… {Math.round(ocr.progress * 100)}%
                </p>
              )}
              {ocr.state === "done" && (
                <p className="mt-1 line-clamp-2 text-muted">
                  <span className="text-ink-2">Read from photo:</span> {ocr.text || "No legible text found"}
                </p>
              )}
              {ocr.state === "error" && <p className="mt-1 text-muted">Couldn&apos;t read text from this photo.</p>}
              {status?.ai.enabled && <p className="mt-1 text-muted">The photo is also sent to the AI model to identify the product.</p>}
            </div>
            <button
              type="button"
              onClick={() => {
                setPhoto(null);
                setOcr({ state: "idle", progress: 0 });
              }}
              className="rounded p-1 text-muted hover:bg-paper-2 hover:text-ink"
              aria-label="Remove photo"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 border-t hairline bg-paper/50 px-3 py-2.5">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            id="photo"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
          <label
            htmlFor="photo"
            className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-rule-strong bg-card px-3 py-2 text-[14px] text-ink-2 hover:border-ink hover:text-ink"
          >
            <Camera className="h-4 w-4" aria-hidden /> {photo ? "Replace photo" : "Add label photo"}
          </label>
          <span className="hidden text-[12px] text-muted xl:inline">Label model numbers give the most precise match.</span>
          <button
            type="submit"
            disabled={loading || ocr.state === "running"}
            className="ml-auto inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-[14px] font-medium text-paper transition hover:bg-ink-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
            {loading ? "Checking…" : "Check listing"}
            {!loading && <ArrowRight className="h-4 w-4" aria-hidden />}
          </button>
        </div>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="eyebrow mr-1">Try</span>
        {EXAMPLES.map((ex) => (
          <button
            key={ex.label}
            type="button"
            onClick={() => {
              setText(ex.text);
              setPhoto(null);
              setOcr({ state: "idle", progress: 0 });
              submit(ex.text);
            }}
            className="rounded-full border border-rule-strong bg-card/60 px-3 py-1 text-[13px] text-ink-2 transition hover:border-ink hover:bg-card hover:text-ink"
          >
            {ex.label}
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-md border border-stop/30 bg-stop-bg px-4 py-3 text-[14px] text-stop-ink">
          {error}
        </p>
      )}

      </div>
    </div>
      <div ref={resultRef} className="scroll-mt-20">
        {loading && <Progress step={step} recalls={status?.recalls} ai={!!status?.ai.enabled} />}
        {result && !loading && <ResultView result={result} />}
      </div>
    </>
  );
}

function Progress({ step, recalls, ai }: { step: number; recalls?: number; ai: boolean }) {
  return (
    <div className="mt-8 rounded-xl border hairline bg-card p-5" aria-live="polite" aria-busy="true">
      <div className="relative mb-5 h-[3px] overflow-hidden rounded bg-paper-2">
        <div className="scanbar absolute inset-y-0 w-1/3 bg-ink" />
      </div>
      <ol className="grid gap-2.5 sm:grid-cols-4">
        {STEPS.map((s, i) => (
          <li key={s} className={`flex items-center gap-2 text-[13px] ${i <= step ? "text-ink" : "text-muted/70"}`}>
            <span
              className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border font-mono text-[10px] ${
                i < step ? "border-ink bg-ink text-paper" : i === step ? "border-ink" : "border-rule-strong"
              }`}
            >
              {i + 1}
            </span>
            {i === 2 && recalls ? `Searching ${recalls.toLocaleString()} recalls` : i === 3 && ai ? "AI comparing candidates" : s}
          </li>
        ))}
      </ol>
    </div>
  );
}
