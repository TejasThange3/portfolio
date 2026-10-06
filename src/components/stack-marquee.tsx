import { stackRows } from "@/content/site";
import { TechLogo } from "./tech-logo";

function Row({ items, reverse, duration }: { items: string[]; reverse?: boolean; duration: number }) {
  const list = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="marquee-track flex shrink-0 gap-3 pr-3">
      {items.map((n) => (
        <li
          key={n}
          className="flex h-[58px] shrink-0 items-center gap-3 rounded-[16px] border border-line bg-surface pl-3 pr-5 text-[15px] font-medium text-ink-2 transition-[opacity,transform,border-color,color] duration-300 ease-out group-hover/row:opacity-45 hover:!opacity-100 hover:-translate-y-0.5 hover:border-line-2 hover:text-ink"
        >
          <span className="logo-tile grid size-9 place-items-center rounded-[10px]">
            <TechLogo name={n} size={21} />
          </span>
          {n}
        </li>
      ))}
    </ul>
  );
  return (
    <div
      className="group/row marquee flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]"
      style={{ "--dur": `${duration}s`, "--dir": reverse ? "reverse" : "normal" } as React.CSSProperties}
    >
      {list(false)}
      {list(true)}
    </div>
  );
}

export function StackMarquee() {
  return (
    <div className="space-y-3">
      <Row items={stackRows[0]} duration={55} />
      <Row items={stackRows[1]} duration={62} reverse />
    </div>
  );
}
