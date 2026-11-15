// Captures genuine Devpost gallery screenshots of the live app (3:2, 2400x1600).
// Every image is the production site after real interactions; nothing is mocked or edited.
// Usage: node gallery.mjs
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE = "https://secondlook-nu.vercel.app";
const OUT = path.resolve("../../assets/devpost-gallery");
const LABEL = path.resolve("../../assets/sample-label.png");
const SLEEPER = "Fisher Price baby sleeper/rocker, barely used. Folds flat for travel. $25, pickup only.";
const SWING = "4moms mamaRoo infant seat swing, works great, all parts included. $90 OBO";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function scrollToEl(page, selector, offset = 70) {
  await page.evaluate(([s, o]) => {
    const el = document.querySelector(s);
    if (el) window.scrollTo(0, el.getBoundingClientRect().top + scrollY - o);
  }, [selector, offset]);
  await sleep(700);
}

await mkdir(OUT, { recursive: true });
await (await fetch(BASE + "/api/check")).json(); // warm the function
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1200, height: 800 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const shot = (name) => page.screenshot({ path: path.join(OUT, name) });

// 1. Landing page
await page.goto(BASE + "/", { waitUntil: "networkidle" });
await sleep(1200);
await shot("01-landing.png");

// 2-3. Vague listing → banned + matching recall
await page.goto(BASE + "/?q=" + encodeURIComponent(SLEEPER), { waitUntil: "networkidle" });
await page.getByText("Don't buy this. It's illegal to sell.").waitFor();
await sleep(1500);
await scrollToEl(page, "section[aria-label='Check result']", 76);
await shot("02-verdict-banned.png");
await scrollToEl(page, "article", 76);
await shot("03-recall-evidence.png");

// 4-5. Label photo → on-device OCR → result with the model number
await page.goto(BASE + "/", { waitUntil: "networkidle" });
await page.locator("#photo").setInputFiles(LABEL);
await page.getByText("Read from photo:").waitFor({ timeout: 60000 });
await sleep(800);
await shot("04-label-ocr.png");
await page.getByRole("button", { name: "Check listing" }).click();
await page.getByText("Don't buy this.", { exact: false }).first().waitFor();
await sleep(1200);
await scrollToEl(page, "section[aria-label='Check result']", 76);
await shot("05-label-result.png");

// 6. Narrow recall → seller message + which models are covered
await page.goto(BASE + "/?q=" + encodeURIComponent(SWING), { waitUntil: "networkidle" });
await page.getByText("Likely recalled. Confirm before you pay.").waitFor();
await sleep(1200);
await page.getByRole("button", { name: "Copy", exact: true }).click();
await sleep(500);
await scrollToEl(page, "pre", 150);
await shot("06-seller-message.png");
await scrollToEl(page, "article details", 90);
await shot("07-model-checks.png");

// 8. Batch screening
await page.goto(BASE + "/batch", { waitUntil: "networkidle" });
await page.getByRole("button", { name: "Load sample intake list" }).click();
await page.getByText("don't sell").first().waitFor();
await sleep(1200);
await page.evaluate(() => window.scrollTo(0, 250));
await sleep(600);
await shot("08-batch-screening.png");

// 9. Methodology: federal ban rules with citations
await page.goto(BASE + "/how-it-works", { waitUntil: "networkidle" });
await scrollToEl(page, "#bans", 120);
await shot("09-ban-rules.png");

await browser.close();
console.log("saved to", OUT);
