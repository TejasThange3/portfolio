"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { anime } from "@/content/space";

const N = anime.length;
const STEP_MS = 3800;
const wrap = (i: number) => ((i % N) + N) % N;

/** A 3D coverflow: the centre poster faces you, the rest turn away into depth.
 *  Drag, swipe, use the arrow keys, click a side poster, or let it turn on its own. */
export function AnimeCarousel() {
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);
  const [visible, setVisible] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; moved: boolean } | null>(null);
  const still = useSyncExternalStore(() => () => {}, () => matchMedia("(prefers-reduced-motion: reduce)").matches, () => false);
  const wide = useSyncExternalStore(
    (cb) => { const m = matchMedia("(min-width: 768px)"); m.addEventListener("change", cb); return () => m.removeEventListener("change", cb); },
    () => matchMedia("(min-width: 768px)").matches,
    () => true,
  );

  useEffect(() => {
    const el = box.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const running = visible && !held && !still;
  useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => setActive((a) => wrap(a + 1)), STEP_MS);
    return () => clearTimeout(t);
  }, [running, active]);

  const go = (d: number) => { setActive((a) => wrap(a + d)); setHeld(true); };
  const current = anime[active];
  const gap = wide ? 210 : 128;

  return (
    <div
      ref={box}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="Anime"
      onKeyDown={(e) => { if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); }}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      className="relative overflow-hidden rounded-[26px] border border-line bg-surface outline-none focus-visible:border-line-2"
    >
      {/* the active poster, blurred into light behind the stage */}
      <AnimatePresence initial={false}>
        <motion.div
          key={current.cover}
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.55 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <Image src={current.cover} alt="" fill sizes="400px" className="scale-125 object-cover blur-[70px] saturate-150" />
        </motion.div>
      </AnimatePresence>
      <span aria-hidden className="absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_45%,transparent,var(--surface)_95%)]" />

      <div
        className="relative h-[430px] touch-pan-y select-none [perspective:1400px] md:h-[540px]"
        onPointerDown={(e) => { drag.current = { x: e.clientX, moved: false }; }}
        onPointerMove={(e) => {
          const d = drag.current; if (!d || d.moved) return;
          const dx = e.clientX - d.x;
          if (Math.abs(dx) > 40) { d.moved = true; go(dx < 0 ? 1 : -1); }
        }}
        onPointerUp={() => { setTimeout(() => (drag.current = null), 0); }}
        onPointerCancel={() => (drag.current = null)}
      >
        {anime.map((a, i) => {
          let off = i - active;
          if (off > N / 2) off -= N;
          if (off < -N / 2) off += N;
          const abs = Math.abs(off);
          return (
            <motion.button
              key={a.title}
              type="button"
              tabIndex={-1}
              aria-hidden={off !== 0}
              onClick={() => { if (!drag.current?.moved && off !== 0) go(off); }}
              initial={false}
              animate={{
                x: off * gap,
                z: -abs * 170,
                rotateY: off === 0 ? 0 : off > 0 ? -38 : 38,
                scale: off === 0 ? 1 : 0.92,
                opacity: abs > 3 ? 0 : 1 - abs * 0.18,
              }}
              transition={{ type: "spring", stiffness: 170, damping: 24, mass: 0.9 }}
              style={{ zIndex: 10 - abs }}
              className="absolute left-1/2 top-1/2 -ml-[95px] -mt-[150px] h-[300px] w-[190px] cursor-pointer overflow-hidden rounded-[16px] shadow-[0_30px_60px_-20px_rgb(0_0_0/0.7)] [transform-style:preserve-3d] md:-ml-[130px] md:-mt-[200px] md:h-[400px] md:w-[260px]"
            >
              <Image src={a.cover} alt={off === 0 ? `${a.title} key art` : ""} quality={90} fill sizes="(min-width: 768px) 260px, 190px" className="pointer-events-none object-cover" draggable={false} priority={i === 0} />
              {/* a soft sheen across the face */}
              <span aria-hidden className="absolute inset-0 bg-[linear-gradient(115deg,rgb(255_255_255/0.16),transparent_35%)]" />
              {off !== 0 && <span aria-hidden className="absolute inset-0 bg-black/35" />}
            </motion.button>
          );
        })}
      </div>

      <div className="relative flex items-end justify-between gap-4 px-5 pb-5 md:px-8 md:pb-7">
        <div aria-live="polite" className="min-w-0">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={current.title} initial={{ opacity: 0, y: 8, filter: "blur(4px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -6, filter: "blur(4px)" }} transition={{ duration: 0.3 }}>
              <p className="font-mono text-[11.5px] uppercase tracking-[0.14em] text-muted">{String(active + 1).padStart(2, "0")} / {String(N).padStart(2, "0")} · {current.year}</p>
              <p className="mt-1 truncate font-display text-[clamp(22px,2.6vw,32px)] font-bold tracking-[-0.02em]">{current.title}</p>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={() => go(-1)} aria-label="Previous anime" className="grid size-11 cursor-pointer place-items-center rounded-full border border-line-2 bg-bg/60 text-ink-2 backdrop-blur transition-colors duration-200 hover:text-ink active:scale-95">
            <CaretLeft size={18} />
          </button>
          <button type="button" onClick={() => go(1)} aria-label="Next anime" className="grid size-11 cursor-pointer place-items-center rounded-full border border-line-2 bg-bg/60 text-ink-2 backdrop-blur transition-colors duration-200 hover:text-ink active:scale-95">
            <CaretRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
