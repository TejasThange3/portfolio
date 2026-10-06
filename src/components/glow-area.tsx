"use client";

import { useRef } from "react";

/** The text half of a work card. Tracks the pointer so the coloured pixel field follows it (dark mode, CSS-gated). */
export function GlowArea({ className = "", children }: { className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      className={`glow-area ${className}`}
      onPointerMove={(e) => {
        const el = ref.current; if (!el) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--gx", `${e.clientX - r.left}px`);
        el.style.setProperty("--gy", `${e.clientY - r.top}px`);
      }}
    >
      {children}
    </div>
  );
}
