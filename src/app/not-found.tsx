import Link from "next/link";
import { RollLabel } from "@/components/roll-label";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[70dvh] max-w-[1200px] flex-col justify-center px-5 py-24 md:px-10">
      <h1 className="enter font-display text-[clamp(64px,12vw,168px)] font-extrabold leading-none tracking-[-0.04em]">
        Bowled.
      </h1>
      <p className="enter mt-6 max-w-[36ch] text-[clamp(19px,1.7vw,23px)] leading-[1.45] text-ink-2" style={{ "--d": 1 } as React.CSSProperties}>
        This page does not exist. Walk back to the pavilion and try another shot.
      </p>
      <div className="enter mt-9" style={{ "--d": 2 } as React.CSSProperties}>
        <Link href="/" className="btn btn-primary roll-host">
          <RollLabel text="Back home" />
        </Link>
      </div>
    </section>
  );
}
