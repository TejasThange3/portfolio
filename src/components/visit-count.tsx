"use client";

import { useEffect, useRef, useState } from "react";

// Each browser gets its own number the first time it visits and keeps it. The number rolls into place,
// odometer style, the first time the footer comes into view.
//
// Open the site once with ?notme to stop counting this browser (it then shows the total instead);
// ?countme undoes that.

type Result = { kind: "new" | "back"; n: number } | { kind: "total"; n: number };

const ID_KEY = "visitor-id";
const ME_KEY = "visitor-notme";
let pending: Promise<Result | null> | null = null; // one request per page load, even if this mounts twice

function store(key: string, value?: string | null) {
  try {
    if (value === undefined) return localStorage.getItem(key);
    if (value === null) localStorage.removeItem(key); else localStorage.setItem(key, value);
  } catch {}
  return null;
}

function load(): Promise<Result | null> {
  if (pending) return pending;
  const q = new URLSearchParams(location.search);
  if (q.has("notme")) store(ME_KEY, "1");
  if (q.has("countme")) store(ME_KEY, null);

  pending = (async () => {
    try {
      if (store(ME_KEY) === "1") {
        const { total } = (await (await fetch("/api/visit")).json()) as { total: number | null };
        return total ? { kind: "total", n: total } : null;
      }
      let id = store(ID_KEY);
      if (!id) { id = crypto.randomUUID(); store(ID_KEY, id); }
      const res = (await (await fetch("/api/visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })).json()) as { n: number | null; returning?: boolean };
      return res.n ? { kind: res.returning ? "back" : "new", n: res.n } : null;
    } catch {
      return null;
    }
  })();
  return pending;
}

const ordinal = (n: number) => {
  const t = n % 100;
  if (t >= 11 && t <= 13) return "th";
  return ["th", "st", "nd", "rd"][n % 10] ?? "th";
};

function Odometer({ value, on }: { value: number; on: boolean }) {
  const chars = value.toLocaleString("en-IN").split("");
  const digits = chars.filter((c) => /\d/.test(c)).length;
  let seen = 0;
  return (
    <span className="odo">
      {chars.map((c, i) => {
        if (!/\d/.test(c)) return <span key={i}>{c}</span>;
        const fromRight = digits - 1 - seen++;
        return (
          <span key={i} className="odo-col">
            <span
              className="odo-strip"
              style={{ "--to": on ? Number(c) : 0, "--k": fromRight } as React.CSSProperties}
            >
              {"0123456789".split("").map((d) => <span key={d}>{d}</span>)}
            </span>
          </span>
        );
      })}
    </span>
  );
}

export function VisitCount() {
  const ref = useRef<HTMLParagraphElement>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    let alive = true;
    load().then((r) => { if (alive) setResult(r); });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || !result) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 1 });
    io.observe(el);
    return () => io.disconnect();
  }, [result]);

  if (!result) return <p ref={ref} aria-hidden className="h-[1.6em]" />;

  const num = (
    <span className="visit-num font-mono font-medium">
      <Odometer value={result.n} on={on} />
      {result.kind !== "total" && ordinal(result.n)}
    </span>
  );
  const label = result.n.toLocaleString("en-IN");
  const nth = `${label}${ordinal(result.n)}`;
  const people = result.n === 1 ? "person has" : "people have";
  const said =
    result.kind === "new" ? `You're the ${nth} person to stop by.` :
    result.kind === "back" ? `Welcome back. You were the ${nth}.` :
    `${label} ${people} stopped by.`;

  return (
    <p ref={ref} className="visit-count text-[13px] leading-[1.6] text-ink-2">
      {/* the rolling digits are for the eye; screen readers get the plain sentence */}
      <span aria-hidden>
        {result.kind === "new" && <>You&apos;re the {num} person to stop by.</>}
        {result.kind === "back" && <>Welcome back. You were the {num}.</>}
        {result.kind === "total" && <>{num} {people} stopped by.</>}
      </span>
      <span className="sr-only">{said}</span>
    </p>
  );
}
