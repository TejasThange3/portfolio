"use client";

import { useEffect, useState } from "react";

const HOLD_MS = 4000;

/**
 * The name, alternating between English and Marathi every four seconds.
 * Both sit in the same grid cell (so nothing shifts) and cross-fade with a soft blur. Every swap moves
 * the same way: the outgoing name rises and fades, the incoming one rises into place from just below.
 * Each word stays whole, so the Devanagari conjuncts and vowel signs are never broken apart.
 * Pauses while the tab is hidden; with reduced motion it simply stays in English.
 */
export function NameFlicker({ en, mr, className = "" }: { en: string; mr: string; className?: string }) {
  const [showMr, setShowMr] = useState(false);
  const [swapped, setSwapped] = useState(false); // before the first swap, nothing animates

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let t = 0;
    const loop = () => { t = window.setTimeout(() => { if (!document.hidden) { setShowMr((v) => !v); setSwapped(true); } loop(); }, HOLD_MS); };
    // If the intro is playing, the name lands in English from it; start counting once it has.
    const begin = () => loop();
    if (document.documentElement.dataset.intro) window.addEventListener("intro:done", begin, { once: true });
    else loop();
    return () => { clearTimeout(t); window.removeEventListener("intro:done", begin); };
  }, []);

  const layer = "col-start-1 row-start-1";
  const on = swapped ? "name-in" : "";
  const off = `pointer-events-none ${swapped ? "name-out" : "opacity-0"}`;

  return (
    <h1
      aria-label={en}
      className={`inline-grid cursor-default whitespace-nowrap font-display font-extrabold leading-[1.12] tracking-[-0.035em] text-ink ${className}`}
    >
      <span aria-hidden data-intro-target className={`${layer} ${showMr ? off : on}`}>{en}</span>
      <span aria-hidden lang="mr" className={`${layer} tracking-normal ${showMr ? on : off}`}>{mr}</span>
    </h1>
  );
}
