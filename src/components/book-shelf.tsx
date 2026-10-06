import Image from "next/image";
import { books } from "@/content/space";

/** Real 3D books: each stands angled to show its spine, and turns to face you when hovered or focused.
 *  Every book brings its own length of shelf, so four in a row join into one board, and on phones
 *  two per row make two shelves. */
export function BookShelf() {
  return (
    <ul className="grid grid-cols-2 gap-x-8 gap-y-14 md:grid-cols-4 md:gap-x-12">
      {books.map((b) => (
        <li key={b.title}>
          <figure tabIndex={0} aria-label={`${b.title} by ${b.author}`} className="book3d group mx-auto w-[72%] max-w-[180px] outline-none">
            <div className="book3d-body relative aspect-[2/3]" style={{ "--spine": b.spine, "--spine-ink": b.spineInk } as React.CSSProperties}>
              <div className="book3d-cover absolute inset-0 overflow-hidden rounded-r-[4px] rounded-l-[2px]">
                <Image src={b.cover} alt="" quality={90} fill sizes="(min-width: 768px) 180px, 36vw" className="object-cover" />
                <span aria-hidden className="absolute inset-y-0 left-0 w-[7%] bg-gradient-to-r from-black/30 via-white/10 to-transparent" />
                <span aria-hidden className="absolute inset-0 bg-[linear-gradient(105deg,transparent_40%,rgb(255_255_255/0.18)_50%,transparent_60%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </div>
              <div aria-hidden className="book3d-spine absolute inset-y-0 left-0 flex items-center justify-center overflow-hidden">
                <span className="whitespace-nowrap font-display text-[11px] font-bold uppercase tracking-[0.08em] [writing-mode:vertical-rl]" style={{ color: "var(--spine-ink)" }}>{b.title}</span>
              </div>
              <div aria-hidden className="book3d-pages absolute inset-y-[1.5%] right-0" />
            </div>
          </figure>
          {/* this book's length of shelf, reaching into the gaps so neighbouring boards meet */}
          <div aria-hidden className="shelf-board relative -mx-4 -mt-1 h-4 md:-mx-6" />
          <p className="mx-auto mt-5 w-[72%] max-w-[180px] text-[13.5px] leading-snug">
            <span className="block font-medium text-ink">{b.title}</span>
            <span className="text-muted">{b.author}</span>
          </p>
        </li>
      ))}
    </ul>
  );
}
