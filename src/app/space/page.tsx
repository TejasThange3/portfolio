import type { Metadata } from "next";
import { pageMeta } from "@/lib/site-url";
import { DailyQuote } from "@/components/daily-quote";
import { AskForm } from "@/components/ask-form";
import { HeroGallery } from "@/components/hero-gallery";
import { AnimeCarousel } from "@/components/anime-carousel";
import { FilmStrip } from "@/components/film-strip";
import { BookShelf } from "@/components/book-shelf";
import { SectionHead } from "@/components/work";
import { cinzel, script, typewriter } from "./fonts";

export const metadata: Metadata = pageMeta("Space, Tejas Thange", "Things Tejas Thange likes outside of work: people he looks up to, films, anime, books, and a quote for each day.", "/space");

export default function SpacePage() {
  return (
    <div className={`${cinzel.variable} ${typewriter.variable} ${script.variable}`}>
      <section className="mx-auto max-w-[1200px] px-4 pt-14 md:px-8 md:pt-20">
        <SectionHead as="h1" title="Space" sub="Things I like outside of work." />
        <div className="reveal mt-10"><DailyQuote /></div>
      </section>

      <section className="mx-auto max-w-[1200px] px-4 pt-24 md:px-8 md:pt-32">
        <SectionHead title="Inspiration" sub="People I look up to. They come from very different worlds, but none of them gave up when it got hard." />
        <div className="reveal mt-10"><HeroGallery /></div>
      </section>

      <section className="mx-auto max-w-[1200px] px-4 pt-24 md:px-8 md:pt-32">
        <SectionHead title="Films" sub="The ones I can watch again and again." />
        <div className="reveal mt-8"><FilmStrip /></div>
      </section>

      <section className="mx-auto max-w-[1200px] px-4 pt-24 md:px-8 md:pt-32">
        <SectionHead title="Anime" sub="Some anime I've watched so far." />
        <div className="reveal mt-10"><AnimeCarousel /></div>
      </section>

      <section className="mx-auto max-w-[1200px] px-4 pt-24 md:px-8 md:pt-32">
        <SectionHead title="Shelf" sub="Books that actually changed a few of my habits." />
        <div className="reveal mt-14"><BookShelf /></div>
      </section>

      <section id="ask" className="mx-auto max-w-[1200px] px-4 pb-16 pt-24 md:px-8 md:pb-20 md:pt-32">
        <div className="reveal card grid gap-10 px-6 py-10 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:px-12 md:py-14">
          <div>
            <h2 className="font-display text-[clamp(30px,3.6vw,46px)] font-bold leading-[1.05] tracking-[-0.03em]">Ask me anything, or tell me what to watch next.</h2>
            <p className="mt-4 max-w-[38ch] text-[16px] leading-relaxed text-ink-2">
              Questions about the work, a book I have to read, an anime I somehow missed. It all comes straight to me.
            </p>
          </div>
          <AskForm />
        </div>
      </section>
    </div>
  );
}
