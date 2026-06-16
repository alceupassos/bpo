const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
const calendarRows = [
  ["28", "29", "30", "31", "1", "2", "3"],
  ["4", "5", "6", "7", "8", "9", "10"],
  ["11", "12", "13", "14", "15", "16", "17"],
  ["18", "19", "20", "21", "22", "23", "24"],
  ["25", "26", "27", "28", "29", "30", "31"]
];

export function CalendarCard() {
  return (
    <section className="rounded-[28px] border border-border bg-surface p-6 soft-glow">
      <div className="mb-5 flex justify-between text-sm text-text-faint">
        {days.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="space-y-3 text-center text-base text-text">
        {calendarRows.map((row, index) => (
          <div key={index} className="grid grid-cols-7 gap-2">
            {row.map((value) => {
              const active = value === "16";
              const muted = index === 0 && Number(value) < 28;
              return (
                <div
                  key={`${index}-${value}`}
                  className={`grid h-9 place-items-center rounded-xl tabular-nums ${
                    active
                      ? "bg-lime font-semibold text-ink"
                      : muted
                        ? "text-text-faint"
                        : "text-text"
                  }`}
                >
                  {value}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
