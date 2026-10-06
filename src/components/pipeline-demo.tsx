"use client";

import { useEffect, useRef, useState } from "react";

type Step = { node: Node; log: string };
type Node = "retrieve" | "grade" | "rewrite" | "generate" | "refuse";

const NODES: { id: Node; label: string }[] = [
  { id: "retrieve", label: "Retrieve" },
  { id: "grade", label: "Grade" },
  { id: "rewrite", label: "Rewrite" },
  { id: "generate", label: "Answer" },
];

// Illustrative traces of the corrective-RAG control flow. Not recorded runs.
const RUNS: { q: string; steps: Step[] }[] = [
  {
    q: "What does Table 3 say about peak load?",
    steps: [
      { node: "retrieve", log: "dense top-k, then BGE rerank" },
      { node: "grade", log: "context answers the question" },
      { node: "generate", log: "grounded answer, cited to its page and table" },
    ],
  },
  {
    q: "Who is the author's manager?",
    steps: [
      { node: "retrieve", log: "dense top-k, then BGE rerank" },
      { node: "grade", log: "context is not enough" },
      { node: "rewrite", log: "query rewritten, one retry allowed" },
      { node: "retrieve", log: "search again with the new query" },
      { node: "grade", log: "still not in the document" },
      { node: "refuse", log: "\"I don't know based on this document.\"" },
    ],
  },
];

export function PipelineDemo() {
  const [run, setRun] = useState(0);
  const [step, setStep] = useState(-1);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const started = useRef(false);
  function play(r: number) {
    started.current = true;
    setRun(r);
    setStep(0);
    if (timer.current) clearInterval(timer.current);
    let i = 0;
    timer.current = setInterval(() => {
      i += 1;
      if (i >= RUNS[r].steps.length) { if (timer.current) clearInterval(timer.current); return; }
      setStep(i);
    }, 700);
  }
  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  // Play the first trace once, the first time the demo scrolls into view.
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { io.disconnect(); setTimeout(() => { if (!started.current) play(0); }, 400); }
    }, { threshold: 0.6 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const trace = RUNS[run].steps.slice(0, step + 1);
  const current = step >= 0 ? RUNS[run].steps[step].node : null;
  const visited = new Set<Node>(trace.map((s) => (s.node === "refuse" ? "generate" : s.node)));
  const refused = current === "refuse";

  return (
    <div ref={root}>
      <div className="flex flex-wrap gap-2">
        {RUNS.map((r, i) => (
          <button
            key={r.q}
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); play(i); }}
            className={`chip h-auto cursor-pointer py-1 text-left transition-colors duration-200 ${run === i && step >= 0 ? "border-line-2 text-ink" : "hover:text-ink"}`}
          >
            {r.q}
          </button>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-4 gap-1.5">
        {NODES.map((n) => {
          const isCur = current === n.id || (n.id === "generate" && refused);
          return (
            <div
              key={n.id}
              className={`rounded-xl border px-2 py-2.5 text-center text-[13px] font-medium transition-all duration-300 ease-out ${
                isCur
                  ? refused && n.id === "generate" ? "border-line-2 bg-raised text-ink-2" : "border-accent/50 bg-accent/10 text-ink"
                  : visited.has(n.id) ? "border-line-2 text-ink-2" : "border-line text-muted"
              }`}
            >
              {n.id === "generate" && refused ? "Refuse" : n.label}
            </div>
          );
        })}
      </div>

      <ol className="mt-4 min-h-[132px] space-y-1.5 font-mono text-[12px] leading-relaxed">
        {step < 0 && <li className="text-muted">Pick a question to trace it through the graph.</li>}
        {trace.map((s, i) => (
          <li key={i} className="enter flex gap-3 text-ink-2">
            <span className="w-16 shrink-0 text-muted">{s.node}</span>
            <span className={s.node === "refuse" ? "text-ink" : s.node === "generate" ? "text-accent" : ""}>{s.log}</span>
          </li>
        ))}
      </ol>
      <p className="text-[12px] text-muted">Illustration of the LangGraph control flow, not a recorded run.</p>
    </div>
  );
}
