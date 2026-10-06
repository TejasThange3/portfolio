"use client";

import Image from "next/image";
import { useRef } from "react";
import { films, type Film } from "@/content/space";

/** A poster that tilts toward the pointer, with a glare that follows it. */
function FilmCard({ f }: { f: Film }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <figure className="film-card w-[170px] shrink-0 md:w-[200px]">
      <div
        ref={ref}
        onPointerMove={(e) => {
          const el = ref.current; if (!el || e.pointerType !== "mouse") return;
          const r = el.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
          el.style.setProperty("--rx", `${(0.5 - py) * 14}deg`);
          el.style.setProperty("--ry", `${(px - 0.5) * 16}deg`);
          el.style.setProperty("--gx", `${px * 100}%`);
          el.style.setProperty("--gy", `${py * 100}%`);
        }}
        onPointerLeave={() => { const el = ref.current; if (!el) return; el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg"); }}
        className="film-tilt relative aspect-[2/3] overflow-hidden rounded-[16px] border border-white/10"
        style={{ background: `radial-gradient(120% 90% at 30% 10%, color-mix(in oklab, ${f.tint} 82%, white 10%), ${f.tint} 45%, color-mix(in oklab, ${f.tint} 30%, black) 100%)` }}
      >
        {f.poster ? (
          <Image src={f.poster} alt={`${f.title} poster`} fill quality={90} sizes="200px" className="object-cover" style={{ objectPosition: f.pos ?? "50% 50%" }} />
        ) : (
          <div className="absolute inset-0 flex flex-col justify-between p-4">
            <span className="flex items-center justify-between font-mono text-[10.5px] uppercase tracking-[0.14em] text-white/75">
              <span>{f.lang ?? "English"}</span><span>{f.year}</span>
            </span>
            <span>
              <span className="block font-display text-[clamp(21px,2vw,26px)] font-extrabold leading-[1.02] tracking-[-0.03em] text-white">{f.title}</span>
              <span className="mt-2 block text-[11.5px] text-white/70">{f.by}</span>
            </span>
          </div>
        )}
        <span aria-hidden className="film-glare pointer-events-none absolute inset-0" />
      </div>
      <figcaption className="mt-2.5 px-0.5 text-[13px] leading-snug">
        <span className="block truncate font-medium text-ink">{f.title}</span>
        <span className="block truncate text-muted">{f.year}, {f.by}</span>
      </figcaption>
    </figure>
  );
}

function Row({ list, reverse }: { list: Film[]; reverse?: boolean }) {
  const track = (hidden: boolean) => (
    <div aria-hidden={hidden || undefined} className="film-track flex shrink-0 gap-3 pr-3 md:gap-4 md:pr-4">
      {list.map((f) => <FilmCard key={f.title} f={f} />)}
    </div>
  );
  return (
    <div className={`film-row flex overflow-hidden py-3 [mask-image:linear-gradient(to_right,transparent,#000_7%,#000_93%,transparent)] ${reverse ? "is-reverse" : ""}`}>
      {track(false)}
      {track(true)}
    </div>
  );
}

/** Two rows of films drifting in opposite directions, like a strip of film. Hover pauses the row. */
export function FilmStrip() {
  return (
    <div className="-mx-4 md:-mx-8">
      <Row list={films} />
      <Row list={[...films].reverse()} reverse />
    </div>
  );
}
