"use client";

import { useRef } from "react";
import { DownloadSimple, GithubLogo, LinkedinLogo } from "@phosphor-icons/react";
import { RollLabel } from "./roll-label";
import { person } from "@/content/site";

const links = [
  { label: "LinkedIn", detail: "in/tejas03", action: "Connect", href: person.linkedin, Icon: LinkedinLogo, brand: "var(--brand-linkedin)", download: false },
  { label: "GitHub", detail: "TejasThange3", action: "See the code", href: person.github, Icon: GithubLogo, brand: "var(--ink)", download: false },
  { label: "Résumé", detail: "PDF, one click", action: "Download", href: person.resume, Icon: DownloadSimple, brand: "rgb(var(--glow))", download: true },
];

/** Three link tiles. Under the pointer a tile lifts, washes with its brand colour where the cursor is,
 *  fills its icon, and rolls its action label in. */
export function ContactLinks() {
  return (
    <ul className="grid gap-2.5 sm:grid-cols-3">
      {links.map((l) => <Tile key={l.label} {...l} />)}
    </ul>
  );
}

function Tile({ label, detail, action, href, Icon, brand, download }: (typeof links)[number]) {
  const ref = useRef<HTMLAnchorElement>(null);
  return (
    <li>
      <a
        ref={ref}
        href={href}
        target="_blank"
        rel="noopener"
        download={download ? "Tejas-Thange-Resume.pdf" : undefined}
        onPointerMove={(e) => {
          const el = ref.current; if (!el) return;
          const r = el.getBoundingClientRect();
          el.style.setProperty("--tx", `${e.clientX - r.left}px`);
          el.style.setProperty("--ty", `${e.clientY - r.top}px`);
        }}
        style={{ "--brand": brand } as React.CSSProperties}
        className="contact-tile roll-host group relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-[18px] border border-line bg-bg/50 p-4 transition-[transform,border-color,background-color] duration-300 ease-out active:scale-[0.98] sm:p-5"
      >
        <span className="flex items-start justify-between gap-3">
          <span className="grid size-11 place-items-center rounded-[13px] border border-line bg-surface text-ink-2 transition-[color,background-color,border-color,transform] duration-300 ease-out group-hover:-rotate-6 group-hover:scale-105 group-hover:border-transparent group-hover:text-[var(--brand)]">
            <Icon size={21} weight="regular" className="contact-icon" />
          </span>
          <span className="font-mono text-[12px] text-muted transition-colors duration-300 group-hover:text-ink-2">{detail}</span>
        </span>
        <span className="flex items-end justify-between gap-3">
          <span className="font-display text-[22px] font-bold tracking-[-0.02em]">{label}</span>
          <span className="text-[13.5px] font-medium text-ink-2 transition-colors duration-300 group-hover:text-ink"><RollLabel text={action} /></span>
        </span>
      </a>
    </li>
  );
}
