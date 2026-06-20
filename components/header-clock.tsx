"use client";

import { useEffect, useState } from "react";

/**
 * Relógio discreto no cabeçalho. Pequeno e em tom suave para não atrapalhar a
 * diagramação; oculto em telas estreitas. Atualiza a cada segundo no cliente.
 */
export function HeaderClock() {
  const [now, setNow] = useState<string>("");

  useEffect(() => {
    const tick = () =>
      setNow(
        new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (!now) return null;
  return (
    <span
      className="hidden xl:block select-none font-mono text-[11px] tabular-nums text-text-faint"
      aria-label="Horário"
      title="Horário"
      suppressHydrationWarning
    >
      {now}
    </span>
  );
}
