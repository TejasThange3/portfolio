"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The opening, once per visit: the footer's terrain, played forwards.
 * Flat lines draw across the dark screen, rise into the name in Marathi, reshape into English,
 * and then the English name flies into the hero heading's place while the page comes up around it.
 *
 * The head script in layout.tsx decides whether it plays (first page of a visit, dark theme, motion allowed)
 * by setting data-intro on <html>; CSS shows this overlay from the first paint, so the page never flashes.
 * A click, key, wheel or touch skips it. If the script never runs, CSS hides the overlay after a few seconds.
 */

const RISE = 350, RISE_LEN = 650; // lines lift into तेजस ठाणगे
const MORPH = 1350, MORPH_LEN = 600; // then reshape into Tejas Thange
const EXIT = 2000, FLY = 700; // then the name flies into the hero
const SWEEP = 0.45; // how far behind the left edge the right edge moves (a wave, not a switch)

export function Intro({ en, mr }: { en: string; mr: string }) {
  const [gone, setGone] = useState(false);
  const shell = useRef<HTMLDivElement>(null);
  const cvs = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const box = shell.current, canvas = cvs.current;
    if (!root.dataset.intro || !box || !canvas) return; // not this time: CSS keeps the overlay hidden
    const ctx = canvas.getContext("2d");
    if (!ctx) { box.style.display = "none"; release(); return; }
    box.classList.add("live"); // JS is running: the CSS failsafe stands down

    const cs = getComputedStyle(root);
    const ink = cs.getPropertyValue("--ink").trim() || "#ededea";
    const [gr, gg, gb] = (cs.getPropertyValue("--glow").trim() || "82 140 255").split(/\s+/).map(Number);
    const W = innerWidth, H = innerHeight;
    const small = W < 640;
    const gap = small ? 3.5 : 5, step = small ? 2 : 3, amp = gap * 1.15;
    const cols = Math.ceil(W / step) + 1, rows = Math.floor(H / gap) + 1;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    canvas.style.width = `${W}px`; canvas.style.height = `${H}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const A = new Float32Array(rows * cols), B = new Float32Array(rows * cols);
    const texture = new Float32Array(rows * cols);
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      texture[r * cols + c] = Math.sin(c * step * 0.031 + r * 1.7) * 0.5 + Math.sin(c * step * 0.013 - r * 0.9) * 0.5;
    }
    // Where the English name sits on screen, so it can fly to the heading.
    let box0 = { x: 0, y: 0, w: 0, h: 0 };
    let ready = -1; // when the masks were built (fonts can take a moment)

    const mask = (into: Float32Array, text: string, font: string, weight: number, track: number, thicken: number) => {
      const m = document.createElement("canvas").getContext("2d", { willReadFrequently: true })!;
      m.canvas.width = W; m.canvas.height = H;
      m.font = `${weight} 100px ${font}`;
      if ("letterSpacing" in m) m.letterSpacing = `${track * 100}px`;
      const k = m.measureText(text);
      const fs = Math.min((100 * W * (small ? 0.88 : 0.74)) / k.width, H * (small ? 0.16 : 0.24));
      m.font = `${weight} ${fs}px ${font}`;
      if ("letterSpacing" in m) m.letterSpacing = `${track * fs}px`;
      const mt = m.measureText(text);
      const asc = mt.actualBoundingBoxAscent, desc = mt.actualBoundingBoxDescent;
      const baseline = H / 2 + (asc - desc) / 2;
      m.textAlign = "center";
      m.filter = `blur(${gap * 0.3}px)`;
      m.fillStyle = m.strokeStyle = "#fff";
      m.fillText(text, W / 2, baseline);
      if (thicken) { m.lineWidth = fs * thicken; m.lineJoin = "round"; m.strokeText(text, W / 2, baseline); }
      const data = m.getImageData(0, 0, W, H).data;
      for (let r = 0; r < rows; r++) {
        const y = Math.min(H - 1, Math.round(r * gap + amp));
        for (let c = 0; c < cols; c++) into[r * cols + c] = data[(y * W + Math.min(W - 1, c * step)) * 4 + 3] / 255;
      }
      return { x: W / 2 - mt.width / 2, y: baseline - asc - amp, w: mt.width, h: asc + desc };
    };

    let cancelled = false;
    (async () => {
      const cab = cs.getPropertyValue("--font-cabinet").trim() || "sans-serif";
      const dev = cs.getPropertyValue("--font-marathi").trim() || "serif";
      try { await Promise.all([document.fonts.load(`800 100px ${cab}`), document.fonts.load(`400 100px ${dev}`, mr)]); } catch {}
      if (cancelled) return;
      mask(A, mr, dev, 400, 0, 0.05); // Tiro Devanagari has one, light weight: stroke it to stand as tall as the English
      box0 = mask(B, en, cab, 800, -0.035, 0);
      ready = performance.now();
    })();

    const ease = (t: number) => 1 - Math.pow(1 - t, 3);
    const inOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const clamp = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);
    const ys = new Float32Array(cols);
    const wa = new Float32Array(cols), wb = new Float32Array(cols);
    const mid = rows / 2;
    const jitter = Float32Array.from({ length: rows }, () => Math.random() * 220);

    type Signal = { r: number; x: number; v: number; len: number };
    const signals: Signal[] = Array.from({ length: small ? 4 : 7 }, () => ({
      r: Math.floor(mid + (Math.random() - 0.5) * rows * 0.5), x: -Math.random() * W * 0.5, v: 0.5 + Math.random() * 0.6, len: 90 + Math.random() * 160,
    }));

    let start = -1, offset = 0, raf = 0, exiting = false, exitAt = 0, last = 0;

    const frame = (now: number) => {
      if (start < 0) start = now;
      // The rise waits for the fonts; everything after it shifts with it.
      if (ready < 0) offset = Math.max(offset, now - start - RISE + 1);
      const t = now - start - offset;
      const dt = last ? Math.min(50, now - last) : 16; last = now;
      ctx.clearRect(0, 0, W, H);
      // On the way out only the letters travel: the ground and its signals sink away first.
      const groundK = exiting ? clamp(1 - (now - exitAt) / 220) : 1;

      for (let c = 0; c < cols; c++) {
        const lag = (c / cols) * SWEEP;
        const rise = ready < 0 ? 0 : ease(clamp((t - RISE - lag * RISE_LEN) / RISE_LEN));
        const morph = inOut(clamp((t - MORPH - lag * MORPH_LEN) / MORPH_LEN));
        wa[c] = rise * (1 - morph); wb[c] = morph;
      }
      for (const s of signals) { s.x += s.v * dt; if (s.x - s.len > W) { s.x = -Math.random() * W * 0.3; s.r = Math.floor(mid + (Math.random() - 0.5) * rows * 0.5); } }

      for (let r = 0; r < rows; r++) {
        // each row draws left to right, a little out of step with its neighbours
        const p = ease(clamp((t - jitter[r]) / 650));
        if (p <= 0) continue;
        const lastC = Math.min(cols - 1, Math.ceil((p * W) / step));
        const base = r * gap + amp;
        const fade = 1 - Math.abs(r - mid) / mid; // the screen's edges stay quieter than the middle
        for (let c = 0; c <= lastC; c++) {
          const i = r * cols + c;
          const f = A[i] * wa[c] + B[i] * wb[c];
          ys[c] = base - f * amp - texture[i] * gap * 0.22 * fade - Math.sin(c * step * 0.007 - t * 0.0011 + r * 0.22) * gap * 0.2;
        }
        ctx.strokeStyle = ink;
        if (groundK > 0) {
          ctx.beginPath(); ctx.moveTo(0, ys[0]);
          for (let c = 1; c <= lastC; c++) ctx.lineTo(c * step, ys[c]);
          ctx.globalAlpha = (0.04 + 0.14 * fade) * groundK; ctx.lineWidth = 1; ctx.stroke();
        }

        ctx.beginPath();
        let open = false, any = false;
        for (let c = 0; c <= lastC; c++) {
          const i = r * cols + c;
          const hi = A[i] * wa[c] + B[i] * wb[c] > 0.35;
          if (hi && !open) { ctx.moveTo(c * step, ys[c]); open = true; any = true; }
          else if (hi) ctx.lineTo(c * step, ys[c]);
          else open = false;
        }
        if (any) { ctx.globalAlpha = 0.92; ctx.lineWidth = gap * 0.42; ctx.stroke(); }

        for (const s of signals) {
          if (s.r !== r || groundK <= 0) continue;
          const c0 = Math.max(0, Math.floor((s.x - s.len) / step)), c1 = Math.min(lastC, Math.ceil(s.x / step));
          if (c1 - c0 < 2) continue;
          const g = ctx.createLinearGradient(s.x - s.len, 0, s.x, 0);
          g.addColorStop(0, `rgba(${gr},${gg},${gb},0)`); g.addColorStop(0.8, `rgba(${gr},${gg},${gb},0.85)`); g.addColorStop(1, "#fff");
          ctx.beginPath(); ctx.moveTo(c0 * step, ys[c0]);
          for (let c = c0 + 1; c <= c1; c++) ctx.lineTo(c * step, ys[c]);
          ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = groundK; ctx.strokeStyle = g; ctx.lineWidth = Math.max(1.4, gap * 0.36); ctx.stroke();
          ctx.globalCompositeOperation = "source-over"; ctx.strokeStyle = ink;
        }
      }
      ctx.globalAlpha = 1;

      if (!exiting && t >= EXIT) exit(false);
      raf = requestAnimationFrame(frame);
    };

    function release() {
      delete root.dataset.intro; // the page's own entrance (.enter) starts now
      window.dispatchEvent(new Event("intro:done"));
    }
    function finish() {
      cancelAnimationFrame(raf);
      release();
      setGone(true);
    }

    function exit(skipped: boolean) {
      if (exiting) return;
      exiting = true;
      exitAt = performance.now();
      off();
      box!.style.pointerEvents = "none"; // the page is live from here
      const veil = box!.querySelector<HTMLElement>(".intro-veil")!;
      const target = document.querySelector<HTMLElement>("[data-intro-target]");
      // The heading's own entrance would fade it in a second time; the landing is its entrance.
      const wrap = !skipped ? target?.closest<HTMLElement>(".enter") : null;
      if (wrap) { wrap.style.animation = "none"; wrap.style.opacity = "1"; wrap.style.transform = "none"; }
      const r = target?.getBoundingClientRect();
      const onScreen = r && r.width > 0 && r.top > 0 && r.bottom < H;
      if (skipped || !onScreen || !box0.w) {
        release();
        box!.animate([{ opacity: 1 }, { opacity: 0 }], { duration: skipped ? 280 : 600, easing: "ease-out", fill: "forwards" }).finished.then(finish, finish);
        return;
      }
      // Fly: map the drawn English name's box onto the heading's box.
      const s = r.width / box0.w;
      const tx = r.left - box0.x * s, ty = r.top + r.height / 2 - (box0.y + box0.h / 2) * s;
      release();
      // The real heading waits for the lines to land, then takes over from them.
      target!.animate([{ opacity: 0 }, { opacity: 0, offset: 0.62 }, { opacity: 1 }], { duration: FLY, easing: "linear" });
      veil.animate([{ opacity: 1 }, { opacity: 0 }], { duration: FLY * 0.8, easing: "ease-out", fill: "forwards" });
      canvas!.animate(
        [
          { transform: "none", opacity: 1 },
          { transform: `translate(${tx}px, ${ty}px) scale(${s})`, opacity: 1, offset: 0.7 },
          { transform: `translate(${tx}px, ${ty}px) scale(${s})`, opacity: 0 },
        ],
        { duration: FLY, easing: "cubic-bezier(0.65, 0, 0.35, 1)", fill: "forwards" },
      ).finished.then(finish, finish);
    }

    const skip = () => exit(true);
    const keys = (e: KeyboardEvent) => { if (!e.metaKey && !e.ctrlKey && !e.altKey) skip(); };
    const off = () => {
      removeEventListener("pointerdown", skip); removeEventListener("wheel", skip); removeEventListener("touchstart", skip); removeEventListener("keydown", keys);
    };
    addEventListener("pointerdown", skip); addEventListener("wheel", skip, { passive: true }); addEventListener("touchstart", skip, { passive: true }); addEventListener("keydown", keys);
    raf = requestAnimationFrame(frame);

    return () => { cancelled = true; cancelAnimationFrame(raf); off(); };
  }, [en, mr]);

  if (gone) return null;
  return (
    <div ref={shell} aria-hidden className="intro">
      <div className="intro-veil" />
      <canvas ref={cvs} className="intro-canvas" />
    </div>
  );
}
