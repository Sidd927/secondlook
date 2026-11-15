"""Generates the HyperFrames project for the SecondLook demo film from timeline.py:
film/index.html, film/compositions/*.html (one per scene + captions) and ../final/*.srt.

All product footage is real (captured from https://secondlook-nu.vercel.app by
capture/capture.mjs). Motion-graphics scenes only show verified facts with their sources.

Usage: python build_scenes.py   (run from submission/video/src)
"""
import json
import re
from pathlib import Path

from timeline import FOOTAGE, SCENES, TOTAL, VO

ROOT = Path(__file__).resolve().parent.parent
FILM = ROOT / "film"
COMP = FILM / "compositions"
COMP.mkdir(parents=True, exist_ok=True)
(ROOT / "final").mkdir(exist_ok=True)

DUR = {sid: round(e - s, 3) for sid, s, e in SCENES}
START = {sid: s for sid, s, e in SCENES}

FONTS = """
@font-face { font-family: "SL Serif"; src: url("assets/fonts/instrument-serif-latin-400-normal.woff2") format("woff2"); font-weight: 400; font-style: normal; }
@font-face { font-family: "SL Serif"; src: url("assets/fonts/instrument-serif-latin-400-italic.woff2") format("woff2"); font-weight: 400; font-style: italic; }
@font-face { font-family: "SL Sans"; src: url("assets/fonts/geist-sans-latin-400-normal.woff2") format("woff2"); font-weight: 400; }
@font-face { font-family: "SL Sans"; src: url("assets/fonts/geist-sans-latin-500-normal.woff2") format("woff2"); font-weight: 500; }
@font-face { font-family: "SL Sans"; src: url("assets/fonts/geist-sans-latin-600-normal.woff2") format("woff2"); font-weight: 600; }
@font-face { font-family: "SL Mono"; src: url("assets/fonts/geist-mono-latin-400-normal.woff2") format("woff2"); font-weight: 400; }
@font-face { font-family: "SL Mono"; src: url("assets/fonts/geist-mono-latin-500-normal.woff2") format("woff2"); font-weight: 500; }
"""

BASE_CSS = """
#root { position: absolute; inset: 0; overflow: hidden; font-family: "SL Sans", sans-serif; color: #15130f; }
.paper { position: absolute; inset: 0; background: #f5f2eb; }
.serif { font-family: "SL Serif", serif; font-weight: 400; letter-spacing: -0.01em; }
.mono { font-family: "SL Mono", monospace; letter-spacing: 0.12em; text-transform: uppercase; }
.red { color: #b3311a; }
.callout { position: absolute; right: 64px; top: 56px; display: flex; align-items: center; gap: 16px;
  background: #15130f; color: #f5f2eb; padding: 18px 28px; border-radius: 14px; font-size: 30px; font-weight: 500;
  box-shadow: 0 18px 40px -18px rgba(21,19,15,.6); opacity: 0; }
.callout .dot { width: 14px; height: 14px; border-radius: 50%; background: #e0583f; flex: none; }
.callout .dot.amber { background: #e3a43b; } .callout .dot.green { background: #6fb38f; }
.callout small { display: block; font-size: 28px; font-weight: 400; color: #cfc8ba; margin-top: 4px; }
.chapter { position: absolute; left: 64px; top: 56px; background: #f5f2eb; color: #15130f; border: 2px solid #15130f;
  padding: 14px 24px; border-radius: 12px; font-size: 28px; opacity: 0; box-shadow: 0 12px 30px -16px rgba(21,19,15,.5); }
.chapter b { font-weight: 500; margin-right: 14px; color: #b3311a; }
.cam { position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; }
.cam video { position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; object-fit: cover; }
"""


def scene_file(sid, body, script, extra_css=""):
    html = f"""<template>
  <style>
{FONTS}
{BASE_CSS}
{extra_css}
  </style>
  <div id="root" data-composition-id="{sid}" data-width="1920" data-height="1080">
{body}
  </div>
  <script>
    const tl = gsap.timeline({{ paused: true }});
    const D = {DUR[sid]};
{CAM_JS}
{script}
    window.__timelines["{sid}"] = tl;
  </script>
</template>
"""
    (COMP / f"{sid}.html").write_text(html)


# Camera helper: move an untimed wrapper so (cx, cy) in 1920x1080 footage space is framed at
# scale s, clamped so the footage always covers the frame.
CAM_JS = """
    function cam(sel, t, s, cx, cy, dur) {
      const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
      const x = clamp(960 - s * cx, 1920 - 1920 * s, 0);
      const y = clamp(540 - s * cy, 1080 - 1080 * s, 0);
      tl.to(sel, { scale: s, x: x, y: y, duration: dur || 0.9, ease: "power3.inOut" }, t);
    }
    function show(sel, t0, t1, fromY) {
      tl.fromTo(sel, { opacity: 0, y: fromY === undefined ? 14 : fromY }, { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }, t0);
      if (t1 !== undefined) tl.to(sel, { opacity: 0, y: -8, duration: 0.35, ease: "power2.in" }, t1);
    }
"""


def video_tag(sid, prefix):
    file, ms = FOOTAGE[sid]
    return (f'<div class="cam" id="{prefix}-cam"><video id="{prefix}-vid" class="clip" data-start="0" '
            f'data-duration="{DUR[sid]}" data-media-start="{ms}" src="assets/footage/{file}" muted playsinline></video></div>')


def fade_edges(prefix, wrap):
    return f"""
    tl.fromTo("#{wrap}", {{ opacity: 0 }}, {{ opacity: 1, duration: 0.35, ease: "power1.out" }}, 0);
    tl.to("#{wrap}", {{ opacity: 0, duration: 0.3, ease: "power1.in" }}, D - 0.32);"""


# ---------------------------------------------------------------- HOOK
scene_file("hook", """
    <div class="paper"></div>
    <div id="hook-wrap" style="position:absolute;inset:0">
      <div id="hook-card" class="listing">
        <div class="ph"><img src="assets/img/rocknplay.jpg" alt=""></div>
        <div class="bd">
          <div class="mono eb">Marketplace · Listed 2 days ago</div>
          <div class="ti">Baby sleeper/rocker</div>
          <div class="pr">$25</div>
          <div class="chips"><span>Used · like new</span><span>Pickup only</span></div>
          <div class="de">Fisher Price baby sleeper/rocker, barely used. Folds flat for travel. $25, pickup only.</div>
          <div class="btn">Message seller</div>
        </div>
      </div>
      <div id="hook-t" class="serif">
        <div class="ln"><span id="hook-t1">It looks perfectly safe.</span></div>
        <div class="ln"><span id="hook-t2" class="red" style="font-style:italic">But what if it isn’t?</span></div>
      </div>
      <div id="hook-note" class="mono" data-layout-ignore>Illustrative listing · product photo: U.S. CPSC</div>
    </div>
""", """
    tl.fromTo("#hook-card", { opacity: 0, y: 50, scale: 0.97, x: 0 }, { opacity: 1, y: 0, scale: 1, duration: 1.0, ease: "power3.out" }, 0.1);
    tl.fromTo("#hook-note", { opacity: 0 }, { opacity: 1, duration: 0.6 }, 0.8);
    tl.to("#hook-card", { scale: 1.035, duration: 6.0, ease: "none" }, 1.1);
    tl.fromTo("#hook-card .pr", { scale: 1 }, { scale: 1.08, duration: 0.25, yoyo: true, repeat: 1, ease: "power2.out" }, 4.6);
    tl.to("#hook-card", { x: -360, scale: 0.78, duration: 0.95, ease: "power3.inOut" }, 7.1);
    tl.fromTo("#hook-t1", { yPercent: 110 }, { yPercent: 0, duration: 0.7, ease: "power4.out" }, 7.55);
    tl.fromTo("#hook-t2", { yPercent: 110 }, { yPercent: 0, duration: 0.7, ease: "power4.out" }, 8.9);
    tl.to("#hook-t", { opacity: 0, duration: 0.45, ease: "power2.in" }, 10.75);
    tl.to("#hook-note", { opacity: 0, duration: 0.4 }, 10.8);
""", """
.listing { position: absolute; left: 290px; top: 210px; width: 1340px; height: 600px; background: #fff; border-radius: 26px;
  display: grid; grid-template-columns: 520px 1fr; overflow: hidden; box-shadow: 0 40px 80px -40px rgba(21,19,15,.45), 0 0 0 1px rgba(21,19,15,.06); }
.listing .ph { background: #fff; border-right: 1px solid #ece7dc; display: flex; align-items: center; justify-content: center; }
.listing .ph img { width: 430px; height: 520px; object-fit: contain; }
.listing .bd { padding: 56px 60px; display: flex; flex-direction: column; gap: 18px; }
.listing .eb { font-size: 24px; color: #6b6458; }
.listing .ti { font-size: 60px; font-weight: 600; letter-spacing: -0.02em; line-height: 1.05; }
.listing .pr { font-size: 64px; font-weight: 600; transform-origin: left center; }
.listing .chips { display: flex; gap: 12px; }
.listing .chips span { background: #ece7dc; border-radius: 999px; padding: 8px 18px; font-size: 24px; color: #3b372f; }
.listing .de { font-size: 28px; line-height: 1.4; color: #3b372f; max-width: 700px; }
.listing .btn { margin-top: auto; align-self: flex-start; background: #15130f; color: #f5f2eb; border-radius: 12px; padding: 16px 30px; font-size: 26px; font-weight: 500; }
#hook-t { position: absolute; left: 1150px; top: 330px; width: 720px; font-size: 104px; line-height: 1.02; }
#hook-t .ln { overflow: hidden; padding-bottom: 14px; }
#hook-t span { display: inline-block; }
#hook-note { position: absolute; left: 64px; bottom: 44px; font-size: 18px; color: #6b6458; opacity: 0; }
""")

# ---------------------------------------------------------------- PROBLEM
scene_file("problem", """
    <div class="paper"></div>
    <div id="pr-wrap" style="position:absolute;inset:0">
      <div id="pr-card" class="listing">
        <div class="ph"><img src="assets/img/rocknplay.jpg" alt=""></div>
        <div class="bd" style="position:relative">
          <div id="pr-old" class="layer">
            <div class="mono eb">Marketplace · Listed 2 days ago</div>
            <div class="ti">Baby sleeper/rocker</div>
            <div class="pr">$25</div>
          </div>
          <div id="pr-new" class="layer" style="opacity:0">
            <div class="mono eb red">U.S. CPSC · Recall #19105 · Apr 12, 2019</div>
            <div class="rt serif">Fisher-Price Recalls Rock ’n Play Sleepers Due to Reports of Deaths</div>
            <div class="facts">
              <div><b class="serif">≈4.7M</b><span>units recalled</span></div>
              <div><b class="serif">Refund</b><span>or voucher offered</span></div>
            </div>
            <div class="mono src" data-layout-ignore>Source · cpsc.gov recall notice</div>
          </div>
        </div>
        <div id="pr-scan"></div>
      </div>
      <div id="pr-stamp" class="serif">Banned from sale</div>
      <div id="pr-law" class="mono">Safe Sleep for Babies Act · 2022 · inclined infant sleepers</div>

      <div id="pr-line" class="serif">A recall stops new sales. <i class="red">Not resales.</i></div>
      <div id="pr-cmp">
        <div class="col"><div class="mono k">What the listing says</div><div class="serif v">“Baby sleeper/rocker”</div></div>
        <div class="ne serif red">≠</div>
        <div class="col"><div class="mono k">What the recall says</div><div class="serif v">“Rock ’n Play Sleeper”</div></div>
      </div>

      <div id="pr-cr">
        <div class="mono k">Consumer Reports · 2026 investigation</div>
        <div class="serif h">Banned baby gear, listed on every major resale platform it checked.</div>
        <div class="plats">
          <div id="pr-p1"><i></i>Facebook Marketplace</div>
          <div id="pr-p2"><i></i>eBay</div>
          <div id="pr-p3"><i></i>Mercari</div>
          <div id="pr-p4"><i></i>Craigslist</div>
        </div>
        <div class="mono s" data-layout-ignore>Source · Consumer Reports, “Popular Sites for Used Baby Gear Continue to Carry Banned and Recalled Items”</div>
      </div>
    </div>
""", """
    tl.fromTo("#pr-scan", { x: 0, opacity: 0 }, { x: 1334, opacity: 1, duration: 0.9, ease: "power2.inOut" }, 0.25);
    tl.to("#pr-scan", { opacity: 0, duration: 0.2 }, 1.15);
    tl.to("#pr-old", { opacity: 0, duration: 0.35 }, 0.7);
    tl.fromTo("#pr-new", { opacity: 0, y: 16, immediateRender: false }, { opacity: 1, y: 0, duration: 0.55, ease: "power3.out" }, 0.95);
    tl.fromTo("#pr-card", { x: -360, scale: 0.78 }, { x: 0, scale: 0.94, duration: 1.0, ease: "power3.inOut" }, 1.2);
    tl.to("#pr-card", { scale: 0.975, duration: 7.4, ease: "none" }, 2.25);
    tl.to("#pr-card", { scale: 1.0, duration: 4.2, ease: "none" }, 9.66);
    tl.fromTo("#pr-stamp", { opacity: 0, scale: 1.5, rotation: -14 }, { opacity: 1, scale: 1, rotation: -8, duration: 0.45, ease: "back.out(2)" }, 9.7);
    show("#pr-law", 10.1);
    tl.to(["#pr-card", "#pr-stamp", "#pr-law"], { opacity: 0, y: -30, duration: 0.5, ease: "power2.in" }, 13.9);
    show("#pr-line", 14.4, 20.9, 24);
    tl.fromTo("#pr-cmp .col", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.5, ease: "power3.out" }, 17.2);
    tl.fromTo("#pr-cmp .ne", { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(2)" }, 18.0);
    tl.to("#pr-cmp", { opacity: 0, duration: 0.35 }, 20.9);
    show("#pr-cr .k", 21.4); show("#pr-cr .h", 21.6, undefined, 24);
    ["#pr-p1", "#pr-p2", "#pr-p3", "#pr-p4"].forEach((s, i) => tl.fromTo(s, { opacity: 0, y: 20, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "back.out(1.6)" }, 21.9 + i * 0.4));
    show("#pr-cr .s", 23.6);
""" + fade_edges("pr", "pr-wrap").replace('tl.fromTo("#pr-wrap", { opacity: 0 }, { opacity: 1, duration: 0.35, ease: "power1.out" }, 0);', ''), """
.listing { position: absolute; left: 290px; top: 210px; width: 1340px; height: 600px; background: #fff; border-radius: 26px;
  display: grid; grid-template-columns: 520px 1fr; overflow: hidden; box-shadow: 0 40px 80px -40px rgba(21,19,15,.45), 0 0 0 1px rgba(21,19,15,.06); }
.listing .ph { background: #fff; border-right: 1px solid #ece7dc; display: flex; align-items: center; justify-content: center; }
.listing .ph img { width: 430px; height: 520px; object-fit: contain; }
.listing .bd { padding: 56px 60px; }
.layer { position: absolute; inset: 56px 60px; display: flex; flex-direction: column; gap: 20px; }
.eb { font-size: 24px; color: #6b6458; }
.ti { font-size: 60px; font-weight: 600; letter-spacing: -0.02em; }
.pr { font-size: 64px; font-weight: 600; }
.rt { font-size: 56px; line-height: 1.06; }
.facts { display: flex; gap: 56px; margin-top: 10px; }
.facts b { display: block; font-size: 72px; line-height: 1; font-weight: 400; }
.facts span { font-size: 24px; color: #6b6458; }
.src { margin-top: auto; font-size: 18px; color: #6b6458; }
#pr-scan { position: absolute; left: 0; top: 0; bottom: 0; width: 6px; background: #b3311a; box-shadow: 0 0 30px 6px rgba(179,49,26,.35); opacity: 0; }
#pr-stamp { position: absolute; right: 300px; top: 560px; font-size: 64px; text-transform: uppercase; color: #b3311a; border: 5px solid #b3311a;
  padding: 6px 26px; border-radius: 10px; background: rgba(248,230,224,.92); opacity: 0; letter-spacing: 0.02em; }
#pr-law { position: absolute; left: 0; right: 0; top: 860px; text-align: center; font-size: 26px; color: #6e1d0f; opacity: 0; }
#pr-line { position: absolute; left: 0; right: 0; top: 230px; text-align: center; font-size: 96px; opacity: 0; }
#pr-cmp { position: absolute; left: 160px; right: 160px; top: 470px; display: grid; grid-template-columns: 1fr 140px 1fr; align-items: center; }
#pr-cmp .col { background: #fbfaf6; border: 1px solid #d9d2c3; border-radius: 22px; padding: 40px 44px; opacity: 0; }
#pr-cmp .k { font-size: 22px; color: #6b6458; }
#pr-cmp .v { font-size: 74px; margin-top: 10px; line-height: 1.05; }
#pr-cmp .ne { text-align: center; font-size: 150px; opacity: 0; }
#pr-cr { position: absolute; left: 160px; right: 160px; top: 190px; }
#pr-cr .k { font-size: 24px; color: #b3311a; opacity: 0; }
#pr-cr .h { font-size: 92px; line-height: 1.02; margin-top: 18px; max-width: 1450px; opacity: 0; }
#pr-cr .plats { display: flex; gap: 22px; margin-top: 54px; }
#pr-cr .plats div { background: #fbfaf6; border: 1px solid #d9d2c3; border-radius: 16px; padding: 22px 30px; font-size: 32px; font-weight: 500; display: flex; align-items: center; gap: 14px; opacity: 0; }
#pr-cr .plats i { width: 16px; height: 16px; border-radius: 50%; background: #b3311a; display: inline-block; }
#pr-cr .s { font-size: 19px; color: #6b6458; margin-top: 40px; opacity: 0; }
""")

# ---------------------------------------------------------------- MEET (brand reveal → live site)
MARK_SVG = """<svg viewBox="0 0 24 24" fill="none"><circle id="{p}-c" cx="10" cy="10" r="6.5" stroke="#15130f" stroke-width="1.9" pathLength="1"/>
<path id="{p}-h" d="M15 15l5.5 5.5" stroke="#15130f" stroke-width="2.1" stroke-linecap="round" pathLength="1"/>
<path id="{p}-k" d="M7.2 10.2l1.9 1.9 3.8-4" stroke="#b3311a" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" pathLength="1"/></svg>"""

LOCKUP_CSS = """
.lockup { position: absolute; left: 0; right: 0; display: flex; align-items: center; justify-content: center; gap: 34px; }
.lockup svg { width: 150px; height: 150px; }
.lockup .wm { font-size: 190px; line-height: 1; clip-path: inset(0 100% 0 0); }
.tag { position: absolute; left: 0; right: 0; text-align: center; font-size: 66px; font-style: italic; color: #3b372f; opacity: 0; }
"""


def lockup_anim(p, t0):
    return f"""
    tl.fromTo("#{p}-c", {{ strokeDasharray: 1, strokeDashoffset: 1 }}, {{ strokeDashoffset: 0, duration: 0.7, ease: "power2.inOut" }}, {t0});
    tl.fromTo("#{p}-h", {{ strokeDasharray: 1, strokeDashoffset: 1 }}, {{ strokeDashoffset: 0, duration: 0.3, ease: "power2.out" }}, {t0 + 0.55});
    tl.fromTo("#{p}-k", {{ strokeDasharray: 1, strokeDashoffset: 1 }}, {{ strokeDashoffset: 0, duration: 0.35, ease: "power2.out" }}, {t0 + 0.8});
    tl.fromTo("#{p}-wm", {{ clipPath: "inset(0 100% 0 0)" }}, {{ clipPath: "inset(0 0% 0 0)", duration: 0.8, ease: "power3.inOut" }}, {t0 + 0.45});"""


scene_file("meet", f"""
    <div class="paper"></div>
    {video_tag("meet", "m")}
    <div id="m-brand" style="position:absolute;inset:0">
      <div class="paper"></div>
      <div class="lockup" style="top:330px">{MARK_SVG.format(p="m")}<div id="m-wm" class="serif wm">Second<i>Look</i></div></div>
      <div id="m-tag" class="serif tag" style="top:600px">Look twice before you buy it used.</div>
    </div>
""", lockup_anim("m", 0.35) + """
    show("#m-tag", 2.3, undefined, 20);
    tl.fromTo("#m-brand .lockup", { scale: 1 }, { scale: 1.035, duration: 4.2, ease: "none" }, 1.3);
    tl.to("#m-brand", { opacity: 0, duration: 0.7, ease: "power2.inOut" }, 5.45);
    tl.fromTo("#m-cam", { scale: 1.12, x: -115, y: -65 }, { scale: 1, x: 0, y: 0, duration: 1.6, ease: "power3.out" }, 5.5);
    cam("#m-cam", 10.2, 1.32, 1372, 470, 1.3);
""", LOCKUP_CSS + "#m-cam { transform-origin: 0 0; }")

# ---------------------------------------------------------------- DEMO A (paste a listing)
scene_file("demoa", f"""
    <div class="paper"></div>
    <div id="a-wrap" style="position:absolute;inset:0">
      {video_tag("demoa", "a")}
      <div id="a-ch" class="chapter mono"><b>01</b>Paste a listing</div>
      <div id="a-c1" class="callout"><span class="dot amber"></span><div>Pasted exactly as listed</div></div>
      <div id="a-c2" class="callout"><span class="dot"></span><div>Verdict: don’t buy</div></div>
      <div id="a-c3" class="callout"><span class="dot"></span><div>Federal sale ban<small>with its legal citation</small></div></div>
      <div id="a-c4" class="callout"><span class="dot"></span><div>The matching CPSC recall<small>hazard · reported deaths · official notice</small></div></div>
    </div>
""", """
    show("#a-ch", 0.2, 3.6);
    show("#a-c1", 1.4, 5.6);
    tl.fromTo("#a-cam", { scale: 1.32, x: 960 - 1.32 * 1372, y: 540 - 1.32 * 470 }, { scale: 1, x: 0, y: 0, duration: 0.8, ease: "power3.inOut" }, 6.0);
    cam("#a-cam", 7.25, 1.38, 640, 280, 0.9);
    show("#a-c2", 7.5, 9.1);
    cam("#a-cam", 9.3, 1.24, 920, 340, 1.0);
    show("#a-c3", 9.9, 13.4);
    tl.to("#a-cam", { scale: "+=0.025", x: "-=24", y: "-=14", duration: 3.2, ease: "sine.inOut" }, 10.35);
    cam("#a-cam", 13.65, 1.18, 990, 470, 1.1);
    show("#a-c4", 14.2, 17.9);
    tl.to("#a-cam", { scale: "+=0.025", x: "-=24", y: "-=14", duration: 3.5, ease: "sine.inOut" }, 14.8);
""" + fade_edges("a", "a-wrap"), "#a-cam { transform-origin: 0 0; }")

# ---------------------------------------------------------------- DEMO B (label photo)
scene_file("demob", f"""
    <div class="paper"></div>
    <div id="b-wrap" style="position:absolute;inset:0">
      {video_tag("demob", "b")}
      <div id="b-label"><img src="assets/img/sample-label.png" alt=""><div class="mono" data-layout-ignore>Sample label photo (demo)</div></div>
      <div id="b-ch" class="chapter mono"><b>02</b>Snap the label</div>
      <div id="b-c1" class="callout"><span class="dot green"></span><div>Text read on-device<small>OCR runs in the browser (Tesseract.js)</small></div></div>
      <div id="b-c2" class="callout"><span class="dot"></span><div>Brand + model from the label</div></div>
    </div>
""", """
    show("#b-ch", 0.15, 3.4);
    tl.fromTo("#b-label", { opacity: 0, x: -60, scale: 1 }, { opacity: 1, x: 0, duration: 0.5, ease: "power3.out" }, 0.1);
    tl.to("#b-label", { x: 840, y: 120, scale: 0.18, opacity: 0, duration: 0.6, ease: "power3.in" }, 0.75);
    cam("#b-cam", 1.25, 1.55, 1390, 540, 0.9);
    show("#b-c1", 2.5, 5.6);
    cam("#b-cam", 5.7, 1.0, 960, 540, 0.7);
    cam("#b-cam", 8.85, 1.6, 720, 445, 1.0);
    show("#b-c2", 9.3, 12.6);
    tl.to("#b-cam", { scale: "+=0.02", x: "-=19", y: "-=11", duration: 3.0, ease: "sine.inOut" }, 9.9);
""" + fade_edges("b", "b-wrap"), """
#b-cam { transform-origin: 0 0; }
#b-label { position: absolute; left: 140px; top: 250px; width: 640px; background: #fff; border-radius: 18px; padding: 18px;
  box-shadow: 0 30px 60px -28px rgba(21,19,15,.55); opacity: 0; transform-origin: 50% 50%; }
#b-label img { width: 100%; display: block; border-radius: 8px; }
#b-label .mono { font-size: 18px; color: #6b6458; margin-top: 12px; }
""")

# ---------------------------------------------------------------- DEMO C (narrow recall + seller message)
scene_file("democ", f"""
    <div class="paper"></div>
    <div id="c-wrap" style="position:absolute;inset:0">
      {video_tag("democ", "c")}
      <div id="c-ch" class="chapter mono"><b>03</b>Know what to ask</div>
      <div id="c-c1" class="callout"><span class="dot amber"></span><div>Verify first: likely recalled</div></div>
      <div id="c-c2" class="callout"><span class="dot amber"></span><div>Questions for the seller<small>built from the recall notice · one-click copy</small></div></div>
      <div id="c-c3" class="callout"><span class="dot amber"></span><div>Only 3-point-harness models<small>identifiers pulled from the CPSC notice</small></div></div>
    </div>
""", """
    show("#c-ch", 0.15, 2.6);
    cam("#c-cam", 2.85, 1.3, 700, 330, 0.9);
    show("#c-c1", 3.2, 5.0);
    cam("#c-cam", 5.6, 1.1, 960, 360, 0.9);
    tl.to("#c-cam", { scale: "+=0.02", x: "-=19", y: "-=11", duration: 4.9, ease: "sine.inOut" }, 6.55);
    show("#c-c2", 6.0, 11.2);
    cam("#c-cam", 11.75, 1.4, 1100, 380, 1.0);
    show("#c-c3", 12.3, 16.1);
    tl.to("#c-cam", { scale: "+=0.025", x: "-=24", y: "-=14", duration: 3.6, ease: "sine.inOut" }, 12.8);
""" + fade_edges("c", "c-wrap"), "#c-cam { transform-origin: 0 0; } #c-c2 { top: auto; right: auto; left: 64px; bottom: 150px; }")

# ---------------------------------------------------------------- DEMO D (batch)
scene_file("demod", f"""
    <div class="paper"></div>
    <div id="d-wrap" style="position:absolute;inset:0">
      {video_tag("demod", "d")}
      <div id="d-ch" class="chapter mono"><b>04</b>Screen a whole list</div>
      <div id="d-c1" class="callout"><span class="dot"></span><div>12 items screened at once<small>3 don’t sell · 7 verify · 2 no match</small></div></div>
      <div id="d-c2" class="callout"><span class="dot green"></span><div>Export as CSV</div></div>
    </div>
""", """
    show("#d-ch", 0.15, 2.8);
    cam("#d-cam", 2.95, 1.25, 1270, 700, 0.9);
    show("#d-c1", 3.0, 6.3);
    tl.to("#d-cam", { scale: "+=0.03", x: "-=29", y: "-=16", duration: 5.8, ease: "sine.inOut" }, 3.9);
    show("#d-c2", 6.55, 9.65);
""" + fade_edges("d", "d-wrap"), "#d-cam { transform-origin: 0 0; }")

# ---------------------------------------------------------------- HOW IT WORKS
NODES = [
    ("01", "Listing or label photo", "Text as the seller wrote it"),
    ("02", "On-device OCR", "Tesseract.js, in the browser"),
    ("03", "Product identification", "Brand · type · model no."),
    ("04", "CPSC recall index", "7,192 recalls + live API"),
    ("05", "Matching + ban rules", "Ranked search · brand · model"),
    ("06", "Evidence-backed verdict", "Linked to the CPSC notice"),
]
nodes_html = "".join(
    f'<div class="node" id="h-n{i}"><div class="mono n" data-layout-ignore>{n}</div><div class="t">{t}</div><div class="s">{s}</div></div>'
    + (f'<div class="arr" id="h-a{i}">→</div>' if i < 5 else "")
    for i, (n, t, s) in enumerate(NODES)
)
scene_file("how", f"""
    <div class="paper"></div>
    <div id="h-wrap" style="position:absolute;inset:0">
      <div class="mono h-eb">How it works</div>
      <div class="serif h-ti">From a vague listing to evidence.</div>
      <div class="pipe">{nodes_html}</div>

      <div id="h-p1" class="panel stats">
        <div><b class="serif" id="h-count">0</b><span>CPSC recalls indexed, 2005 → Nov 12, 2026</span></div>
        <div><b class="serif">+ live</b><span>newer recalls fetched from the public CPSC API</span></div>
        <div><b class="serif">23</b><span>listing-slang concepts mapped to recall language</span></div>
      </div>

      <div id="h-p2" class="panel map">
        <div class="row" id="h-r1"><span class="q">“sleeper/rocker”</span><span class="ar">→</span><span class="a">inclined infant sleeper · Rock ’n Play</span></div>
        <div class="row" id="h-r2"><span class="q">“Fisher Price”</span><span class="ar">→</span><span class="a">Fisher-Price, the recalling firm</span></div>
        <div class="row" id="h-r3"><span class="q">“CHP55”</span><span class="ar">→</span><span class="a">checked against recall model numbers &amp; UPCs</span></div>
      </div>

      <div id="h-p3" class="panel rules">
        <div class="col">
          <div class="mono k">Federal sale-ban rules</div>
          <ul>
            <li>Inclined infant sleepers <em>Pub. L. 117-126</em></li>
            <li>Padded crib bumpers <em>Pub. L. 117-126</em></li>
            <li>Drop-side cribs <em>16 CFR 1219/1220</em></li>
            <li>Lawn darts <em>16 CFR 1306</em></li>
          </ul>
        </div>
        <div class="col badge">
          <div class="mono k">In the live app</div>
          <div class="serif big">Deterministic rules engine.</div>
          <div class="small">No generative AI makes the decision. Every match links to its official CPSC notice.</div>
        </div>
      </div>
    </div>
""", """
    show(".h-eb", 0.2); show(".h-ti", 0.35, undefined, 20);
    [1.0, 2.0, 3.0, 4.5, 6.0, 7.5].forEach((t, i) => {
      tl.fromTo("#h-n" + i, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, t);
      if (i < 5) tl.fromTo("#h-a" + i, { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.4 }, t + 0.35);
    });
    show("#h-p1", 4.7);
    const counter = { v: 0 };
    tl.to(counter, { v: 7192, duration: 1.6, ease: "power2.out", onUpdate: () => {
      document.querySelector("#h-count").textContent = Math.round(counter.v).toLocaleString("en-US"); } }, 4.8);
    tl.to("#h-p1", { opacity: 0, duration: 0.35 }, 10.7);
    tl.to(["#h-n2", "#h-n4"], { borderColor: "#b3311a", backgroundColor: "#f8e6e0", duration: 0.4 }, 11.1);
    show("#h-p2", 11.1);
    ["#h-r1", "#h-r2", "#h-r3"].forEach((s, i) => tl.fromTo(s, { opacity: 0, x: -24 }, { opacity: 1, x: 0, duration: 0.5, ease: "power3.out" }, 11.5 + i * 1.55));
    tl.to("#h-p2", { y: -12, duration: 5.5, ease: "none" }, 12.0);
    tl.to("#h-p2", { opacity: 0, duration: 0.35 }, 17.7);
    tl.to(["#h-n2"], { borderColor: "#d9d2c3", backgroundColor: "#fbfaf6", duration: 0.4 }, 17.8);
    tl.to(["#h-n5"], { borderColor: "#15130f", backgroundColor: "#15130f", color: "#f5f2eb", duration: 0.4 }, 18.1);
    show("#h-p3", 18.1);
    tl.fromTo("#h-p3 li", { opacity: 0, x: -16 }, { opacity: 1, x: 0, duration: 0.4, stagger: 0.35, ease: "power3.out" }, 18.5);
    tl.fromTo("#h-p3 .badge", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, 21.3);
    tl.to("#h-p3", { y: -14, duration: 7, ease: "none" }, 21.9);
    tl.fromTo("#h-n5", { boxShadow: "0 0 0 0 rgba(179,49,26,0)" }, { boxShadow: "0 0 0 10px rgba(179,49,26,.18)", duration: 1.2, yoyo: true, repeat: 3, ease: "sine.inOut" }, 22.5);
""" + fade_edges("h", "h-wrap"), """
.h-eb { position: absolute; left: 85px; top: 90px; font-size: 24px; color: #b3311a; opacity: 0; }
.h-ti { position: absolute; left: 85px; top: 128px; font-size: 84px; opacity: 0; }
.pipe { position: absolute; left: 85px; right: 85px; top: 300px; display: flex; align-items: stretch; }
.node { width: 254px; background: #fbfaf6; border: 2px solid #d9d2c3; border-radius: 18px; padding: 22px 22px; opacity: 0; }
.node .n { font-size: 18px; color: #6b6458; }
.node .t { font-size: 30px; font-weight: 600; line-height: 1.12; margin-top: 10px; }
.node .s { font-size: 26px; color: #6b6458; margin-top: 10px; line-height: 1.3; }
#h-n5 .n, #h-n5 .s { color: inherit; opacity: .8; }
.arr { width: 45px; display: flex; align-items: center; justify-content: center; font-size: 32px; color: #b3311a; opacity: 0; }
.panel { position: absolute; left: 85px; right: 85px; top: 590px; opacity: 0; }
.stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; }
.stats b { display: block; font-size: 120px; line-height: 1; font-weight: 400; }
.stats span { display: block; font-size: 26px; color: #3b372f; margin-top: 10px; max-width: 470px; line-height: 1.3; }
.map .row { display: grid; grid-template-columns: 520px 80px 1fr; align-items: center; font-size: 40px; padding: 18px 0; border-bottom: 1px solid #d9d2c3; opacity: 0; }
.map .q { font-family: "SL Serif", serif; font-size: 56px; }
.map .ar { color: #b3311a; font-size: 44px; }
.map .a { color: #3b372f; font-size: 34px; }
.rules { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; }
.rules .k { font-size: 22px; color: #6b6458; }
.rules ul { list-style: none; padding: 0; margin: 16px 0 0; }
.rules li { font-size: 34px; padding: 12px 0; border-bottom: 1px solid #d9d2c3; display: flex; justify-content: space-between; gap: 20px; }
.rules li em { font-style: normal; font-family: "SL Mono", monospace; font-size: 24px; color: #6b6458; align-self: center; }
.rules .badge { background: #15130f; color: #f5f2eb; border-radius: 22px; padding: 34px 40px; }
.rules .badge .k { color: #cfc8ba; }
.rules .badge .big { font-size: 64px; margin-top: 12px; line-height: 1.05; }
.rules .badge .small { font-size: 28px; color: #e3ddd0; margin-top: 16px; line-height: 1.35; }
""")

# ---------------------------------------------------------------- IMPACT
scene_file("impact", """
    <div class="paper"></div>
    <div id="i-wrap" style="position:absolute;inset:0">
      <div class="i-lines serif">
        <div class="ln"><span id="i-1">Before you buy it.</span></div>
        <div class="ln"><span id="i-2">Before you sell it.</span></div>
        <div class="ln big"><span id="i-3" class="red" style="font-style:italic">Look twice.</span></div>
      </div>
    </div>
""", """
    tl.fromTo("#i-1", { yPercent: 110 }, { yPercent: 0, duration: 0.7, ease: "power4.out" }, 0.35);
    tl.fromTo("#i-2", { yPercent: 110 }, { yPercent: 0, duration: 0.7, ease: "power4.out" }, 1.2);
    tl.fromTo("#i-3", { yPercent: 110 }, { yPercent: 0, duration: 0.8, ease: "power4.out" }, 2.1);
    tl.to("#i-wrap", { opacity: 0, duration: 0.4, ease: "power2.in" }, D - 0.45);
""", """
.i-lines { position: absolute; left: 230px; top: 210px; font-size: 128px; line-height: 1.02; }
.i-lines .ln { overflow: hidden; padding-bottom: 12px; }
.i-lines .ln span { display: inline-block; }
.i-lines .big { font-size: 190px; margin-top: 10px; }
""")

# ---------------------------------------------------------------- CLOSE
scene_file("close", f"""
    <div class="paper"></div>
    <div id="z-wrap" style="position:absolute;inset:0">
      <div class="lockup" style="top:250px">{MARK_SVG.format(p="z")}<div id="z-wm" class="serif wm">Second<i>Look</i></div></div>
      <div id="z-tag" class="serif tag" style="top:520px">Look twice before you buy it used.</div>
      <div id="z-links">
        <div><span class="mono k">Try it</span><span class="v">secondlook-nu.vercel.app</span></div>
        <div><span class="mono k">Code</span><span class="v">github.com/Sidd927/secondlook</span></div>
      </div>
      <div id="z-foot" class="mono" data-layout-ignore>Built for IceHacks 2026 · Recall data: U.S. Consumer Product Safety Commission</div>
    </div>
""", lockup_anim("z", 0.15) + """
    show("#z-tag", 1.2, undefined, 18);
    tl.fromTo("#z-links > div", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.25, ease: "power3.out" }, 2.0);
    show("#z-foot", 2.8);
    tl.fromTo("#z-wrap .lockup", { scale: 1 }, { scale: 1.02, duration: 4.5, ease: "none" }, 1.6);
""", LOCKUP_CSS + """
#z-links { position: absolute; left: 0; right: 0; top: 660px; display: flex; justify-content: center; gap: 40px; }
#z-links > div { background: #fbfaf6; border: 1px solid #d9d2c3; border-radius: 16px; padding: 20px 30px; display: flex; gap: 20px; align-items: baseline; opacity: 0; }
#z-links .k { font-size: 20px; color: #b3311a; }
#z-links .v { font-size: 36px; font-weight: 500; }
#z-foot { position: absolute; left: 0; right: 0; top: 820px; text-align: center; font-size: 19px; color: #6b6458; opacity: 0; }
""")

# ---------------------------------------------------------------- CAPTIONS + SRT
lines = {l["id"]: l for l in json.load(open(ROOT / "vo/durations.json"))}


def chunks(text, maxlen=70):
    """Split a caption into readable chunks at sentence/clause boundaries."""
    text = text.replace("U.S.", "U\u2024S\u2024")  # protect the abbreviation from sentence splitting
    parts = re.split(r"(?<=[.?!])\s+|(?<=[.?!][\u201d])\s+", text)
    out = []
    for p in parts:
        while len(p) > maxlen:
            cut = p.rfind(", ", 0, maxlen)
            cut = cut + 1 if cut > 20 else p.rfind(" ", 0, maxlen)
            out.append(p[:cut].strip())
            p = p[cut:].strip()
        if p:
            out.append(p)
    # merge very short tails into the previous chunk when it still fits
    merged = []
    for c in out:
        if merged and len(merged[-1]) + len(c) + 1 <= 84 and len(c) < 24:
            merged[-1] += " " + c
        else:
            merged.append(c)
    return [m.replace("\u2024", ".") for m in merged]


cues = []
for lid, start in sorted(VO.items(), key=lambda kv: kv[1]):
    l = lines[lid]
    parts = chunks(l["caption"])
    total_chars = sum(len(p) for p in parts)
    t = start
    for p in parts:
        d = l["dur"] * len(p) / total_chars
        cues.append((round(t, 3), round(t + d, 3), p))
        t += d

cap_divs, cap_js = [], []
for i, (a, b, text) in enumerate(cues):
    nxt = cues[i + 1][0] if i + 1 < len(cues) else TOTAL
    dur = round(min(b + 0.25, nxt - 0.05) - a, 3)
    cap_divs.append(f'<div id="cap{i}" class="clip cap" data-start="{a}" data-duration="{dur}" data-track-index="1"><span>{text}</span></div>')
    cap_js.append(f'tl.fromTo("#cap{i} span", {{ opacity: 0, y: 6 }}, {{ opacity: 1, y: 0, duration: 0.18, ease: "power2.out" }}, {a});')

(COMP / "captions.html").write_text(f"""<template>
  <style>
{FONTS}
#root {{ position: absolute; inset: 0; pointer-events: none; }}
.cap {{ position: absolute; left: 0; right: 0; bottom: 64px; display: flex; justify-content: center; }}
.cap span {{ max-width: 1500px; text-align: center; background: rgba(21,19,15,.86); color: #f5f2eb; font-family: "SL Sans", sans-serif;
  font-weight: 500; font-size: 34px; line-height: 1.3; padding: 12px 26px; border-radius: 12px; }}
  </style>
  <div id="root" data-composition-id="captions" data-width="1920" data-height="1080">
    {''.join(cap_divs)}
  </div>
  <script>
    const tl = gsap.timeline({{ paused: true }});
    {' '.join(cap_js)}
    window.__timelines["captions"] = tl;
  </script>
</template>
""")


def srt_time(s):
    ms = int(round(s * 1000))
    return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"


srt = "\n".join(f"{i + 1}\n{srt_time(a)} --> {srt_time(b)}\n{t}\n" for i, (a, b, t) in enumerate(cues))
(ROOT / "final" / "SecondLook_IceHacks_2026_Demo.srt").write_text(srt)

# ---------------------------------------------------------------- INDEX
hosts = "\n".join(
    f'      <div id="{sid}" data-composition-id="{sid}" data-composition-src="compositions/{sid}.html" data-start="{s}" '
    f'data-duration="{round(e - s, 3)}" data-track-index="1" data-track-kind="graphics" data-width="1920" data-height="1080" style="z-index:1"></div>'
    for sid, s, e in SCENES
)
(FILM / "index.html").write_text(f"""<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
    <style>
      * {{ margin: 0; padding: 0; box-sizing: border-box; }}
      html, body {{ margin: 0; width: 1920px; height: 1080px; overflow: hidden; background: #f5f2eb; }}
      #bg {{ position: absolute; inset: 0; background: #f5f2eb; }}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="{TOTAL}" data-width="1920" data-height="1080">
      <div id="bg"></div>
{hosts}
      <div id="captions" data-composition-id="captions" data-composition-src="compositions/captions.html" data-start="0" data-duration="{TOTAL}"
        data-track-index="2" data-track-kind="captions" data-width="1920" data-height="1080" style="z-index:5"></div>
      <audio id="soundtrack" class="clip" data-start="0" data-duration="{TOTAL}" data-track-index="3" data-volume="1" src="assets/audio/mix.wav"></audio>
    </div>
    <script>
      window.__timelines["main"] = gsap.timeline({{ paused: true }});
    </script>
  </body>
</html>
""")
print(f"scenes: {len(SCENES)}, captions: {len(cues)}, total {TOTAL}s")
