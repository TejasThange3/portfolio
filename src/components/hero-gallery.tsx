"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { heroes } from "@/content/space";

const STEP_MS = 5200;

/** Expanding panels: one hero open at a time. It moves on by itself while the gallery is on screen,
 *  and stops the moment someone points at, taps or tabs into a panel. */
export function HeroGallery() {
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);
  const [visible, setVisible] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = box.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const still = useSyncExternalStore(() => () => {}, () => matchMedia("(prefers-reduced-motion: reduce)").matches, () => false);
  const running = visible && !held && !still;
  useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => setActive((a) => (a + 1) % heroes.length), STEP_MS);
    return () => clearTimeout(t);
  }, [running, active]);

  return (
    <div
      ref={box}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      className="flex h-[860px] flex-col gap-2 sm:h-[760px] md:h-[580px] md:flex-row"
    >
      {heroes.map((h, i) => {
        const on = i === active;
        return (
          <button
            key={h.name}
            type="button"
            aria-expanded={on}
            aria-label={h.name}
            onClick={() => { setActive(i); setHeld(true); }}
            onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}
            onFocus={() => { setActive(i); setHeld(true); }}
            onBlur={() => setHeld(false)}
            style={{ flexGrow: on ? 6 : 1 }}
            className="hero-panel group relative min-h-0 min-w-0 basis-0 cursor-pointer overflow-hidden rounded-[22px] border border-line text-left"
          >
            <Image
              src={h.img}
              alt=""
              fill
              sizes="(min-width: 768px) 720px, 100vw"
              quality={90} className={`object-cover transition-[filter,transform] duration-[900ms] ease-out ${on ? "scale-100 brightness-100 saturate-100" : "scale-[1.08] brightness-[0.55] saturate-[0.7]"}`}
              style={{ objectPosition: h.pos }}
            />
            <span aria-hidden className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-500 ${on ? "opacity-100" : "opacity-70"}`} />

            <span className="absolute left-4 top-4 font-mono text-[11px] tracking-[0.14em] text-white/70">{String(i + 1).padStart(2, "0")}</span>

            {/* collapsed: the name runs up the panel on desktop, along it on phones */}
            <span
              aria-hidden
              className={`absolute bottom-4 left-4 whitespace-nowrap font-display text-[17px] font-bold tracking-[-0.01em] text-white/90 transition-opacity duration-300 md:bottom-5 md:left-1/2 md:-translate-x-1/2 md:rotate-180 md:[writing-mode:vertical-rl] ${on ? "opacity-0" : "opacity-100 delay-200"}`}
            >
              {h.name}
            </span>

            {/* open: name, title and one line */}
            <span className={`absolute inset-x-0 bottom-0 p-5 transition-[opacity,transform] md:p-7 ${on ? "translate-y-0 opacity-100 delay-300 duration-500" : "pointer-events-none translate-y-3 opacity-0 duration-200"}`}>
              <span className="block font-mono text-[11px] uppercase tracking-[0.16em] text-white/70">{h.title}</span>
              <span className="mt-2 block font-display text-[clamp(26px,3vw,40px)] font-extrabold leading-[1.02] tracking-[-0.03em] text-white">{h.name}</span>
              <span className="mt-2 block max-w-[40ch] text-[15px] leading-snug text-white/80">{h.note}</span>
            </span>

            {/* time until the next hero */}
            {on && (
              <span aria-hidden className="absolute inset-x-5 bottom-0 h-[2px] overflow-hidden rounded-full bg-white/15 md:inset-x-7">
                <span key={`${active}-${running}`} className="hero-progress block h-full bg-white/80" style={{ animationDuration: `${STEP_MS}ms`, animationPlayState: running ? "running" : "paused" }} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
