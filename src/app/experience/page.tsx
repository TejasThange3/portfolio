import type { Metadata } from "next";
import { pageMeta } from "@/lib/site-url";
import { About } from "@/components/about";
import { StackMarquee } from "@/components/stack-marquee";
import { SectionHead } from "@/components/work";

export const metadata: Metadata = pageMeta("Experience, Tejas Thange", "Where Tejas Thange has worked and studied, from the RAG backend at Mimic Productions to a B.Tech in AI and ML, and the tools he uses.", "/experience");

export default function ExperiencePage() {
  return (
    <>
      <section className="mx-auto max-w-[1200px] px-4 pt-14 md:px-8 md:pt-20">
        <SectionHead as="h1" title="Experience" sub="Where I've worked and what I did there. Click the underlined parts for more." />
        <div className="reveal mt-10"><About /></div>
      </section>

      <section id="stack" className="pb-16 pt-24 md:pb-20 md:pt-32">
        <div className="mx-auto max-w-[1200px] px-4 md:px-8">
          <SectionHead title="Stack" sub="The tools I use most." />
        </div>
        <div className="reveal mx-auto mt-10 max-w-[1400px]"><StackMarquee /></div>
      </section>
    </>
  );
}
