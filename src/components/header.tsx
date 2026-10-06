"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowUpRight } from "@phosphor-icons/react";
import { ThemeToggle } from "./theme-toggle";
import { person } from "@/content/site";

const links = [
  { id: "home", label: "Home", href: "/" },
  { id: "work", label: "Work", href: "/work" },
  { id: "experience", label: "Experience", href: "/experience" },
  { id: "space", label: "Space", href: "/space" },
  { id: "contact", label: "Contact", href: "/#contact" },
];

export function Header() {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const [spy, setSpy] = useState<string | null>(null);
  // Pages light their own tab; on the home page, the tab follows the section in view.
  const active = onHome ? (spy ?? "home") : pathname.startsWith("/work") ? "work" : pathname.startsWith("/experience") ? "experience" : pathname.startsWith("/space") ? "space" : null;
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    if (!onHome) return;
    // Home-page sections and the tab each one lights: the preview of the work, the short about
    // (Experience), and contact. Whichever crosses the middle band of the screen wins.
    const map: Record<string, string> = { work: "work", about: "experience", contact: "contact" };
    const els = Object.keys(map).map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    const inView = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) { if (e.isIntersecting) inView.add(e.target.id); else inView.delete(e.target.id); }
        const current = els.find((el) => inView.has(el.id));
        setSpy(current ? map[current.id] : null);
      },
      { rootMargin: "-40% 0px -45% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [onHome, pathname]);

  const highlighted = hovered ?? active;

  return (
    <header className="sticky top-3 z-40 mx-auto mt-3 w-fit max-w-[calc(100%-24px)]">
      <div className="flex items-center gap-1 rounded-full border border-line bg-surface/80 p-1 shadow-[0_8px_30px_-12px_rgb(0_0_0/0.5)] backdrop-blur-xl">
        <nav aria-label="Primary" className="flex" onMouseLeave={() => setHovered(null)}>
          {links.map((l) => (
            <Link
              key={l.id}
              href={onHome && l.id === "contact" ? "#contact" : l.href}
              onClick={(e) => {
                if (!onHome) return;
                // Already home: glide back to the top instead of reloading the route.
                if (l.id === "home") { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); history.replaceState(null, "", "/"); }
                // Scroll ourselves: if the address already ends in #contact (say, after a refresh),
                // following the same hash again does nothing.
                if (l.id === "contact") {
                  e.preventDefault();
                  document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
                  history.replaceState(null, "", "#contact");
                }
              }}
              onMouseEnter={() => setHovered(l.id)}
              aria-current={active === l.id ? "page" : undefined}
              className={`relative rounded-full px-[7px] py-1.5 text-[13.5px] font-medium transition-colors duration-200 sm:px-3.5 sm:text-[14px] ${
                highlighted === l.id ? "text-ink" : "text-muted"
              }`}
            >
              {highlighted === l.id && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 -z-10 rounded-full bg-raised"
                  transition={{ type: "spring", duration: 0.45, bounce: 0.15 }}
                />
              )}
              {l.label}
            </Link>
          ))}
        </nav>
        <span aria-hidden className="mx-1 h-4 w-px bg-line-2" />
        <a
          href={person.resume}
          target="_blank"
          rel="noopener"
          className="hidden items-center gap-1 rounded-full px-3 py-1.5 text-[14px] font-medium text-ink-2 transition-colors duration-200 hover:text-ink sm:inline-flex"
        >
          Résumé <ArrowUpRight size={13} />
        </a>
        <ThemeToggle />
      </div>
    </header>
  );
}
