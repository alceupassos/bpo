const people = [
  { initials: "VC", color: "#8A3A2B" },
  { initials: "DJ", color: "#17345A" },
  { initials: "MI", color: "#8A6A2F" },
  { initials: "ST", color: "#6a4d90" },
  { initials: "RV", color: "#2f6d4a" }
];

export function ContactsRow({
  title = "Carteira ativa",
  meta = "Contatos de maior exposicao"
}: {
  title?: string;
  meta?: string;
}) {
  return (
    <section className="rounded-[24px] border border-border bg-surface p-5 soft-glow">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold text-text">{title}</h3>
          <p className="mt-0.5 text-xs text-text-faint">{meta}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center">
        {people.map((p, i) => (
          <div
            key={p.initials}
            className={`grid h-11 w-11 place-items-center rounded-full text-sm font-semibold text-white ring-2 ring-surface ${i > 0 ? "-ml-3" : ""}`}
            style={{ backgroundColor: p.color }}
          >
            {p.initials}
          </div>
        ))}
        <div className="-ml-3 grid h-11 w-11 place-items-center rounded-full border border-dashed border-border bg-surface text-text-faint ring-2 ring-surface">
          +
        </div>
      </div>
    </section>
  );
}
