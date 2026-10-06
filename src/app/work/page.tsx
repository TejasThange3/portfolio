import type { Metadata } from "next";
import { pageMeta } from "@/lib/site-url";
import { DigitLab } from "@/components/digit-lab";
import { SpotCard } from "@/components/spot-card";
import { BuildCards, ProjectCard, SectionHead } from "@/components/work";

export const metadata: Metadata = pageMeta("Work, Tejas Thange", "Machine learning projects, interface builds and an in-browser digit recognizer you can quantize, by Tejas Thange.", "/work");

export default function WorkPage() {
  return (
    <>
      <section className="mx-auto max-w-[1200px] px-4 pt-14 md:px-8 md:pt-20">
        <SectionHead as="h1" title="Work" sub="Models I've trained and the interfaces I've built around them. Each ML project has a case study." />
        <div className="mt-10 grid gap-4 md:grid-cols-12">
          <ProjectCard slug="docqa" span="md:col-span-7" />
          <ProjectCard slug="ganscape" span="md:col-span-5" />
          <ProjectCard slug="pest-detection" span="md:col-span-5" />
          <ProjectCard slug="bipedal-agents" span="md:col-span-7" />
        </div>
      </section>

      <section id="builds" className="mx-auto max-w-[1200px] px-4 pt-24 md:px-8 md:pt-32">
        <SectionHead title="Builds" sub="Websites I designed and built myself." />
        <div className="mt-10 grid gap-4 md:grid-cols-12"><BuildCards /></div>
      </section>

      <section id="playground" className="mx-auto max-w-[1200px] px-4 pb-16 pt-24 md:px-8 md:pb-20 md:pt-32">
        <SectionHead title="Playground" sub="Draw up to three digits, then lower the weight precision and see when it starts getting them wrong." />
        <SpotCard as="div" className="reveal card mt-10 p-5 md:p-10"><DigitLab /></SpotCard>
      </section>
    </>
  );
}
