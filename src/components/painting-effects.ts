import type { Effect } from "@/content/site";

/**
 * A light living layer over a painting. The rule for every effect: it must look like light
 * that belongs to the scene (tinted from the painting, low alpha, soft edges), never like
 * a graphic sitting on top of it.
 */

type P = { x: number; y: number; vx: number; vy: number; age: number; life: number; size: number; seed: number; e: number };

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

// Smooth pseudo-noise from a few incommensurate sines (cheap, no allocations).
const noise = (t: number, s: number) => (Math.sin(t * 0.9 + s) + Math.sin(t * 2.3 + s * 1.7) * 0.6 + Math.sin(t * 5.1 + s * 2.9) * 0.3) / 1.9;

/** One pre-rendered soft white disc, drawn tinted and scaled for every glow. */
function makeGlow() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  r.addColorStop(0, "rgba(255,255,255,1)");
  r.addColorStop(0.25, "rgba(255,255,255,0.45)");
  r.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = r;
  g.fillRect(0, 0, 64, 64);
  return c;
}

function spawn(ef: Effect, e: number, scale: number): P {
  const [x0, y0, x1, y1] = ef.area;
  const p: P = { x: rand(x0, x1), y: rand(y0, y1), vx: 0, vy: 0, age: 0, life: 2, size: 1, seed: Math.random() * 1000, e };
  switch (ef.kind) {
    case "embers":
      p.vy = -rand(0.035, 0.085); p.vx = rand(-0.008, 0.01); p.life = rand(1.4, 3.2); p.size = rand(0.8, 1.7) * scale; break;
    case "shimmer":
      p.vx = rand(-0.004, 0.004); p.life = rand(0.9, 2.4); p.size = rand(4, 13) * scale; break;
    case "twinkle":
      p.life = rand(2.2, 4.5); p.size = rand(0.7, 1.5) * scale; break;
    case "fireflies":
      p.vx = rand(-0.008, 0.008); p.vy = rand(-0.005, 0.005); p.life = rand(5, 9); p.size = rand(0.8, 1.4) * scale; break;
    case "motes":
      p.vx = rand(0.004, 0.014); p.vy = rand(-0.006, 0.002); p.life = rand(5, 10); p.size = rand(0.6, 1.6) * scale; break;
    case "petals":
      p.x = rand(x0 - 0.1, x1); p.vx = rand(0.025, 0.05); p.vy = rand(-0.008, 0.012); p.life = rand(5, 9); p.size = rand(2.6, 4.2) * scale; break;
    case "seeds":
      p.x = rand(x0 - 0.1, x1); p.vx = rand(0.015, 0.035); p.vy = rand(-0.014, 0.004); p.life = rand(6, 11); p.size = rand(3.2, 5) * scale; break;
    case "heat":
      p.life = Infinity; break;
  }
  return p;
}

export type Frame = { iw: number; ih: number; px: number; py: number };

/** Runs a canvas overlay for one painting. Returns a cleanup function. */
export function runEffects(canvas: HTMLCanvasElement, effects: Effect[], frame: Frame) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};
  const glow = makeGlow();
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  let cw = 0, ch = 0, ox = 0, oy = 0, dw = 0, dh = 0, scale = 1;

  const layout = () => {
    const r = canvas.getBoundingClientRect();
    cw = r.width; ch = r.height;
    canvas.width = Math.round(cw * dpr); canvas.height = Math.round(ch * dpr);
    const s = Math.max(cw / frame.iw, ch / frame.ih);
    dw = frame.iw * s; dh = frame.ih * s;
    ox = (cw - dw) * frame.px; oy = (ch - dh) * frame.py;
    scale = Math.max(0.7, cw / 1100);
  };
  layout();

  const parts: P[] = [];
  effects.forEach((ef, ei) => {
    for (let i = 0; i < ef.count; i++) {
      const p = spawn(ef, ei, scale);
      if (Number.isFinite(p.life)) p.age = Math.random() * p.life; // start mid-flight
      parts.push(p);
    }
  });

  const X = (nx: number) => ox + nx * dw;
  const Y = (ny: number) => oy + ny * dh;
  const dot = (x: number, y: number, r: number, rgb: string, a: number) => {
    if (a <= 0.003) return;
    ctx.globalAlpha = Math.min(1, a);
    ctx.fillStyle = rgb;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  };
  const halo = (x: number, y: number, r: number, a: number) => {
    if (a <= 0.003) return;
    ctx.globalAlpha = Math.min(1, a);
    ctx.drawImage(glow, x - r, y - r, r * 2, r * 2);
  };

  let raf = 0, last = performance.now(), running = true, t = 0;

  const draw = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now; t += dt;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, cw, ch);

    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      const ef = effects[p.e];
      const tint = ef.tint ?? [255, 236, 200];
      p.age += dt;
      if (p.age > p.life || ((ef.kind === "petals" || ef.kind === "seeds") && p.x > ef.area[2] + 0.12)) {
        parts[i] = spawn(ef, p.e, scale);
        continue;
      }
      const k = p.age / p.life;
      const fade = Math.min(1, k * 4) * Math.min(1, (1 - k) * 3);

      switch (ef.kind) {
        case "heat": {
          // The fire's own light, breathing: a large soft glow whose strength wanders like flame.
          const [x0, y0, x1, y1] = ef.area;
          const cx = X((x0 + x1) / 2), cy = Y((y0 + y1) / 2);
          const r = Math.max((x1 - x0) * dw, (y1 - y0) * dh) * (0.62 + noise(t, 1) * 0.04);
          const a = 0.11 + noise(t * 1.4, 7) * 0.06;
          ctx.globalCompositeOperation = "screen";
          ctx.save();
          ctx.globalAlpha = a;
          ctx.filter = "none";
          const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
          g.addColorStop(0, `rgb(${tint[0]},${tint[1]},${tint[2]})`);
          g.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
          break;
        }
        case "embers": {
          // Rising sparks: buoyant, pushed around by turbulence, cooling from white to deep red.
          p.vx += noise(t * 2, p.seed) * 0.02 * dt;
          p.vx *= 0.995; p.vy *= 0.997;
          p.x += p.vx * dt; p.y += p.vy * dt;
          const x = X(p.x), y = Y(p.y);
          const c = k < 0.35
            ? [255, lerp(244, 176, k / 0.35), lerp(214, 92, k / 0.35)]
            : [lerp(255, 196, (k - 0.35) / 0.65), lerp(176, 58, (k - 0.35) / 0.65), lerp(92, 24, (k - 0.35) / 0.65)];
          const flick = 0.55 + 0.45 * Math.max(0, Math.sin(t * 13 + p.seed));
          const a = fade * flick * Math.pow(1 - k, 0.5);
          ctx.globalCompositeOperation = "lighter";
          halo(x, y, p.size * 6, a * 0.4);
          // a hair-thin streak along the direction of travel
          ctx.globalAlpha = a * 0.5;
          ctx.strokeStyle = `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
          ctx.lineWidth = p.size * 0.8; ctx.lineCap = "round";
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - p.vx * dw * 0.06, y - p.vy * dh * 0.06); ctx.stroke();
          dot(x, y, p.size, `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`, a);
          break;
        }
        case "shimmer": {
          // Light breaking on water: short, thin, soft-ended horizontal strokes in the painting's own colour.
          p.x += p.vx * dt;
          const x = X(p.x), y = Y(p.y);
          const a = 0.5 * Math.pow(Math.sin(Math.PI * k), 2);
          const len = p.size * (0.7 + 0.3 * Math.sin(Math.PI * k));
          const gr = ctx.createLinearGradient(x - len, y, x + len, y);
          const col = `${tint[0]},${tint[1]},${tint[2]}`;
          gr.addColorStop(0, `rgba(${col},0)`); gr.addColorStop(0.5, `rgba(${col},1)`); gr.addColorStop(1, `rgba(${col},0)`);
          ctx.globalCompositeOperation = "screen";
          ctx.globalAlpha = a;
          ctx.fillStyle = gr;
          ctx.fillRect(x - len, y - 0.75 * scale, len * 2, 1.5 * scale);
          break;
        }
        case "twinkle": {
          const x = X(p.x), y = Y(p.y);
          const a = 0.7 * Math.pow(Math.sin(Math.PI * k), 3);
          ctx.globalCompositeOperation = "lighter";
          halo(x, y, p.size * 6, a * 0.35);
          dot(x, y, p.size * 0.7, `rgb(${tint[0]},${tint[1]},${tint[2]})`, a);
          break;
        }
        case "fireflies": {
          p.vx += noise(t * 0.6, p.seed) * 0.0002; p.vy += noise(t * 0.5, p.seed + 3) * 0.00015;
          p.vx *= 0.99; p.vy *= 0.99; p.x += p.vx * dt; p.y += p.vy * dt;
          const x = X(p.x), y = Y(p.y);
          const blink = Math.pow(Math.max(0, Math.sin(t * 1.3 + p.seed)), 3);
          ctx.globalCompositeOperation = "lighter";
          halo(x, y, p.size * 7, blink * fade * 0.45);
          dot(x, y, p.size, "rgb(232,255,170)", blink * fade * 0.9);
          break;
        }
        case "motes": {
          // Pollen and dust catching the sun: tiny, slow, drifting with the breeze.
          p.x += (p.vx + noise(t * 0.4, p.seed) * 0.003) * dt;
          p.y += (p.vy + noise(t * 0.5, p.seed + 5) * 0.003) * dt;
          const x = X(p.x), y = Y(p.y);
          const a = fade * (0.35 + 0.25 * Math.sin(t * 2 + p.seed));
          ctx.globalCompositeOperation = "screen";
          halo(x, y, p.size * 3.2, a * 0.5);
          dot(x, y, p.size * 0.55, `rgb(${tint[0]},${tint[1]},${tint[2]})`, a);
          break;
        }
        case "petals": {
          p.x += (p.vx + Math.sin(t + p.seed) * 0.006) * dt; p.y += (p.vy + Math.cos(t * 1.3 + p.seed) * 0.006) * dt;
          const x = X(p.x), y = Y(p.y);
          ctx.globalCompositeOperation = "source-over";
          ctx.save(); ctx.translate(x, y); ctx.rotate(t * 1.5 + p.seed);
          ctx.globalAlpha = 0.9 * fade;
          ctx.fillStyle = p.seed % 3 < 1 ? "rgb(236,120,120)" : "rgb(206,46,36)";
          ctx.beginPath(); ctx.ellipse(0, 0, p.size * 1.4, p.size * Math.abs(Math.cos(t * 2 + p.seed)) * 0.9 + 0.3, 0, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
          break;
        }
        case "seeds": {
          p.x += (p.vx + Math.sin(t * 0.8 + p.seed) * 0.004) * dt; p.y += (p.vy + Math.cos(t * 0.6 + p.seed) * 0.004) * dt;
          const x = X(p.x), y = Y(p.y);
          ctx.globalCompositeOperation = "source-over";
          ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t + p.seed) * 0.5);
          ctx.globalAlpha = 0.85 * fade;
          ctx.strokeStyle = "rgb(255,255,255)"; ctx.lineWidth = 0.8;
          for (let j = 0; j < 7; j++) { const a = (j / 7) * Math.PI - Math.PI; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * p.size * 2, Math.sin(a) * p.size * 2); ctx.stroke(); }
          ctx.fillStyle = "rgb(250,250,245)"; ctx.beginPath(); ctx.arc(0, p.size * 0.3, p.size * 0.4, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
          break;
        }
      }
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    if (running) raf = requestAnimationFrame(draw);
  };

  const start = () => { if (!running) { running = true; last = performance.now(); raf = requestAnimationFrame(draw); } };
  const stop = () => { running = false; cancelAnimationFrame(raf); };

  raf = requestAnimationFrame(draw);

  const ro = new ResizeObserver(layout); ro.observe(canvas);
  const io = new IntersectionObserver(([en]) => (en.isIntersecting && !document.hidden ? start() : stop()));
  io.observe(canvas);
  const vis = () => (document.hidden ? stop() : start());
  document.addEventListener("visibilitychange", vis);

  return () => { stop(); ro.disconnect(); io.disconnect(); document.removeEventListener("visibilitychange", vis); };
}
