"use client";

import { useState } from "react";
import { Check, Copy } from "@phosphor-icons/react";

export function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <a
        href={`mailto:${email}`}
        className="font-display text-[clamp(26px,4.2vw,52px)] font-bold leading-tight tracking-[-0.02em] text-ink underline decoration-line decoration-2 underline-offset-[10px] transition-[text-decoration-color] duration-300 hover:decoration-accent"
      >
        {email}
      </a>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Email copied" : "Copy email address"}
        className="relative grid size-11 cursor-pointer place-items-center rounded-full border border-line text-ink-2 transition-[transform,background-color,color] duration-200 ease-out hover:bg-surface hover:text-ink active:scale-95"
      >
        <span className={`absolute transition-all duration-200 ${copied ? "scale-75 opacity-0 blur-[2px]" : "opacity-100"}`}>
          <Copy size={18} />
        </span>
        <span className={`absolute text-accent transition-all duration-200 ${copied ? "opacity-100" : "scale-75 opacity-0 blur-[2px]"}`}>
          <Check size={18} weight="bold" />
        </span>
      </button>
      <span role="status" className="sr-only">{copied ? "Email address copied" : ""}</span>
    </div>
  );
}
