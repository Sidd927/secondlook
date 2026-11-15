// Normalizes a raw CPSC Recalls API record into the compact shape SecondLook uses.
// Shared by the snapshot script (scripts/sync-cpsc.mjs) and the live-delta fetch at runtime.

const clean = (s) =>
  (s ?? "")
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{2,}/g, "\n")
    .trim();

const clip = (s, n) => (s.length > n ? s.slice(0, n).replace(/\s+\S*$/, "") + "…" : s);

/** @param {any} r */
export function compactRecall(r) {
  if (!r || !r.RecallNumber) return null;
  const products = (r.Products ?? []).map((p) => ({
    name: clean(p.Name),
    model: clip(clean(p.Model), 600),
    type: clean(p.Type),
    units: clean(p.NumberOfUnits),
  }));
  const firms = [
    ...(r.Manufacturers ?? []),
    ...(r.Importers ?? []),
    ...(r.Distributors ?? []),
  ]
    .map((f) => clean(f.Name).split(",")[0])
    .filter(Boolean);
  return {
    id: String(r.RecallNumber),
    date: (r.RecallDate ?? "").slice(0, 10),
    title: clean(r.Title),
    url: r.URL ?? "",
    description: clip(clean(r.Description), 1400),
    products,
    hazard: clip(clean(r.Hazards?.[0]?.Name), 600),
    remedy: clip(clean(r.Remedies?.[0]?.Name), 700),
    remedyOptions: (r.RemedyOptions ?? []).map((o) => clean(o.Option)).filter(Boolean),
    contact: clip(clean(r.ConsumerContact), 500),
    injuries: clip(clean(r.Injuries?.[0]?.Name), 500),
    soldAt: clip(clean(r.Retailers?.[0]?.Name).replace(/^Sold (At|Exclusively At|Online At):?\s*/i, ""), 400),
    image: r.Images?.[0]?.URL ?? "",
    firms: [...new Set(firms)].slice(0, 4),
    upcs: (r.ProductUPCs ?? []).map((u) => clean(u.UPC)).filter(Boolean).slice(0, 20),
  };
}
