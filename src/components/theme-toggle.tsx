"use client";

import { Moon, Sun } from "@phosphor-icons/react";

export function ThemeToggle() {
  function toggle() {
    const root = document.documentElement;
    const next = root.dataset.theme === "light" ? "dark" : "light";
    const apply = () => {
      root.dataset.theme = next;
      try {
        sessionStorage.setItem("theme", next);
      } catch {}
    };
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!document.startViewTransition || reduce) return apply();
    // The two sword strokes exist only in the new state, so they draw above both snapshots (see globals.css).
    const blades = [
      ["blade-1", "0", "0", "100%", "100%"],
      ["blade-2", "100%", "0", "0", "100%"],
    ].map(([cls, x1, y1, x2, y2]) => {
      const el = document.createElement("div");
      el.className = `blade ${cls}`;
      el.setAttribute("aria-hidden", "true");
      el.innerHTML = `<svg><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" /></svg>`;
      return el;
    });
    const vt = document.startViewTransition(() => { apply(); blades.forEach((b) => document.body.append(b)); });
    vt.finished.finally(() => blades.forEach((b) => b.remove()));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Switch between dark and light theme"
      className="grid size-9 cursor-pointer place-items-center rounded-full text-ink-2 transition-[transform,background-color,color] duration-200 ease-out hover:bg-raised hover:text-ink active:scale-95"
    >
      <Sun size={18} className="[[data-theme=light]_&]:hidden" />
      <Moon size={18} className="hidden [[data-theme=light]_&]:block" />
    </button>
  );
}
