"use client";

import { useEffect, useRef } from "react";

/**
 * The name as terrain: edge-to-edge scan lines that thicken and lift where the letters stand,
 * like a relief map (GanScape's output) seen face on. The cursor lifts the ground beneath it.
 * It's alive while on screen: the letters breathe, the ground swells, and signals in this visit's
 * colour run along the lines. It draws in once when scrolled into view, and stops
 * entirely when scrolled away or the tab is hidden.
 */
export function NameTerrain({ full, short }: { full: string; short: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const cvs = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const box = wrap.current, canvas = cvs.current;
    if (!box || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;

    let W = 0, H = 0, gap = 6, amp = 14, step = 3, cols = 0, rows = 0, top = 0;
    let field = new Float32Array(0);
    let texture = new Float32Array(0);
    let ink = "#ededea", ground = ink, groundAlpha = 1, light = false;
    let glow: [number, number, number] = [82, 140, 255];
    // Signals: short pulses of this visit's colour travelling along the lines, like data down a wire.
    type Signal = { r: number; x: number; v: number; len: number };
    let signals: Signal[] = [];
    const spawn = (s: Signal, fresh: boolean) => {
      s.r = Math.floor(Math.random() * rows);
      s.v = 0.09 + Math.random() * 0.2;
      s.len = 70 + Math.random() * 150;
      s.x = fresh ? Math.random() * W : -Math.random() * W * 0.6;
      return s;
    };
    let raf = 0, introStart = -1, visible = false, built = false;
    const pointer = { x: -999, y: -999, s: 0, target: 0 };

    const readColors = () => {
      const root = document.documentElement, cs = getComputedStyle(root);
      const [r, g, b] = (cs.getPropertyValue("--glow").trim() || "82 140 255").split(/\s+/).map(Number);
      glow = [r, g, b];
      // Both themes draw the name in white: in light mode the footer behind it turns into a deep band
      // of this visit's colour (globals.css), so the same luminous look carries over.
      light = false;
      ink = root.dataset.theme === "light" ? "#ffffff" : cs.getPropertyValue("--ink").trim() || "#ededea";
      ground = ink; groundAlpha = root.dataset.theme === "light" ? 1.6 : 1;
    };

    const build = async () => {
      const family = getComputedStyle(document.documentElement).getPropertyValue("--font-cabinet").trim() || "sans-serif";
      try { await document.fonts.load(`800 100px ${family}`); } catch {}
      W = box.clientWidth;
      if (!W) return;
      const text = W < 640 ? short : full;
      gap = W < 640 ? 4 : 5;
      amp = gap * 1.1;
      step = W < 640 ? 2 : 3;

      const m = document.createElement("canvas").getContext("2d", { willReadFrequently: true })!;
      m.font = `800 100px ${family}`;
      const fs = Math.floor((100 * W * 0.97) / m.measureText(text).width);
      H = Math.round(fs * 1.02 + amp);
      top = 4;
      m.canvas.width = W; m.canvas.height = H;
      m.font = `800 ${fs}px ${family}`;
      m.textAlign = "center";
      m.textBaseline = "alphabetic";
      m.filter = `blur(${gap * 0.3}px)`;
      m.fillStyle = "#fff";
      m.fillText(text, W / 2, H - fs * 0.215);
      const data = m.getImageData(0, 0, W, H).data;

      cols = Math.ceil(W / step) + 1;
      rows = Math.floor((H - top) / gap) + 1;
      field = new Float32Array(rows * cols);
      texture = new Float32Array(rows * cols);
      for (let r = 0; r < rows; r++) {
        const y = Math.min(H - 1, Math.round(top + r * gap + amp));
        for (let c = 0; c < cols; c++) {
          const x = Math.min(W - 1, c * step);
          field[r * cols + c] = data[(y * W + x) * 4 + 3] / 255;
          // fixed, gentle ground texture so the flat land still reads as terrain
          texture[r * cols + c] = Math.sin(x * 0.031 + r * 1.7) * 0.5 + Math.sin(x * 0.013 - r * 0.9) * 0.5;
        }
      }

      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      built = true;
      readColors();
      signals = Array.from({ length: Math.max(3, Math.round(W / 170)) }, () => spawn({ r: 0, x: 0, v: 0, len: 0 }, true));
      if (still || introStart >= 0) draw(Infinity);
      else if (visible) kick();
    };

    const ease = (t: number) => 1 - Math.pow(1 - t, 3);
    const ys = new Float32Array(4096);

    let lastNow = 0;
    const draw = (now: number) => {
      ctx.clearRect(0, 0, W, H);
      const t = introStart < 0 ? 0 : now - introStart;
      // The footer breathes: a 5.2s cycle, in step with the glow behind it (footer-breathe in globals.css).
      const live = !still && Number.isFinite(now);
      const breath = live ? 0.5 - 0.5 * Math.cos((now / 5200) * Math.PI * 2) : 0;
      const dt = live && lastNow ? Math.min(50, now - lastNow) : 0;
      lastNow = live ? now : 0;
      for (const s of signals) { s.x += s.v * dt; if (s.x - s.len > W) spawn(s, false); }
      const sigma2 = 2 * 120 * 120;
      let drawing = false;
      for (let r = 0; r < rows; r++) {
        const p = still ? 1 : Math.min(1, Math.max(0, (t - r * 22) / 1100));
        if (p <= 0) { drawing = true; continue; }
        if (p < 1) drawing = true;
        const base = top + r * gap + amp;
        const last = Math.min(cols - 1, Math.ceil((ease(p) * W) / step));
        for (let c = 0; c <= last; c++) {
          const x = c * step, i = r * cols + c;
          let lift = field[i] * amp * (1 + 0.45 * breath) + texture[i] * gap * 0.22;
          // the ground swells slowly, like water under the letters
          if (live) lift += Math.sin(x * 0.007 - now * 0.0009 + r * 0.22) * gap * 0.22;
          if (pointer.s > 0.001) {
            const dx = x - pointer.x, dy = base - pointer.y;
            lift += Math.exp(-(dx * dx + dy * dy) / sigma2) * amp * 3.2 * pointer.s;
          }
          ys[c] = base - lift;
        }
        // Faint ground lines, strongest near the bottom so the letters rise out of it…
        ctx.beginPath();
        ctx.moveTo(0, ys[0]);
        for (let c = 1; c <= last; c++) ctx.lineTo(c * step, ys[c]);
        ctx.strokeStyle = ground; ctx.globalAlpha = (0.05 + 0.13 * (r / rows)) * groundAlpha; ctx.lineWidth = 1;
        ctx.stroke();
        // …and solid where they cross a letter.
        ctx.beginPath();
        let open = false;
        for (let c = 0; c <= last; c++) {
          const hi = field[r * cols + c] > 0.35;
          if (hi && !open) { ctx.moveTo(c * step, ys[c]); open = true; }
          else if (hi) ctx.lineTo(c * step, ys[c]);
          else open = false;
        }
        ctx.strokeStyle = ink; ctx.globalAlpha = 0.92; ctx.lineWidth = gap * 0.42;
        ctx.stroke();
        // Any signals on this line, drawn as a fading tail with a bright head.
        for (const sg of signals) {
          if (sg.r !== r || !live) continue;
          const c0 = Math.max(0, Math.floor((sg.x - sg.len) / step)), c1 = Math.min(last, Math.ceil(sg.x / step));
          if (c1 - c0 < 2) continue;
          const [gr, gg, gb] = glow;
          const head = light ? `rgba(${gr * 0.5 | 0},${gg * 0.5 | 0},${gb * 0.5 | 0},1)` : "rgba(255,255,255,1)";
          const grad = ctx.createLinearGradient(sg.x - sg.len, 0, sg.x, 0);
          grad.addColorStop(0, `rgba(${gr},${gg},${gb},0)`);
          grad.addColorStop(0.8, `rgba(${gr},${gg},${gb},0.85)`);
          grad.addColorStop(1, head);
          ctx.beginPath();
          ctx.moveTo(c0 * step, ys[c0]);
          for (let c = c0 + 1; c <= c1; c++) ctx.lineTo(c * step, ys[c]);
          ctx.globalCompositeOperation = light ? "source-over" : "lighter";
          ctx.strokeStyle = grad; ctx.globalAlpha = 1; ctx.lineWidth = Math.max(1.4, gap * 0.36);
          ctx.stroke();
          ctx.globalCompositeOperation = "source-over";
        }
        ctx.globalAlpha = 1;
      }
      return drawing;
    };

    const tick = (now: number) => {
      raf = 0;
      if (introStart < 0) introStart = now;
      pointer.s += (pointer.target - pointer.s) * 0.12;
      draw(now);
      // Alive while on screen; the IntersectionObserver and visibilitychange stop it otherwise.
      if (visible && !document.hidden) raf = requestAnimationFrame(tick);
    };
    const kick = () => { if (!raf && built && visible && !still) raf = requestAnimationFrame(tick); };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || still) return;
      const r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top; pointer.target = 1;
      kick();
    };
    const onLeave = () => { pointer.target = 0; kick(); };

    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; lastNow = 0; kick(); }, { threshold: 0.05 });
    const onVis = () => { lastNow = 0; kick(); };
    document.addEventListener("visibilitychange", onVis);
    io.observe(canvas);
    let resizeTimer = 0;
    const ro = new ResizeObserver(() => {
      if (box.clientWidth === W) return;
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(build, 120);
    });
    ro.observe(box);
    const mo = new MutationObserver(() => { readColors(); if (built && introStart >= 0) draw(Infinity); });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    build();

    return () => {
      cancelAnimationFrame(raf); clearTimeout(resizeTimer);
      io.disconnect(); ro.disconnect(); mo.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, [full, short]);

  return (
    <div ref={wrap} className="w-full">
      <canvas ref={cvs} role="img" aria-label={full} className="block w-full" />
    </div>
  );
}
