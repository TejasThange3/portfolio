import Link from "next/link";
import { DownloadSimple } from "@phosphor-icons/react/dist/ssr";
import { NameFlicker } from "@/components/name-flicker";
import { PaintingBanner } from "@/components/painting-banner";
import { RollLabel } from "@/components/roll-label";
import { CopyEmail } from "@/components/copy-email";
import { SpotCard } from "@/components/spot-card";
import { SocialDock } from "@/components/social-dock";
import { ContactLinks } from "@/components/contact-links";
import { ProjectCard, SectionHead } from "@/components/work";
import { builds, caseStudies, experience, person } from "@/content/site";

const rl = caseStudies.find((c) => c.slug === "bipedal-agents")!;
const moreWork = [
  { title: rl.title, kind: rl.kind, href: `/work/${rl.slug}` },
  ...builds.map((b) => ({ title: b.title, kind: b.kind, href: "/work#builds" })),
  { title: "Playground", kind: "Draw it, then quantize it", href: "/work#playground" },
];

export default function Home() {
  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="mx-auto max-w-[1200px] px-4 pt-6 md:px-8 md:pt-8">
        <div className="enter"><PaintingBanner /></div>

        <div className="mt-10 grid items-end gap-8 md:mt-12 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-7">
            <div className="enter" style={{ "--d": 1 } as React.CSSProperties}>
              <NameFlicker en={person.nameEn} mr={person.nameMr} className="text-[clamp(48px,6.4vw,88px)]" />
            </div>
            <p className="enter mt-1 font-display text-[clamp(20px,2.1vw,27px)] font-medium leading-[1.3] tracking-[-0.02em] text-ink-2" style={{ "--d": 2 } as React.CSSProperties}>
              AI/ML engineer. I build with LLMs by day and argue about random stuff by night.
            </p>
          </div>
          <div className="enter md:col-span-5 md:pb-2" style={{ "--d": 3 } as React.CSSProperties}>
            <p className="max-w-[46ch] text-[16.5px] leading-relaxed text-ink-2">
              Right now I&apos;m interning at Mimic Productions, working on the RAG backend behind their AI avatars. Before that I built a
              pest detector that runs on a Raspberry Pi and a GAN that generates 3D terrain. I&apos;m based in Pune and looking for a
              full-time role in AI/ML.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <a href="#work" className="btn btn-primary roll-host"><RollLabel text="View work" /></a>
              <a href={person.resume} target="_blank" rel="noopener" className="btn btn-secondary roll-host">
                <DownloadSimple size={16} /> <RollLabel text="Résumé" />
              </a>
            </div>
            {/* Its own line, so the dock can open its labels without pushing the buttons around. */}
            <div className="mt-3"><SocialDock /></div>
          </div>
        </div>
      </section>

      {/* ---------- Work (a preview; the rest lives on /work) ---------- */}
      <section id="work" className="mx-auto max-w-[1200px] px-4 pt-28 md:px-8 md:pt-36">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHead title="Selected work" sub="Some of the projects I've built." />
          <Link href="/work" className="reveal btn btn-secondary btn-sm">All work</Link>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-12">
          <ProjectCard slug="docqa" span="md:col-span-7" />
          <ProjectCard slug="ganscape" span="md:col-span-5" />
          <ProjectCard slug="pest-detection" span="md:col-span-5" />
          <SpotCard as="div" className="reveal card flex flex-col p-2 md:col-span-7">
            <p className="px-4 pb-2 pt-4 text-[13px] text-muted md:px-5">Also on the work page</p>
            <ul className="flex-1">
              {moreWork.map((w) => (
                <li key={w.title}>
                  <Link href={w.href} className="group flex items-baseline justify-between gap-4 rounded-[14px] px-4 py-4 transition-colors duration-200 hover:bg-raised md:px-5">
                    <span className="font-display text-[clamp(20px,2vw,24px)] font-bold tracking-[-0.02em]">{w.title}</span>
                    <span className="shrink-0 text-right text-[14px] text-muted transition-colors duration-200 group-hover:text-ink-2">{w.kind}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/work" className="btn btn-primary m-3 mt-4 md:m-4">See all work</Link>
          </SpotCard>
        </div>
      </section>

      {/* ---------- About (short; the full story lives on /experience) ---------- */}
      <section id="about" className="mx-auto max-w-[1200px] px-4 pt-28 md:px-8 md:pt-36">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-6">
            <SectionHead title="About" />
            <p className="reveal mt-8 max-w-[52ch] text-[18px] leading-[1.75] text-ink-2">
              I finished my B.Tech in AI and Machine Learning at Symbiosis Institute of Technology, Pune, in 2026. I&apos;m now an AI
              programming intern at Mimic Productions, where I work on the RAG backend for their AI avatars. I like working on the whole
              thing: the data, the model, the backend and the screen people actually use. Outside work I draw portraits and watch a lot
              of cricket and football.
            </p>
          </div>
          <div className="reveal md:col-span-6 md:pt-3">
            <ol className="border-t border-line">
              {experience.map((e) => (
                <li key={e.org} className="flex items-center gap-4 border-b border-line py-5">
                  <span aria-hidden className="grid size-11 shrink-0 place-items-center rounded-[13px] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08),0_1px_2px_rgb(0_0_0/0.3)]" style={{ background: e.logo.tile, padding: e.logo.pad }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={e.logo.src} alt="" className="h-full w-full object-contain" />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                    <span>
                      <span className="block font-display text-[21px] font-bold leading-tight tracking-[-0.015em]">{e.org}</span>
                      <span className="mt-1 block text-[14.5px] text-ink-2">{e.role}</span>
                    </span>
                    <span className="font-mono text-[12.5px] text-ink">{e.period}</span>
                  </span>
                </li>
              ))}
            </ol>
            <Link href="/experience" className="btn btn-secondary btn-sm mt-6">Full experience</Link>
          </div>
        </div>
      </section>

      {/* ---------- Contact ---------- */}
      <section id="contact" className="mx-auto max-w-[1200px] px-4 pb-16 pt-28 md:px-8 md:pb-20 md:pt-36">
        <SpotCard as="div" className="reveal card px-6 py-12 md:px-14 md:py-16">
          <h2 className="max-w-[20ch] font-display text-[clamp(32px,4.4vw,56px)] font-bold leading-[1.05] tracking-[-0.03em]">
            Hiring for an AI/ML role? I&apos;d like to hear about it.
          </h2>
          <div className="mt-9"><CopyEmail email={person.email} /></div>
          <div className="mt-9"><ContactLinks /></div>
        </SpotCard>
      </section>
    </>
  );
}
