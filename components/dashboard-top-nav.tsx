"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Bell, ChevronDown, LogOut, Search } from "lucide-react";
import { navItems } from "@/lib/data";
import { IconResolver } from "@/components/icon-resolver";
import { logoutAction } from "@/app/login/actions";

// Modulos do dia a dia ficam visiveis; o resto vai para o menu "Mais".
const PRIMARY_HREFS = new Set<string>([
  "/",
  "/contas-a-pagar",
  "/contas-a-receber",
  "/caixa",
  "/notas",
  "/conciliacao"
]);

export function DashboardTopNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  const primaryItems = navItems.filter((item) => PRIMARY_HREFS.has(item.href));
  const moreItems = navItems.filter((item) => !PRIMARY_HREFS.has(item.href));
  const moreActive = moreItems.some((item) => item.href === pathname);

  // Fecha o dropdown ao navegar.
  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  // Fecha ao clicar fora ou pressionar Escape.
  useEffect(() => {
    if (!moreOpen) return;
    const onPointer = (e: PointerEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMoreOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [moreOpen]);

  const pillBase =
    "shrink-0 rounded-full px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30";
  const pillActive = "bg-lime text-ink font-bold shadow-[0_0_12px_rgba(159,232,112,0.25)]";
  const pillIdle = "text-text-soft hover:bg-surface-muted hover:text-text";

  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <Link href={"/" as never} className="flex shrink-0 items-center gap-2 px-1" aria-label="Inicio">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-lime text-lg font-black text-ink">a</span>
        <span className="text-xl font-extrabold tracking-tight text-text">angra</span>
      </Link>

      <nav
        className="flex min-w-0 items-center gap-1 rounded-full border border-border bg-surface p-1.5 soft-glow"
        aria-label="Modulos"
      >
        <div className="no-scrollbar nav-fade flex items-center gap-1 overflow-x-auto">
          {primaryItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href as never}
                aria-current={active ? "page" : undefined}
                className={clsx(pillBase, active ? pillActive : pillIdle)}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {moreItems.length > 0 && (
          <div ref={moreRef} className="relative shrink-0">
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={moreOpen}
              onClick={() => setMoreOpen((v) => !v)}
              className={clsx(
                pillBase,
                "flex items-center gap-1",
                moreActive || moreOpen ? pillActive : pillIdle
              )}
            >
              Mais
              <ChevronDown
                className={clsx("h-4 w-4 transition-transform", moreOpen && "rotate-180")}
                aria-hidden="true"
              />
            </button>

            {moreOpen && (
              <div
                role="menu"
                aria-label="Mais modulos"
                className="absolute right-0 z-50 mt-2 w-60 rounded-2xl border border-border bg-surface p-2 soft-glow"
              >
                {moreItems.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href as never}
                      role="menuitem"
                      aria-current={active ? "page" : undefined}
                      className={clsx(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30",
                        active ? "bg-lime/15 text-lime" : "text-text-soft hover:bg-surface-muted hover:text-text"
                      )}
                    >
                      <IconResolver name={item.icon as never} className="h-4 w-4 shrink-0" aria-hidden="true" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}
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
