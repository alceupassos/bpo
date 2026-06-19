"use client";

import Link from "next/link";
import { ArrowDownToLine, MoreHorizontal, Scale, ShoppingCart } from "lucide-react";

const tiles = [
  { href: "/notas", label: "Importar", Icon: ArrowDownToLine },
  { href: "/conciliacao", label: "Conciliar", Icon: Scale },
  { href: "/pdv", label: "PDV", Icon: ShoppingCart },
  { href: "/relatorios", label: "Mais", Icon: MoreHorizontal }
];

export function QuickTiles() {
  return (
    <div className="grid grid-cols-4 gap-3">
      {tiles.map(({ href, label, Icon }) => (
        <Link
          key={label}
          href={href as never}
          className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface px-2 py-4 text-center transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
        >
          <span className="grid h-9 w-9 place-items-center rounded-full bg-surface-muted text-text">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="text-xs font-medium text-text-soft">{label}</span>
        </Link>
      ))}
    </div>
  );
}
