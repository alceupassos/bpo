"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Bell, LogOut, Search, Settings2 } from "lucide-react";
import { navItems } from "@/lib/data";
import { logoutAction } from "@/app/login/actions";

export function DashboardTopNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-4 px-2 pt-2 xl:flex-row xl:items-center xl:justify-between">
      <Link href={"/" as never} className="shrink-0 px-1">
        <span className="font-sans text-[2rem] font-black uppercase leading-none tracking-[-0.06em] text-lime">
          angra
        </span>
      </Link>

      <nav className="flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-border bg-[#101410]/80 p-1.5">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href as never}
              className={clsx(
                "shrink-0 rounded-full px-5 py-3 text-sm transition",
                active
                  ? "bg-[#1b231a] font-medium text-lime"
                  : "bg-transparent text-text-soft hover:text-white"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-3">
        <label className="hidden min-w-[220px] items-center gap-3 rounded-full border border-border bg-[#101410] px-5 py-3.5 xl:flex">
          <Search className="h-5 w-5 text-text-faint" />
          <input
            className="w-full border-0 bg-transparent text-sm text-white outline-none placeholder:text-text-faint"
            placeholder="Buscar empresa ou documento"
          />
        </label>
        <Link
          href={"/ocr-documentos" as never}
          className="grid h-12 w-12 place-items-center rounded-full bg-[#101410] text-white transition hover:bg-[#1a1f1a]"
          title="OCR e Documentos"
        >
          <Bell className="h-5 w-5" />
        </Link>
        <Link
          href={"/configuracoes" as never}
          className="grid h-12 w-12 place-items-center rounded-full bg-[#101410] text-white transition hover:bg-[#1a1f1a]"
          title="Configuracoes"
        >
          <Settings2 className="h-5 w-5" />
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            className="grid h-12 w-12 place-items-center rounded-full bg-[#101410] text-white transition hover:bg-[#1a1f1a]"
            title="Sair"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
