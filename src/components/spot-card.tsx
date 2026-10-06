"use client";

import { useRef } from "react";

/** Card whose rim and surface catch a soft light under the cursor. Writes CSS vars directly, no re-renders. */
export function SpotCard({ className = "", children, as: Tag = "article" }: { className?: string; children: React.ReactNode; as?: "article" | "div" | "li" }) {
  const ref = useRef<HTMLElement>(null);
  return (
    <Tag
      ref={ref as never}
      className={`spot ${className}`}
      onPointerMove={(e: React.PointerEvent<HTMLElement>) => {
        const el = ref.current; if (!el) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - r.left}px`);
        el.style.setProperty("--my", `${e.clientY - r.top}px`);
      }}
    >
      {children}
    </Tag>
  );
}
