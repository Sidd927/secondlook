// Records genuine footage of the deployed SecondLook app with real browser interactions.
// Output: ../raw/*.webm (1920x1080) and ../raw/stills/*.png. Nothing here is mocked: every
// clip is the production site responding to real clicks, typing and file uploads.
// Usage: node capture.mjs [clipName...]
import { chromium } from "playwright";
import { mkdir, rename, readdir } from "node:fs/promises";
import path from "node:path";

const BASE = "https://secondlook-nu.vercel.app";
const RAW = path.resolve("../raw");
const LABEL = path.resolve("../../assets/sample-label.png");

// Visible cursor: Playwright drives the real mouse but headless Chrome draws no pointer.
const CURSOR = `
  window.addEventListener('DOMContentLoaded', () => {
    const c = document.createElement('div');
    c.id = '__cursor';
    c.innerHTML = '<svg width="30" height="30" viewBox="0 0 24 24"><path d="M4 2.5l15 8.6-6.6 1.6 3.6 7.1-2.7 1.4-3.6-7.2L4.6 18.4z" fill="#15130f" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/></svg>';
    Object.assign(c.style, {position:'fixed', left:'0', top:'0', zIndex: 2147483647, pointerEvents:'none',
      transform:'translate(-200px,-200px)', transition:'transform 0s', filter:'drop-shadow(0 2px 3px rgba(0,0,0,.25))'});
    document.documentElement.appendChild(c);
    const ring = document.createElement('div');
    Object.assign(ring.style, {position:'fixed', width:'34px', height:'34px', borderRadius:'50%', border:'2px solid rgba(179,49,26,.9)',
      zIndex: 2147483646, pointerEvents:'none', opacity:'0', transform:'translate(-200px,-200px)'});
    document.documentElement.appendChild(ring);
    addEventListener('mousemove', e => { c.style.transform = 'translate(' + (e.clientX-4) + 'px,' + (e.clientY-3) + 'px)'; }, true);
    addEventListener('mousedown', e => {
      ring.animate([{opacity:.9, transform:'translate(' + (e.clientX-17) + 'px,' + (e.clientY-17) + 'px) scale(.4)'},
                    {opacity:0, transform:'translate(' + (e.clientX-17) + 'px,' + (e.clientY-17) + 'px) scale(1.4)'}], {duration: 450, easing:'ease-out'});
    }, true);
  });`;

// Render the 1280px layout at 2x real pixels (screencast frames are CSS-pixel sized).
const ZOOM = `document.addEventListener('DOMContentLoaded', () => { document.documentElement.style.zoom = '2'; });`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let MARKS = {};
const mark = (k) => { MARKS[k] = Date.now() / 1000; };

async function glide(page, to, ms = 700) {
  const box = await to.boundingBox();
  const x = box.x + box.width / 2, y = box.y + box.height / 2;
  await page.mouse.move(x, y, { steps: Math.max(8, Math.round(ms / 16)) });
  return { x, y };
}
async function click(page, loc, ms) {
  await loc.scrollIntoViewIfNeeded();
  await glide(page, loc, ms);
  await sleep(180);
  await page.mouse.down(); await sleep(70); await page.mouse.up();
}
// Eased scroll so the footage reads smoothly.
async function scrollTo(page, y, ms = 1400) {
  await page.evaluate(([target, dur]) => new Promise((res) => {
    const start = scrollY, d = target - start, t0 = performance.now();
    const ease = (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const step = (now) => { const t = Math.min(1, (now - t0) / dur); scrollTo(0, start + d * ease(t)); t < 1 ? requestAnimationFrame(step) : res(); };
    requestAnimationFrame(step);
  }), [y, ms]);
}
async function scrollToEl(page, selector, offset = 90, ms = 1400) {
  const y = await page.evaluate(([s, o]) => { const el = document.querySelector(s); return el ? el.getBoundingClientRect().top + scrollY - o : 0; }, [selector, offset]);
  await scrollTo(page, y, ms);
}

const CLIPS = {
  async landing(page) {
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    await sleep(1200);
    await page.mouse.move(1150, 650, { steps: 30 });
    await sleep(1500);
    await glide(page, page.locator("#listing"), 1200);
    await sleep(1500);
  },

  async sleeper(page) {
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    await sleep(900);
    await click(page, page.locator("#listing"), 900);
    mark("typeStart");
    await page.keyboard.type("Fisher Price baby sleeper/rocker, barely used. Folds flat for travel. $25, pickup only.", { delay: 32 });
    await sleep(600);
    await click(page, page.getByRole("button", { name: "Check listing" }), 700);
    await page.getByText("Don't buy this. It's illegal to sell.").waitFor();
    mark("verdict");
    await sleep(2600);
    mark("toBan");
    await scrollToEl(page, "section[aria-label='Check result'] .border-stop\\/25", 120, 1500);
    await sleep(2800);
    mark("toRecall");
    await scrollToEl(page, "article", 110, 1500);
    await sleep(3500);
  },

  async photo(page) {
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    await sleep(900);
    await glide(page, page.locator("label[for=photo]"), 900);
    await sleep(300);
    await page.mouse.down(); await sleep(70); await page.mouse.up();
    await page.locator("#photo").setInputFiles(LABEL);
    mark("upload");
    await page.getByText("Read from photo:").waitFor({ timeout: 60000 });
    mark("ocrDone");
    await sleep(2200);
    await click(page, page.getByRole("button", { name: "Check listing" }), 800);
    await page.getByText("Don't buy this.", { exact: false }).first().waitFor();
    mark("verdict");
    await sleep(2000);
    mark("toFacts");
    await scrollToEl(page, "section[aria-label='Check result'] .grid", 260, 1300);
    await sleep(3200);
  },

  async swing(page) {
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    await sleep(900);
    await click(page, page.getByRole("button", { name: "Infant swing" }), 900);
    await page.getByText("Likely recalled. Confirm before you pay.").waitFor();
    mark("verdict");
    await sleep(2400);
    mark("toMessage");
    await scrollToEl(page, "pre", 190, 1400);
    await sleep(1800);
    await click(page, page.getByRole("button", { name: "Copy", exact: true }), 800);
    mark("copied");
    await sleep(2000);
    mark("toChecks");
    await scrollToEl(page, "article details", 160, 1500);
    await sleep(4200);
  },

  async batch(page) {
    await page.goto(BASE + "/batch", { waitUntil: "networkidle" });
    await sleep(1000);
    await click(page, page.getByRole("button", { name: "Load sample intake list" }), 900);
    await page.getByText("don't sell").first().waitFor();
    mark("results");
    await sleep(2600);
    const dl = page.waitForEvent("download");
    await click(page, page.getByRole("button", { name: "Export CSV" }), 900);
    const d = await dl;
    mark("exported");
    await d.saveAs(path.join(RAW, "secondlook-batch.csv"));
    await sleep(1200);
    await scrollTo(page, 330, 1500);
    await sleep(2600);
  },

  async method(page) {
    await page.goto(BASE + "/how-it-works", { waitUntil: "networkidle" });
    await sleep(1200);
    await scrollToEl(page, "#matching", 120, 2200);
    await sleep(2500);
  },
};

const only = process.argv.slice(2);
await mkdir(path.join(RAW, "stills"), { recursive: true });
const browser = await chromium.launch();
// Warm the serverless function so no clip records a cold start.
await (await fetch(BASE + "/api/check")).json();

import { writeFile, rm } from "node:fs/promises";
import { execFileSync } from "node:child_process";

// High-quality capture: Chrome DevTools screencast frames (JPEG q95) at 2x device scale
// (2560x1440), retimed to constant 30 fps by ffmpeg. Playwright's own webm recorder is
// kept as a fallback in raw/webm/.
for (const [name, fn] of Object.entries(CLIPS)) {
  if (only.length && !only.includes(name)) continue;
  const frameDir = path.join(RAW, "frames-" + name);
  await rm(frameDir, { recursive: true, force: true });
  await mkdir(frameDir, { recursive: true });
  const ctx = await browser.newContext({
    viewport: { width: 2560, height: 1440 },
    deviceScaleFactor: 1,
    acceptDownloads: true,
    permissions: ["clipboard-read", "clipboard-write"],
  });
  await ctx.addInitScript(CURSOR);
  await ctx.addInitScript(ZOOM);
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  const frames = [];
  let n = 0;
  cdp.on("Page.screencastFrame", async (f) => {
    const file = `f${String(++n).padStart(5, "0")}.jpg`;
    frames.push({ file, t: f.metadata.timestamp });
    writeFile(path.join(frameDir, file), Buffer.from(f.data, "base64"));
    cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }).catch(() => {});
  });
  // Taking one screenshot first switches Chrome's screencast to device-pixel (2x) frames.
  await page.goto("about:blank");
  await page.screenshot({ path: path.join(RAW, ".warm.png") });
  await cdp.send("Page.startScreencast", { format: "jpeg", quality: 95, maxWidth: 2560, maxHeight: 1440, everyNthFrame: 1 });
  const t0 = Date.now();
  MARKS = {};
  try {
    await fn(page);
    await sleep(400);
  } catch (e) {
    console.error(name, "FAILED", e.message);
  }
  await cdp.send("Page.stopScreencast").catch(() => {});
  await sleep(300);
  await ctx.close();
  // Build a concat list with each frame's real on-screen duration.
  frames.sort((a, b) => a.t - b.t);
  const origin = frames[0].t;
  const rel = Object.fromEntries(Object.entries(MARKS).map(([k, v]) => [k, +(v - origin).toFixed(2)]));
  await writeFile(path.join(RAW, name + ".marks.json"), JSON.stringify(rel, null, 1));
  const lines = [];
  for (let i = 0; i < frames.length; i++) {
    const d = i < frames.length - 1 ? Math.max(0.001, frames[i + 1].t - frames[i].t) : 0.5;
    lines.push(`file '${frames[i].file}'`, `duration ${d.toFixed(4)}`);
  }
  lines.push(`file '${frames.at(-1).file}'`);
  await writeFile(path.join(frameDir, "list.txt"), lines.join("\n"));
  execFileSync("ffmpeg", ["-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", path.join(frameDir, "list.txt"),
    "-vf", "fps=30,scale=2560:1440:flags=lanczos,format=yuv420p", "-c:v", "libx264", "-preset", "slow", "-crf", "12",
    path.join(RAW, name + ".mp4")]);
  console.log(`${name}: ${((Date.now() - t0) / 1000).toFixed(1)}s, ${frames.length} frames`);
}
await browser.close();
