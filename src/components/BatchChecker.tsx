"use client";

import { useMemo, useState } from "react";
import { Download, Loader2 } from "lucide-react";

type Row = {
  text: string;
  verdict: "do_not_buy" | "verify" | "no_recall_found";
  ban: { title: string; severity: string; url: string } | null;
  recall: { id: string; title: string; url: string; date: string; strength: string } | null;
  more: number;
};

const SAMPLE = `Graco Pack n Play playard with bassinet
IKEA MALM 3 drawer chest
Fisher-Price Rock n Play sleeper
Boppy newborn lounger
Peloton Tread
Kids Trek bike 20 inch
Padded crib bumper set
Instant Pot Duo 6 qt
4moms mamaRoo swing
Little Tikes Cozy Coupe
Hoverboard self balancing scooter
Lawn darts set vintage`;

const LABEL = {
  do_not_buy: { text: "Don't sell", cls: "bg-stop-bg text-stop-ink border-stop/30" },
  verify: { text: "Verify", cls: "bg-caution-bg text-caution-ink border-caution/30" },
  no_recall_found: { text: "No match", cls: "bg-clear-bg text-clear-ink border-clear/30" },
};

export function BatchChecker() {
  const [input, setInput] = useState("");
  const [rows, setRows] = useState<Row[] | null>(null);
  const [meta, setMeta] = useState<{ recallsSearched: number; ms: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c = { do_not_buy: 0, verify: 0, no_recall_found: 0 };
    rows?.forEach((r) => c[r.verdict]++);
    return c;
  }, [rows]);

  async function run(text = input) {
    const items = text.split("\n").map((s) => s.trim()).filter(Boolean).slice(0, 200);
    if (!items.length) {
      setError("Add at least one item, one per line.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      const order = { do_not_buy: 0, verify: 1, no_recall_found: 2 };
      setRows([...json.rows].sort((a: Row, b: Row) => order[a.verdict] - order[b.verdict]));
      setMeta({ recallsSearched: json.recallsSearched, ms: json.ms });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Batch check failed.");
    } finally {
      setLoading(false);
    }
  }

  function exportCsv() {
    if (!rows) return;
    const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
    const lines = [
      "item,verdict,ban,recall_title,recall_url,recall_date",
      ...rows.map((r) =>
        [r.text, LABEL[r.verdict].text, r.ban?.title ?? "", r.recall?.title ?? "", r.recall?.url ?? "", r.recall?.date ?? ""].map(esc).join(","),
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "secondlook-batch.csv";
    a.click();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,380px)_1fr]">
      <div>
        <div className="overflow-hidden rounded-xl border border-rule-strong bg-card">
          <div className="flex items-center justify-between border-b hairline px-4 py-2.5">
            <label htmlFor="items" className="eyebrow !text-ink-2">
              Items, one per line
            </label>
            <button
              type="button"
              onClick={() => {
                setInput(SAMPLE);
                run(SAMPLE);
              }}
              className="text-[12px] text-ink-2 underline underline-offset-4 hover:text-ink"
            >
              Load sample intake list
            </button>
          </div>
          <textarea
            id="items"
            rows={14}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={"Graco Pack n Play\nIKEA MALM dresser\n…"}
            className="block w-full resize-y bg-transparent px-4 py-3 font-mono text-[13px] leading-relaxed focus:outline-none"
          />
          <div className="flex items-center justify-between border-t hairline bg-paper/50 px-3 py-2.5">
            <span className="text-[12px] text-muted">Up to 200 items</span>
            <button
              type="button"
              onClick={() => run()}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-[14px] font-medium text-paper hover:bg-ink-2 disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              {loading ? "Checking…" : "Check all"}
            </button>
          </div>
        </div>
        {error && (
          <p role="alert" className="mt-3 text-[14px] text-stop-ink">
            {error}
          </p>
        )}
        <p className="mt-4 text-[13px] leading-relaxed text-muted">
          Batch mode uses the deterministic rules engine for speed and consistency. Open any flagged item in the single-listing checker
          to see the full notice, identifying details and seller questions.
        </p>
      </div>

      <div aria-live="polite">
        {!rows && !loading && (
          <div className="grid h-full min-h-64 place-items-center rounded-xl border border-dashed border-rule-strong p-10 text-center text-[14px] text-muted">
            Results show up here, sorted so items you shouldn&apos;t sell come first.
          </div>
        )}
        {rows && (
          <div className="rise">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-stop/30 bg-stop-bg px-3 py-1 text-[13px] text-stop-ink">{counts.do_not_buy} don&apos;t sell</span>
              <span className="rounded-full border border-caution/30 bg-caution-bg px-3 py-1 text-[13px] text-caution-ink">{counts.verify} verify</span>
              <span className="rounded-full border border-clear/30 bg-clear-bg px-3 py-1 text-[13px] text-clear-ink">{counts.no_recall_found} no match</span>
              {meta && (
                <span className="font-mono text-[11px] text-muted">
                  {rows.length} items × {meta.recallsSearched.toLocaleString()} recalls · {meta.ms} ms
                </span>
              )}
              <button
                type="button"
                onClick={exportCsv}
                className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-rule-strong px-3 py-1.5 text-[13px] hover:border-ink"
              >
                <Download className="h-3.5 w-3.5" aria-hidden /> Export CSV
              </button>
            </div>
            <div className="overflow-x-auto rounded-xl border hairline bg-card">
              <table className="w-full min-w-[560px] text-left text-[14px]">
                <thead className="border-b hairline">
                  <tr className="eyebrow">
                    <th scope="col" className="px-4 py-2.5 font-normal">Item</th>
                    <th scope="col" className="px-4 py-2.5 font-normal">Status</th>
                    <th scope="col" className="px-4 py-2.5 font-normal">Why</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} className="border-b hairline align-top last:border-0">
                      <td className="px-4 py-3 font-medium">{r.text}</td>
                      <td className="px-4 py-3">
                        <span className={`whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[12px] ${LABEL[r.verdict].cls}`}>
                          {LABEL[r.verdict].text}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-ink-2">
                        {r.ban && (
                          <a href={r.ban.url} target="_blank" rel="noreferrer" className="block font-medium text-stop-ink hover:underline">
                            {r.ban.title}
                          </a>
                        )}
                        {r.recall && (
                          <a href={r.recall.url} target="_blank" rel="noreferrer" className="block hover:underline">
                            {r.recall.title}
                            {r.more > 0 && <span className="text-muted"> (+{r.more} more)</span>}
                          </a>
                        )}
                        {!r.ban && !r.recall && <span className="text-muted">No recall or ban matched</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
