"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Bell, LogOut, Search } from "lucide-react";
import { navItems } from "@/lib/data";
import { logoutAction } from "@/app/login/actions";

export function DashboardTopNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <Link href={"/" as never} className="flex shrink-0 items-center gap-2 px-1" aria-label="Inicio">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-lime text-lg font-black text-ink">a</span>
        <span className="text-xl font-extrabold tracking-tight text-text">angra</span>
      </Link>

      <nav
        className="flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-border bg-surface p-1.5 soft-glow"
        aria-label="Modulos"
      >
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href as never}
              aria-current={active ? "page" : undefined}
              className={clsx(
                "shrink-0 rounded-full px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30",
                active
                  ? "bg-lime text-ink font-bold shadow-[0_0_12px_rgba(159,232,112,0.25)]"
                  : "text-text-soft hover:bg-surface-muted hover:text-text"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-2.5">
        <label className="hidden min-w-[210px] items-center gap-2.5 rounded-full border border-border bg-surface px-4 py-2.5 xl:flex">
          <Search className="h-4 w-4 text-text-faint" aria-hidden="true" />
          <span className="sr-only">Buscar</span>
          <input
            type="search"
            name="busca"
            autoComplete="off"
            spellCheck={false}
            className="w-full border-0 bg-transparent text-sm text-text outline-none placeholder:text-text-faint"
            placeholder="Buscar empresa ou documento…"
          />
        </label>
        <button
          type="button"
          aria-label="Notificacoes"
          className="grid h-11 w-11 place-items-center rounded-full border border-border bg-surface text-text-soft transition-colors hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
        </button>
        <form action={logoutAction}>
          <button
            type="submit"
            aria-label="Sair"
            title="Sair"
            className="grid h-11 w-11 place-items-center rounded-full bg-lime text-ink transition-colors hover:bg-lime-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
          >
            <LogOut className="h-5 w-5" aria-hidden="true" />
          </button>
        </form>
      </div>
    </div>
  );
}
