"use client";

import { useMemo, useRef, useState } from "react";
import curves from "@/content/rl-curves.json";

type Key = "sac" | "TD3" | "PPO";
const SERIES: { key: Key; label: string; color: string }[] = [
  { key: "sac", label: "SAC", color: "var(--c1)" },
  { key: "TD3", label: "TD3", color: "var(--c2)" },
  { key: "PPO", label: "PPO", color: "var(--c3)" },
];
const data = curves as Record<Key, [number, number][]>;

const W = 640, H = 300, P = { l: 40, r: 12, t: 14, b: 26 };
const X_MAX = 5300, Y_MIN = -130, Y_MAX = 330;
const sx = (x: number) => P.l + (x / X_MAX) * (W - P.l - P.r);
const sy = (y: number) => P.t + (1 - (y - Y_MIN) / (Y_MAX - Y_MIN)) * (H - P.t - P.b);

function nearest(pts: [number, number][], x: number) {
  if (x < pts[0][0] || x > pts[pts.length - 1][0]) return null;
  let best = pts[0];
  for (const p of pts) if (Math.abs(p[0] - x) < Math.abs(best[0] - x)) best = p;
  return best;
}

/** Running average reward on BipedalWalker-v3, traced from Tejas's training plots. */
export function RewardChart({ compact = false }: { compact?: boolean }) {
  const [on, setOn] = useState<Record<Key, boolean>>({ sac: true, TD3: true, PPO: true });
  const [hx, setHx] = useState<number | null>(null);
  const svg = useRef<SVGSVGElement>(null);

  const paths = useMemo(
    () => Object.fromEntries(SERIES.map((s) => [s.key, data[s.key].map(([x, y], i) => `${i ? "L" : "M"}${sx(x).toFixed(1)},${sy(y).toFixed(1)}`).join("")])),
    [],
  ) as Record<Key, string>;

  function onMove(e: React.PointerEvent) {
    const r = svg.current!.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    const x = ((px - P.l) / (W - P.l - P.r)) * X_MAX;
    setHx(x >= 0 && x <= X_MAX ? x : null);
  }

  const readouts = hx === null ? [] : SERIES.filter((s) => on[s.key]).map((s) => ({ s, p: nearest(data[s.key], hx) })).filter((r) => r.p);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {SERIES.map((s) => (
          <button
            key={s.key}
            type="button"
            aria-pressed={on[s.key]}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOn((o) => ({ ...o, [s.key]: !o[s.key] })); }}
            className={`chip cursor-pointer transition-opacity duration-200 ${on[s.key] ? "" : "opacity-40"}`}
          >
            <span className="size-2 rounded-full" style={{ background: s.color }} />
            {s.label}
          </button>
        ))}
        <span className="ml-auto font-mono text-[12px] text-muted">
          {readouts.length ? `episode ${Math.round(hx!)}` : "hover the chart"}
        </span>
      </div>
      <svg
        ref={svg}
        viewBox={`0 0 ${W} ${H}`}
        className={`mt-3 w-full touch-none select-none ${compact ? "h-auto" : ""}`}
        onPointerMove={onMove}
        onPointerLeave={() => setHx(null)}
        role="img"
        aria-label="Running average reward per episode for SAC, TD3 and PPO. SAC crosses 300 near episode 330, TD3 near 1,240, PPO peaks near 286."
      >
        {[-100, 0, 100, 200, 300].map((y) => (
          <g key={y}>
            <line x1={P.l} x2={W - P.r} y1={sy(y)} y2={sy(y)} stroke="var(--line)" strokeDasharray={y === 300 ? "3 4" : undefined} />
            <text x={P.l - 8} y={sy(y) + 4} textAnchor="end" className="fill-muted font-mono text-[10px]">{y}</text>
          </g>
        ))}
        {[0, 1000, 2000, 3000, 4000, 5000].map((x) => (
          <text key={x} x={sx(x)} y={H - 6} textAnchor="middle" className="fill-muted font-mono text-[10px]">{x === 0 ? "0" : `${x / 1000}k`}</text>
        ))}
        <text x={W - P.r} y={sy(300) - 6} textAnchor="end" className="fill-muted font-mono text-[10px]">300 = solved</text>
        {SERIES.slice().reverse().map((s) => (
          <path key={s.key} d={paths[s.key]} fill="none" stroke={s.color} strokeWidth={1.75} strokeLinejoin="round"
            style={{ opacity: on[s.key] ? 1 : 0, transition: "opacity 250ms ease" }} />
        ))}
        {hx !== null && (
          <g>
            <line x1={sx(hx)} x2={sx(hx)} y1={P.t} y2={H - P.b} stroke="var(--line-2)" />
            {readouts.map(({ s, p }) => (
              <circle key={s.key} cx={sx(p![0])} cy={sy(p![1])} r={3.5} fill={s.color} stroke="var(--surface)" strokeWidth={2} />
            ))}
          </g>
        )}
      </svg>
      <div className="mt-2 flex h-5 flex-wrap gap-x-4 font-mono text-[12px] text-ink-2">
        {readouts.map(({ s, p }) => (
          <span key={s.key}><span style={{ color: s.color }}>{s.label}</span> {p![1].toFixed(0)}</span>
        ))}
      </div>
    </div>
  );
}
