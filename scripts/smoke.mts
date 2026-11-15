import { runCheck } from "../src/lib/check";
const cases = [
  "Fisher Price baby sleeper/rocker, barely used, rainforest theme. $25 pickup only",
  "Boppy newborn lounger, gray elephants, washed. $10",
  "Graco Pack n Play with bassinet, gently used, smoke free home",
  "Vintage wooden drop side crib from 2008, great condition, mattress included",
  "IKEA MALM 6 drawer dresser white, must pick up",
  "Crib bumper set, quilted, matching sheets, $15",
  "Sharper Image tabletop fire pit, used twice",
  "Kids Nike sneakers size 3, like new",
  "4moms mamaRoo infant seat swing, works great",
  "Peloton Tread, model TR02",
];
for (const c of cases) {
  const r = await runCheck({ text: c });
  console.log("\n=== " + c);
  console.log(r.verdict, "|", r.headline, "|", r.profile.brand, r.profile.categories.join(","), r.engine.ms + "ms");
  for (const b of r.bans) console.log("  BAN", b.id);
  for (const k of r.candidates) console.log("  ", k.strength.padEnd(8), k.score.toFixed(1).padStart(6), k.recall.date, k.recall.title.slice(0, 100));
}
