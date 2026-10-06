"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Envelope, GithubLogo, LinkedinLogo } from "@phosphor-icons/react";
import { person } from "@/content/site";

const items = [
  { id: "github", label: "GitHub", href: person.github, Icon: GithubLogo, tint: "var(--ink)" },
  { id: "linkedin", label: "LinkedIn", href: person.linkedin, Icon: LinkedinLogo, tint: "#3d8fe0" },
  { id: "email", label: "Email", href: `mailto:${person.email}`, Icon: Envelope, tint: "rgb(var(--glow))" },
];

/** The three links as one dock. The one under the pointer (or keyboard focus) lifts into a pill,
 *  takes its brand colour and slides its name out. */
export function SocialDock() {
  const [active, setActive] = useState<string | null>(null);
  return (
    <nav aria-label="Elsewhere" className="inline-flex h-[46px] items-center rounded-full border border-line-2 p-1" onMouseLeave={() => setActive(null)}>
      {items.map(({ id, label, href, Icon, tint }) => {
        const on = active === id;
        return (
          <a
            key={id}
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel="noopener"
            aria-label={label}
            onMouseEnter={() => setActive(id)}
            onFocus={() => setActive(id)}
            onBlur={() => setActive(null)}
            className="relative flex h-full items-center rounded-full px-[10px] text-ink-2 outline-offset-2 transition-[color,transform] duration-200 active:scale-95"
            style={on ? { color: "var(--ink)" } : undefined}
          >
            {on && (
              <motion.span
                layoutId="dock-pill"
                aria-hidden
                className="absolute inset-0 rounded-full bg-raised shadow-[inset_0_1px_0_rgb(255_255_255/0.06),0_1px_2px_rgb(0_0_0/0.2)]"
                transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
              />
            )}
            <Icon size={19} weight={on ? "fill" : "regular"} className="relative transition-colors duration-200" style={on ? { color: tint } : undefined} />
            {/* 0fr -> 1fr: the label's width animates to its real size, so nothing gets clipped */}
            <span
              aria-hidden
              className={`relative grid transition-[grid-template-columns,opacity,filter] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${on ? "grid-cols-[1fr] opacity-100 blur-0" : "grid-cols-[0fr] opacity-0 blur-[3px]"}`}
            >
              <span className="overflow-hidden whitespace-nowrap text-[14px] font-medium">
                <span className="block pl-2 pr-0.5">{label}</span>
              </span>
            </span>
          </a>
        );
      })}
    </nav>
  );
}
