"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle, PaperPlaneTilt } from "@phosphor-icons/react";
import { person } from "@/content/site";

const MODES = [
  { id: "ask", label: "Ask me anything" },
  { id: "recommend", label: "Recommend me something" },
] as const;
const KINDS = ["Book", "Film", "Series", "Anime"] as const;
type Status = "idle" | "sending" | "sent" | "error";

/** Two modes, one form. Messages go straight to Tejas's inbox (see app/api/ask/route.ts). */
export function AskForm() {
  const [mode, setMode] = useState<(typeof MODES)[number]["id"]>("ask");
  const [kind, setKind] = useState<(typeof KINDS)[number]>("Book");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // hidden trap field: people never see it, bots fill it
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const startedAt = useRef(0);

  const touch = () => { if (!startedAt.current) startedAt.current = Date.now(); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending"); setError("");
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, kind, title, message, name, email, website, startedAt: startedAt.current || Date.now() }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || "Couldn't send right now.");
      setStatus("sent");
      setTitle(""); setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send right now.");
      setStatus("error");
    }
  };

  const field = "w-full rounded-[14px] border border-line bg-bg px-4 py-3 text-[15px] text-ink placeholder:text-muted outline-none transition-colors duration-200 focus:border-line-2";

  return (
    <AnimatePresence mode="wait" initial={false}>
      {status === "sent" ? (
        <motion.div
          key="sent"
          initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          className="flex h-full flex-col items-start justify-center gap-4"
        >
          <CheckCircle size={40} weight="duotone" style={{ color: "rgb(var(--glow))" }} />
          <p className="font-display text-[26px] font-bold tracking-[-0.02em]">Got it, thank you{name ? `, ${name}` : ""}.</p>
          <p className="max-w-[40ch] text-[15.5px] leading-relaxed text-ink-2">
            {email ? "It's in my inbox, and I'll reply to the address you left." : "It's in my inbox. I read every one."}
          </p>
          <button type="button" onClick={() => setStatus("idle")} className="btn btn-secondary btn-sm mt-2">Send another</button>
        </motion.div>
      ) : (
        <motion.form key="form" onSubmit={submit} onFocus={touch} exit={{ opacity: 0, y: -6 }} className="space-y-4">
          <div role="tablist" aria-label="What would you like to do?" className="inline-flex flex-wrap rounded-full border border-line bg-bg p-1">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                role="tab"
                aria-selected={mode === m.id}
                onClick={() => setMode(m.id)}
                className={`relative z-10 h-9 cursor-pointer rounded-full px-4 text-[14px] font-medium transition-colors duration-200 ${mode === m.id ? "text-bg" : "text-ink-2 hover:text-ink"}`}
              >
                {mode === m.id && <motion.span layoutId="ask-pill" className="absolute inset-0 -z-10 rounded-full bg-ink" transition={{ type: "spring", duration: 0.4, bounce: 0.15 }} />}
                {m.label}
              </button>
            ))}
          </div>

          {mode === "recommend" && (
            <div className="grid gap-3 sm:grid-cols-[auto_1fr]">
              <div className="flex gap-1.5">
                {KINDS.map((k) => (
                  <button
                    key={k}
                    type="button"
                    aria-pressed={kind === k}
                    onClick={() => setKind(k)}
                    className={`h-[50px] cursor-pointer rounded-[14px] border px-3.5 text-[14px] font-medium transition-colors duration-200 ${kind === k ? "border-line-2 bg-raised text-ink" : "border-line text-ink-2 hover:text-ink"}`}
                  >
                    {k}
                  </button>
                ))}
              </div>
              <input required maxLength={200} value={title} onChange={(e) => setTitle(e.target.value)} placeholder={`Which ${kind.toLowerCase()}?`} aria-label="Title" className={field} />
            </div>
          )}

          <textarea
            required={mode === "ask"}
            maxLength={4000}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder={mode === "ask" ? "Anything at all: the work, cricket, a film you think I'd hate." : "Why should I read or watch it? (optional)"}
            aria-label="Message"
            className={`${field} resize-none`}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <input maxLength={100} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name (optional)" aria-label="Your name" autoComplete="name" className={field} />
            <input type="email" maxLength={200} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email, if you'd like a reply" aria-label="Your email" autoComplete="email" className={field} />
          </div>
          {/* trap for bots: off-screen and skipped by keyboard and screen readers */}
          <input
            tabIndex={-1}
            aria-hidden
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            name="website"
            className="absolute left-[-9999px] h-px w-px opacity-0"
          />
          <div className="flex flex-wrap items-center gap-4">
            <button type="submit" disabled={status === "sending"} className="btn btn-primary disabled:cursor-wait disabled:opacity-70">
              <PaperPlaneTilt size={16} className={status === "sending" ? "animate-pulse" : ""} />
              {status === "sending" ? "Sending…" : "Send"}
            </button>
            {status === "error" && (
              <p role="alert" className="text-[14px] text-ink-2">
                {error} You can also email me at{" "}
                <a href={`mailto:${person.inbox}`} className="text-ink underline decoration-line-2 underline-offset-4">{person.inbox}</a>.
              </p>
            )}
          </div>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
