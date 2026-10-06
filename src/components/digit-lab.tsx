"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { Eraser } from "@phosphor-icons/react";

// A small CNN trained on MNIST: 5x5 conv (12) -> pool -> 5x5 conv (24) -> pool -> linear, 19,306 parameters.
// Every training digit also had an outlined ("hollow") twin, so it reads 2D outline digits as well as pen
// strokes, plus rotation, scale, shift and stroke-width augmentation for mouse drawings. Weights are float32
// in PyTorch order: c1.w, c1.b, c2.w, c2.b, fc.w, fc.b. Accuracies are on the 10,000 MNIST test digits
// (solid, then their outlined twins), measured with the same per-tensor quantization applied here.
const WEIGHTS_URL = "/lab/mnist-cnn.bin";
const PARAMS = 19306;
const MAX_DIGITS = 3;
const BITS = [32, 8, 4, 3, 2] as const;
type Bits = (typeof BITS)[number];
const ACCURACY: Record<Bits, [number, number]> = { 32: [98.7, 96.9], 8: [98.8, 96.8], 4: [97.4, 95.1], 3: [61.6, 63.6], 2: [8.6, 8.8] };

type Pt = [number, number];
type Net = { c1w: Float32Array; c1b: Float32Array; c2w: Float32Array; c2b: Float32Array; fcw: Float32Array; fcb: Float32Array };

function quantize(w: Float32Array, bits: Bits) {
  if (bits === 32) return w;
  const q = 2 ** (bits - 1) - 1;
  let max = 0;
  for (let i = 0; i < w.length; i++) max = Math.max(max, Math.abs(w[i]));
  const s = max / q;
  return w.map((v) => Math.max(-q, Math.min(q, Math.round(v / s))) * s);
}

/** 5x5 convolution (padding 2) + ReLU + 2x2 max-pool. Input cin x n x n, output cout x n/2 x n/2. */
function convBlock(x: Float32Array, cin: number, n: number, w: Float32Array, b: Float32Array, cout: number) {
  const conv = new Float32Array(cout * n * n);
  for (let o = 0; o < cout; o++)
    for (let y = 0; y < n; y++)
      for (let xx = 0; xx < n; xx++) {
        let s = b[o];
        for (let c = 0; c < cin; c++)
          for (let ky = 0; ky < 5; ky++) {
            const iy = y + ky - 2;
            if (iy < 0 || iy >= n) continue;
            for (let kx = 0; kx < 5; kx++) {
              const ix = xx + kx - 2;
              if (ix < 0 || ix >= n) continue;
              s += w[((o * cin + c) * 5 + ky) * 5 + kx] * x[(c * n + iy) * n + ix];
            }
          }
        conv[(o * n + y) * n + xx] = s > 0 ? s : 0;
      }
  const h = n / 2, out = new Float32Array(cout * h * h);
  for (let o = 0; o < cout; o++)
    for (let y = 0; y < h; y++)
      for (let xx = 0; xx < h; xx++) {
        const i = (o * n + y * 2) * n + xx * 2;
        out[(o * h + y) * h + xx] = Math.max(conv[i], conv[i + 1], conv[i + n], conv[i + n + 1]);
      }
  return out;
}

function predict(net: Net, x: Float32Array) {
  const a = convBlock(x, 1, 28, net.c1w, net.c1b, 12);
  const f = convBlock(a, 12, 14, net.c2w, net.c2b, 24);
  const z = new Float32Array(10);
  for (let k = 0; k < 10; k++) {
    let s = net.fcb[k];
    for (let i = 0; i < f.length; i++) s += net.fcw[k * f.length + i] * f[i];
    z[k] = s;
  }
  const m = Math.max(...z);
  let sum = 0;
  const p = Array.from(z, (v) => { const e = Math.exp(v - m); sum += e; return e; });
  return p.map((v) => v / sum);
}

/** Draws strokes (0-1 coordinates) onto a w x h context. */
function paint(ctx: CanvasRenderingContext2D, strokes: Pt[][], w: number, h: number, color: string) {
  ctx.strokeStyle = color; ctx.fillStyle = color;
  ctx.lineWidth = h * 0.08; ctx.lineCap = "round"; ctx.lineJoin = "round";
  for (const s of strokes) {
    if (s.length === 1) { ctx.beginPath(); ctx.arc(s[0][0] * w, s[0][1] * h, ctx.lineWidth / 2, 0, Math.PI * 2); ctx.fill(); continue; }
    ctx.beginPath();
    ctx.moveTo(s[0][0] * w, s[0][1] * h);
    for (let i = 1; i < s.length; i++) ctx.lineTo(s[i][0] * w, s[i][1] * h);
    ctx.stroke();
  }
}

/** Splits the drawing into digits: strokes whose horizontal extents overlap belong together
 *  (so a 4 or a crossed 7 stays one digit), then the groups are read left to right. */
function segment(strokes: Pt[][]): Pt[][][] {
  let groups = strokes.map((s) => {
    const xs = s.map((p) => p[0]);
    return { x0: Math.min(...xs), x1: Math.max(...xs), strokes: [s] };
  });
  for (let merged = true; merged; ) {
    merged = false;
    outer: for (let i = 0; i < groups.length; i++)
      for (let j = i + 1; j < groups.length; j++) {
        const a = groups[i], b = groups[j];
        if (a.x0 <= b.x1 + 0.015 && b.x0 <= a.x1 + 0.015) {
          groups[i] = { x0: Math.min(a.x0, b.x0), x1: Math.max(a.x1, b.x1), strokes: [...a.strokes, ...b.strokes] };
          groups.splice(j, 1); merged = true;
          break outer;
        }
      }
  }
  groups = groups.sort((a, b) => a.x0 - b.x0);
  return groups.map((g) => g.strokes);
}

/** MNIST-style preprocessing: crop to the ink, fit it in a 20x20 box, centre by mass in 28x28. */
function toInput(strokes: Pt[][]): Float32Array | null {
  const W = 400, H = 300;
  const big = document.createElement("canvas"); big.width = W; big.height = H;
  const b = big.getContext("2d", { willReadFrequently: true })!;
  paint(b, strokes, W, H, "#fff");
  const a = b.getImageData(0, 0, W, H).data;
  let x0 = W, y0 = H, x1 = -1, y1 = -1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (a[(y * W + x) * 4 + 3] > 20) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  if (x1 < 0) return null;
  const w = x1 - x0 + 1, h = y1 - y0 + 1, k = 20 / Math.max(w, h);
  const small = document.createElement("canvas"); small.width = small.height = 28;
  const c = small.getContext("2d", { willReadFrequently: true })!;
  c.imageSmoothingQuality = "high";
  const place = (dx: number, dy: number) => { c.clearRect(0, 0, 28, 28); c.drawImage(big, x0, y0, w, h, 14 - (w * k) / 2 + dx, 14 - (h * k) / 2 + dy, w * k, h * k); return c.getImageData(0, 0, 28, 28).data; };
  let d = place(0, 0);
  let m = 0, mx = 0, my = 0;
  for (let i = 0; i < 784; i++) { const v = d[i * 4 + 3]; m += v; mx += (i % 28) * v; my += Math.floor(i / 28) * v; }
  d = place(13.5 - mx / m, 13.5 - my / m);
  const x = new Float32Array(784);
  for (let i = 0; i < 784; i++) x[i] = d[i * 4 + 3] / 255;
  return x;
}

// A handwritten 27, so the lab shows something working before anyone draws.
const EXAMPLE: Pt[][] = [
  [[0.2, 0.33], [0.26, 0.25], [0.35, 0.22], [0.43, 0.27], [0.44, 0.37], [0.39, 0.48], [0.3, 0.6], [0.21, 0.73], [0.46, 0.73]],
  [[0.56, 0.26], [0.8, 0.26], [0.74, 0.42], [0.68, 0.58], [0.64, 0.74]],
];

function Seen({ input, active }: { input: Float32Array; active: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    const cell = c.width / 28;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--ink").trim();
    for (let i = 0; i < 784; i++) {
      ctx.globalAlpha = 0.06 + input[i] * 0.94;
      ctx.fillRect((i % 28) * cell + 0.5, Math.floor(i / 28) * cell + 0.5, cell - 1, cell - 1);
    }
    ctx.globalAlpha = 1;
  }, [input]);
  return <canvas ref={ref} width={112} height={112} aria-hidden className={`size-14 rounded-[9px] border bg-bg transition-colors duration-200 ${active ? "border-line-2" : "border-line"}`} />;
}

export function DigitLab() {
  const pad = useRef<HTMLCanvasElement>(null);
  const strokes = useRef<Pt[][]>(EXAMPLE.map((s) => [...s]));
  const drawing = useRef(false);
  const [net, setNet] = useState<Net | null>(null);
  const [bits, setBits] = useState<Bits>(32);
  const [inputs, setInputs] = useState<Float32Array[]>([]);
  const [tooMany, setTooMany] = useState(false);
  // null: show every digit's guesses together; a number: just that digit's.
  const [picked, setPicked] = useState<number | null>(null);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch(WEIGHTS_URL).then((r) => r.arrayBuffer()).then((buf) => {
      if (!alive) return;
      const f = new Float32Array(buf);
      let o = 0;
      const take = (n: number) => f.subarray(o, (o += n));
      setNet({ c1w: take(12 * 25), c1b: take(12), c2w: take(24 * 12 * 25), c2b: take(24), fcw: take(10 * 24 * 49), fcb: take(10) });
    }).catch(() => {});
    return () => { alive = false; };
  }, []);

  const qnet = useMemo(() => (net ? { ...net, c1w: quantize(net.c1w, bits), c2w: quantize(net.c2w, bits), fcw: quantize(net.fcw, bits) } : null), [net, bits]);
  const reads = useMemo(() => (qnet ? inputs.map((x) => { const p = predict(qnet, x); const top = p.indexOf(Math.max(...p)); return { p, top }; }) : []), [qnet, inputs]);
  const sel = picked !== null && picked < reads.length ? picked : null;
  const shown = sel === null ? reads : [reads[sel]];
  const number = reads.map((r) => r.top).join("");
  const sure = reads.reduce((s, r) => s * r.p[r.top], 1);

  const render = useCallback(() => {
    const c = pad.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, c.width, c.height);
    paint(ctx, strokes.current, c.width, c.height, getComputedStyle(document.documentElement).getPropertyValue("--ink").trim());
  }, []);

  const read = useCallback(() => {
    const groups = segment(strokes.current);
    setTooMany(groups.length > MAX_DIGITS);
    setInputs(groups.slice(0, MAX_DIGITS).map(toInput).filter((x): x is Float32Array => !!x));
  }, []);

  useEffect(() => {
    render(); read();
    const mo = new MutationObserver(render);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, [render, read]);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>): Pt => {
    const r = e.currentTarget.getBoundingClientRect();
    return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height];
  };
  const raf = useRef(0);
  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
    if (!touched) { strokes.current = []; setTouched(true); }
    drawing.current = true;
    setPicked(null);
    strokes.current.push([pos(e)]);
    render();
  };
  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    strokes.current[strokes.current.length - 1].push(pos(e));
    render();
    if (!raf.current) raf.current = requestAnimationFrame(() => { raf.current = 0; read(); });
  };
  const onUp = () => { if (drawing.current) { drawing.current = false; read(); } };
  const clear = () => { strokes.current = []; setTouched(true); setPicked(null); render(); setInputs([]); setTooMany(false); };

  const kb = (PARAMS * bits) / 8 / 1024;

  return (
    <div className="grid gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:gap-12">
      <div>
        <div className="relative mx-auto w-full max-w-[480px]">
          <canvas
            ref={pad}
            width={640}
            height={480}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            aria-label="Drawing pad: write up to three digits"
            className="block aspect-[4/3] w-full cursor-crosshair touch-none rounded-[18px] border border-line bg-bg bg-[radial-gradient(circle,var(--line-2)_1px,transparent_1.2px)] bg-[length:20px_20px]"
          />
          {!touched && (
            <p className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-[13px] text-muted">An example 27. Draw over the pad to try your own.</p>
          )}
          <button
            type="button"
            onClick={clear}
            className="absolute right-3 top-3 inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-line bg-surface px-3 text-[13px] font-medium text-ink-2 transition-colors duration-200 hover:text-ink active:scale-95"
          >
            <Eraser size={14} /> Clear
          </button>
        </div>

        <div className="mx-auto mt-4 w-full max-w-[480px]">
          <p className="text-[13px] text-muted">
            {tooMany ? "Up to three digits. Leave a little space between them." : "What the model sees: each digit cut out, shrunk to 28 by 28 pixels and centred, the way MNIST digits are."}
          </p>
          <div className="mt-3 flex min-h-[86px] flex-wrap gap-2.5">
            {reads.map((r, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPicked(sel === i ? null : i)}
                aria-pressed={i === sel}
                className={`flex cursor-pointer items-center gap-3 rounded-[14px] border p-1.5 pr-3.5 text-left transition-colors duration-200 ${i === sel ? "border-line-2 bg-raised" : "border-line hover:border-line-2"}`}
              >
                <Seen input={inputs[i]} active={i === sel} />
                <span>
                  <span className="block font-display text-[26px] font-bold leading-none">{r.top}</span>
                  <span className="mt-1 block font-mono text-[11.5px] text-muted">{(r.p[r.top] * 100).toFixed(0)}%</span>
                </span>
              </button>
            ))}
            {!reads.length && <span className="self-center text-[13px] text-muted">{net ? "Write a digit, solid or outlined." : "Loading the model…"}</span>}
          </div>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[13px] text-muted">It reads</p>
            <p aria-live="polite" className="font-display text-[64px] font-extrabold leading-none tracking-[-0.03em] tabular-nums">
              {number || <span className="text-muted">?</span>}
            </p>
          </div>
          <p className="pb-2 text-right font-mono text-[13px] text-ink-2">{reads.length ? `${(sure * 100).toFixed(1)}% sure` : ""}</p>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="text-[13px] text-muted">
            {sel !== null ? `Digit ${sel + 1} of ${reads.length}, every guess the model considered` : reads.length > 1 ? `Every guess for all ${reads.length} digits, one line each` : "Every guess the model considered"}
          </p>
          {sel !== null && (
            <button type="button" onClick={() => setPicked(null)} className="cursor-pointer text-[13px] font-medium text-ink-2 underline decoration-line-2 underline-offset-4 hover:text-ink">
              Show all
            </button>
          )}
        </div>
        <ul className="mt-2 space-y-1.5" aria-label="Probability for each digit">
          {Array.from({ length: 10 }, (_, d) => {
            // One thin line per written digit, in writing order; the value on the right is the strongest of them.
            const ps = shown.length ? shown.map((r) => r.p[d]) : [0];
            const best = shown.some((r) => r.top === d);
            const max = Math.max(...ps);
            return (
              <li key={d} className="grid grid-cols-[14px_1fr_52px] items-center gap-3 font-mono text-[12.5px]">
                <span className={best ? "text-ink" : "text-muted"}>{d}</span>
                <span className="flex flex-col gap-[3px]">
                  {ps.map((p, i) => (
                    <span key={i} className={`overflow-hidden rounded-full bg-raised ${ps.length > 1 ? "h-[5px]" : "h-2"}`}>
                      <span
                        className="block h-full rounded-full transition-[width,background-color] duration-300 ease-out"
                        style={{ width: `${Math.max(p * 100, p > 0.001 ? 1.5 : 0)}%`, background: shown[i]?.top === d ? "rgb(var(--glow))" : "var(--muted)" }}
                      />
                    </span>
                  ))}
                </span>
                <span className={`text-right tabular-nums ${best ? "text-ink" : "text-muted"}`}>{(max * 100).toFixed(1)}%</span>
              </li>
            );
          })}
        </ul>

        <p className="mt-7 text-[13px] text-muted">Squeeze the weights</p>
        <div role="radiogroup" aria-label="Bits per weight" className="relative mt-2 inline-flex w-fit rounded-full border border-line bg-bg p-1">
          {BITS.map((b) => (
            <button
              key={b}
              role="radio"
              aria-checked={bits === b}
              onClick={() => setBits(b)}
              className={`relative z-10 h-9 cursor-pointer whitespace-nowrap rounded-full px-3 font-mono text-[13px] transition-colors duration-200 sm:px-4 ${bits === b ? "text-bg" : "text-ink-2 hover:text-ink"}`}
            >
              {bits === b && <motion.span layoutId="bits-pill" className="absolute inset-0 -z-10 rounded-full bg-ink" transition={{ type: "spring", duration: 0.4, bounce: 0.15 }} />}
              {b}-bit
            </button>
          ))}
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-2 sm:gap-3">
          <div className="rounded-[14px] border border-line bg-bg px-4 py-3">
            <dt className="text-[12.5px] leading-tight text-muted">Model size</dt>
            <dd className="mt-1 font-display text-[24px] font-bold tabular-nums tracking-[-0.02em]">{kb.toFixed(1)} KB</dd>
          </div>
          <div className="rounded-[14px] border border-line bg-bg px-4 py-3">
            <dt className="text-[12.5px] leading-tight text-muted">Accuracy on 10,000 test digits</dt>
            <dd className="mt-1 font-display text-[24px] font-bold tabular-nums tracking-[-0.02em]">
              {ACCURACY[bits][0]}%
              <span className="ml-2 font-sans text-[13px] font-medium tracking-normal text-muted">outlined {ACCURACY[bits][1]}%</span>
            </dd>
          </div>
        </dl>
        <p className="mt-5 max-w-[50ch] text-[15px] leading-relaxed text-ink-2">
          Squeeze the weights and watch it change its mind. At 8 bits the network is a quarter of the size and reads just as
          well, and at 4 bits it still holds. At 3 bits it starts guessing, and at 2 it forgets almost everything it learned.
        </p>
      </div>
    </div>
  );
}
