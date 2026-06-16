"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, History, UserRound } from "lucide-react";
import clsx from "clsx";
import { navItems } from "@/lib/data";
import { IconResolver } from "@/components/icon-resolver";

const bottomShortcuts = [
  { href: "/ocr-documentos", label: "OCR e Documentos", Icon: Bell },
  { href: "/painel-cliente", label: "Painel do Cliente", Icon: UserRound },
  { href: "/relatorios", label: "Relatorios", Icon: History }
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-full flex-col items-center justify-between py-2">
      <nav className="flex flex-col items-center gap-3 rounded-full border border-border bg-[#101410] px-2.5 py-4">
        {navItems.slice(0, 5).map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href as never}
              className={clsx(
                "grid h-12 w-12 place-items-center rounded-2xl transition",
                active
                  ? "bg-lime-soft text-lime ring-1 ring-lime/40"
                  : "text-text-soft hover:bg-[#171c1a] hover:text-white"
              )}
              title={item.label}
            >
              <IconResolver name={item.icon as never} className="h-5 w-5" />
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col items-center gap-3 rounded-full border border-border bg-[#101410] px-2.5 py-4">
        {bottomShortcuts.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href as never}
              className={clsx(
                "grid h-12 w-12 place-items-center rounded-2xl transition",
                active
                  ? "bg-lime-soft text-lime ring-1 ring-lime/40"
                  : "text-text-soft hover:bg-[#171c1a] hover:text-white"
              )}
              title={label}
            >
              <Icon className="h-5 w-5" />
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
