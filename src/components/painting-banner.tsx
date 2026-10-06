"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { paintings } from "@/content/site";
import { runEffects } from "./painting-effects";
import { useTheme } from "./use-theme";

const parsePos = (pos: string) => pos.split(" ").map((v) => parseFloat(v) / 100) as [number, number];
const all = [...paintings.dark, ...paintings.light];

/**
 * Night paintings in dark mode, day paintings in light mode, each with a light living layer
 * (embers, moonlight on water, stars, fireflies, birds, seeds, petals). Click for the next one.
 */
export function PaintingBanner() {
  const theme = useTheme();
  const set = paintings[theme];
  const [idx, setIdx] = useState({ dark: 0, light: 0 });
  const [prevSrc, setPrevSrc] = useState<string | null>(null);
  const [warm, setWarm] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const index = idx[theme] % set.length;
  const p = set[index];

  const go = (to: number) => {
    if (to === index) return;
    setPrevSrc(p.src);
    setIdx((s) => ({ ...s, [theme]: to }));
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setPrevSrc(null), 1000);
  };

  useEffect(() => {
    const t = setTimeout(() => setWarm(true), 2500);
    return () => { clearTimeout(t); if (timer.current) clearTimeout(timer.current); };
  }, []);

  useEffect(() => {
    const c = canvas.current;
    if (!c || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const [px, py] = parsePos(p.pos);
    return runEffects(c, p.effects, { iw: p.w, ih: p.h, px, py });
  }, [p]);

  return (
    <figure>
      <button
        type="button"
        onClick={() => go((index + 1) % set.length)}
        aria-label={`Show the next painting. Now showing ${p.title} by ${p.artist}`}
        className="group relative block aspect-[4/3] w-full cursor-pointer overflow-hidden rounded-[22px] bg-surface sm:aspect-[2/1] sm:max-h-[54vh]"
      >
        {prevSrc && (
          <Image key={`prev-${prevSrc}`} src={prevSrc} alt="" fill sizes="(min-width: 1200px) 1200px, 100vw" className="object-cover"
            style={{ objectPosition: all.find((x) => x.src === prevSrc)?.pos }} />
        )}
        <Image
          key={`cur-${p.src}`}
          src={p.src}
          alt={`${p.title} by ${p.artist}${p.year ? `, ${p.year}` : ""}`}
          fill
          priority={index === 0}
          sizes="(min-width: 1200px) 1200px, 100vw"
          className={`object-cover ${prevSrc ? "painting-in" : ""}`}
          style={{ objectPosition: p.pos }}
        />
        {warm && (
          <Image key={`next-${p.src}`} src={set[(index + 1) % set.length].src} alt="" fill loading="eager"
            sizes="(min-width: 1200px) 1200px, 100vw" className="pointer-events-none object-cover opacity-0" />
        )}
        <canvas ref={canvas} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />
        <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[22px] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08)]" />
      </button>
      <figcaption className="mt-3 flex items-center justify-between gap-4 text-[13px] text-muted">
        <span className="truncate">
          <span className="text-ink-2">{p.title}</span> by {p.artist}{p.year ? `, ${p.year}` : ""}
        </span>
        <span className="flex shrink-0 items-center" role="group" aria-label="Choose a painting">
          {set.map((x, i) => (
            <button key={x.src} type="button" onClick={() => go(i)} aria-label={`Show ${x.title}`}
              aria-current={i === index ? "true" : undefined} className="grid h-6 w-5 cursor-pointer place-items-center">
              <span className={`block h-1.5 rounded-full transition-all duration-300 ease-out ${i === index ? "w-4 bg-ink" : "w-1.5 bg-line-2 hover:bg-muted"}`} />
            </button>
          ))}
        </span>
      </figcaption>
    </figure>
  );
}
