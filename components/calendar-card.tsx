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
    <section className="rounded-[28px] border border-border bg-[#111413] p-6 soft-glow">
      <div className="mb-6 flex justify-between text-sm text-text-soft">
        {days.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="space-y-5 text-center text-lg text-white">
        {calendarRows.map((row, index) => (
          <div key={index} className="grid grid-cols-7 gap-3">
            {row.map((value) => {
              const active = value === "3";
              const muted = index === 0 && Number(value) < 28;
              return (
                <div
                  key={value}
                  className={`grid h-10 place-items-center rounded-xl ${
                    active
                      ? "bg-lime font-semibold text-black"
                      : muted
                        ? "text-[#4f5754]"
                        : "text-[#f1f3f7]"
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
