import { NameTerrain } from "./name-terrain";
import { VisitCount } from "./visit-count";
import { person } from "@/content/site";

/** Full-bleed: the name stands edge to edge on the page's last line, lit from below in this visit's colour. */
export function Footer() {
  return (
    <footer className="footer-glow relative mt-16 overflow-hidden pt-28 md:pt-36">
      <div className="absolute inset-x-0 top-0 mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-4 pt-8 text-[13px] md:px-8">
        <div className="pl-3"><VisitCount /></div>
        <a href="#top" className="rounded-full px-3 py-1.5 font-medium text-ink-2 transition-colors duration-200 hover:bg-raised hover:text-ink">
          Back to top
        </a>
      </div>
      <NameTerrain full={person.nameEn} short={person.nameEn.split(" ")[0]} />
    </footer>
  );
}
