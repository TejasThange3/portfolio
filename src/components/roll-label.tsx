/** A label whose letters roll up to an identical copy on hover (parent needs .roll-host). */
export function RollLabel({ text }: { text: string }) {
  return (
    <span className="roll" aria-label={text}>
      {[...text].map((c, i) => (
        <span key={i} aria-hidden data-c={c} style={{ "--i": i } as React.CSSProperties}>
          {c}
        </span>
      ))}
    </span>
  );
}
