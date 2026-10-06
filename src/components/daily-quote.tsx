"use client";

import { useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { materialOf, quotes, type Quote } from "@/content/space";

// One quote per calendar day, the same for everyone that day, changing at the visitor's midnight.
// There is no way to browse ahead: tomorrow's quote is tomorrow's.
// Read on the client (the page is static), so the server renders nothing and the quote fades in.

const today = () => {
  const d = new Date();
  return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86_400_000);
};
const noop = () => () => {};
const N = quotes.length;

function Words({ text }: { text: string }) {
  return (
    <>
      {`“${text}”`.split(" ").map((w, i) => (
        <span key={i}><span className="qw" style={{ "--i": i } as React.CSSProperties}>{w}</span>{" "}</span>
      ))}
    </>
  );
}

const who = (q: Quote) => (q.mine ? "Tejas Thange" : q.by);

/** Gita, Kabir, Chanakya, Shankaracharya: ink on a palm-leaf manuscript, tied with cord. */
function Leaf({ q }: { q: Quote }) {
  return (
    <div className="relative w-full max-w-[1040px]">
      <div aria-hidden className="palm palm-back" />
      <div className="palm relative px-[64px] py-9 md:px-[124px] md:py-12">
        <span aria-hidden className="palm-hole left-[26px] md:left-[50px]" />
        <span aria-hidden className="palm-hole right-[26px] md:right-[50px]" />
        <svg aria-hidden viewBox="0 0 60 120" className="palm-cord absolute left-[18px] top-1/2 h-[120px] w-[60px] md:left-[42px]">
          <path d="M14 0 C 4 30, 30 50, 10 80 S 22 110, 6 120" fill="none" stroke="#8a2d1c" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
        {q.original && (
          <p lang={q.by === "Kabir" ? "hi" : "sa"} style={{ fontFamily: "var(--font-marathi)" }} className="palm-ink text-[clamp(20px,2.4vw,31px)] leading-[1.7]">
            {q.original}
          </p>
        )}
        <blockquote className={`palm-ink-soft font-sans text-[clamp(16px,1.6vw,20px)] italic leading-relaxed ${q.original ? "mt-4" : "text-[clamp(20px,2vw,26px)]"}`}>
          <Words text={q.text} />
        </blockquote>
        <p className="palm-ink mt-5 text-[15px]"><span className="italic">~ {who(q)}</span>{q.source && <span className="ml-2 font-mono text-[12px] opacity-70">{q.source}</span>}</p>
      </div>
    </div>
  );
}

/** Greek and Roman philosophers: a stone stele, with a pediment, a moulded cornice,
 *  a recessed panel with the words cut into it, and a plinth. */
function Stone({ q }: { q: Quote }) {
  return (
    <div className="stele w-full max-w-[860px]">
      <div aria-hidden className="stele-pediment">
        <svg viewBox="0 0 40 40" className="stele-rosette">
          <circle cx="20" cy="20" r="6" />
          {Array.from({ length: 8 }, (_, i) => (
            <ellipse key={i} cx="20" cy="9" rx="3.2" ry="7" transform={`rotate(${i * 45} 20 20)`} />
          ))}
        </svg>
      </div>
      <div aria-hidden className="stele-cornice" />
      <div className="stele-body">
        <div className="stele-panel px-6 py-10 text-center md:px-14 md:py-14">
          <blockquote style={{ fontFamily: "var(--font-cinzel)" }} className="stele-carve text-[clamp(19px,2.3vw,31px)] font-bold uppercase leading-[1.42] tracking-[0.05em]">
            <Words text={q.text} />
          </blockquote>
          <span aria-hidden className="stele-rule mx-auto mt-8 block" />
          <p style={{ fontFamily: "var(--font-cinzel)" }} className="stele-carve mt-5 text-[15px] font-bold uppercase tracking-[0.2em]">
            ~ {who(q)}
            {q.source && <span className="mt-1.5 block text-[11.5px] font-medium tracking-[0.18em] opacity-80">{q.source}</span>}
          </p>
        </div>
      </div>
      <div aria-hidden className="stele-base" />
    </div>
  );
}

/** Confucius and Lao Tzu: brushed onto a hanging rice-paper scroll, sealed in red. */
function Scroll({ q }: { q: Quote }) {
  return (
    <div className="relative w-full max-w-[600px]">
      <span aria-hidden className="scroll-rod" />
      <div className="scroll-paper relative px-9 pb-16 pt-12 md:px-14">
        <blockquote className="scroll-ink font-display text-[clamp(22px,2.5vw,32px)] font-medium leading-[1.4] tracking-[-0.01em]">
          <Words text={q.text} />
        </blockquote>
        <p className="scroll-ink mt-6 text-[15px]"><span className="italic">~ {who(q)}</span>{q.source && <span className="ml-2 font-mono text-[12px] opacity-60">{q.source}</span>}</p>
        <span aria-hidden className="scroll-seal">{q.by === "Lao Tzu" ? "老" : "孔"}</span>
      </div>
      <span aria-hidden className="scroll-rod" />
    </div>
  );
}

/** Modern thinkers: typed on an index card, taped down. */
function Paper({ q }: { q: Quote }) {
  return (
    <div className="paper relative w-full max-w-[760px] pb-12 pl-[72px] pr-8 pt-16 md:pr-14">
      <span aria-hidden className="paper-tape" />
      <blockquote style={{ fontFamily: "var(--font-typewriter)" }} className="paper-ink text-[clamp(20px,2.2vw,28px)] leading-[1.55]">
        <Words text={q.text} />
      </blockquote>
      <p style={{ fontFamily: "var(--font-typewriter)" }} className="paper-ink mt-7 text-[15.5px]">
        ~ {who(q)}{q.source && <span className="opacity-60">, {q.source}</span>}
      </p>
    </div>
  );
}

const ARTIFACT = { leaf: Leaf, stone: Stone, scroll: Scroll, paper: Paper };

export function DailyQuote() {
  const day = useSyncExternalStore(noop, today, () => -1);
  const idx = day < 0 ? -1 : day % N;
  const q = idx < 0 ? null : quotes[idx];
  const d = day < 0 ? null : new Date(day * 86_400_000);
  const fmt = (o: Intl.DateTimeFormatOptions) => (d ? d.toLocaleDateString("en-IN", { ...o, timeZone: "UTC" }) : "");
  const material = q ? materialOf(q) : "paper";
  const Artifact = ARTIFACT[material];

  return (
    <div data-material={material} className={`quote-stage relative transition-opacity duration-700 ${q ? "opacity-100" : "opacity-0"}`}>
      <div className="flex items-end justify-between gap-6">
        <h2 style={{ fontFamily: "var(--font-script)" }} className="text-[clamp(44px,5.4vw,72px)] leading-[0.9] text-ink">Today&apos;s quote</h2>
        <time dateTime={d?.toISOString().slice(0, 10)} className="cal shrink-0">
          <span className="cal-top">{fmt({ weekday: "short" })}</span>
          <span className="cal-day">{fmt({ day: "numeric" })}</span>
          <span className="cal-month">{fmt({ month: "long" })}</span>
        </time>
      </div>

      {/* the material sits in its own pool of light, not in a box */}
      <div className="relative mt-10 flex min-h-[340px] items-center justify-center py-6 md:mt-12">
        <span aria-hidden className="quote-ambient" />
        <AnimatePresence mode="wait" initial={false}>
          {q && (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(6px)", transition: { duration: 0.2 } }}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              className="flex w-full justify-center"
            >
              <Artifact q={q} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
