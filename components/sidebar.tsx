"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings2 } from "lucide-react";
import clsx from "clsx";
import { navItems } from "@/lib/data";
import { IconResolver } from "@/components/icon-resolver";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] shrink-0 lg:block">
      <div className="flex h-full w-[68px] flex-col items-center justify-between rounded-[28px] border border-border bg-surface py-5 soft-glow">
        <nav className="flex flex-col items-center gap-2" aria-label="Navegacao principal">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href as never}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                title={item.label}
                className={clsx(
                  "grid h-11 w-11 place-items-center rounded-2xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40",
                  active
                    ? "bg-lime text-ink font-bold shadow-[0_0_15px_rgba(159,232,112,0.3)]"
                    : "text-text-soft hover:bg-surface-muted hover:text-text"
                )}
              >
                <IconResolver name={item.icon as never} className="h-5 w-5" aria-hidden="true" />
              </Link>
            );
          })}
        </nav>

        <Link
          href={"/configuracoes" as never}
          aria-label="Configuracoes"
          title="Configuracoes"
          className="grid h-11 w-11 place-items-center rounded-2xl text-text-soft transition-colors hover:bg-surface-muted hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40"
        >
          <Settings2 className="h-5 w-5" aria-hidden="true" />
        </Link>
      </div>
    </aside>
  );
}
