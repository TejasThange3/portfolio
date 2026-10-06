import { tech } from "@/content/tech";

/** A single technology logo, meant to sit on a light "app icon" tile so brand colours read in both themes. */
export function TechLogo({ name, size = 18 }: { name: string; size?: number }) {
  const t = tech[name];
  if (!t) return null;
  const src = `/logos/${t.file}.svg`;
  if (t.mono)
    return (
      <span
        aria-hidden
        className="inline-block shrink-0 bg-[#1a1a1c]"
        style={{ width: size, height: size, mask: `url(${src}) center / contain no-repeat`, WebkitMask: `url(${src}) center / contain no-repeat` }}
      />
    );
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" width={size} height={size} loading="lazy" decoding="async" className="shrink-0 object-contain" style={{ width: size, height: size }} />;
}

/** A row of logo tiles; each names itself in a tooltip on hover or keyboard focus. */
export function TechRow({ names, size = 34 }: { names: string[]; size?: number }) {
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Built with">
      {names.filter((n) => tech[n]).map((n) => (
        <li key={n} className="group/t relative">
          <span
            tabIndex={0}
            aria-label={n}
            className="logo-tile grid place-items-center rounded-[10px] transition-transform duration-200 ease-out hover:-translate-y-0.5 focus-visible:-translate-y-0.5"
            style={{ width: size, height: size }}
          >
            <TechLogo name={n} size={Math.round(size * 0.52)} />
          </span>
          <span
            role="tooltip"
            className="pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 z-20 -translate-x-1/2 origin-bottom scale-95 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-[12px] font-medium text-bg opacity-0 transition-[opacity,transform] duration-150 ease-out group-hover/t:scale-100 group-hover/t:opacity-100 group-focus-within/t:scale-100 group-focus-within/t:opacity-100"
          >
            {n}
          </span>
        </li>
      ))}
    </ul>
  );
}
