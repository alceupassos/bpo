"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, LogOut, Search, Menu } from "lucide-react";
import { HeaderClock } from "@/components/header-clock";
import { logoutAction } from "@/app/login/actions";

interface DashboardTopNavProps {
  onMenuClick?: () => void;
}

const roleLabels: Record<string, string> = {
  ADMIN_PLATAFORMA: "Admin",
  OPERADOR_BPO: "Operador BPO",
  GESTOR_EMPRESA: "Gestor",
  FINANCEIRO_EMPRESA: "Financeiro"
};

export function DashboardTopNav({ onMenuClick }: DashboardTopNavProps) {
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setUser({ name: data.name, role: data.role });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <header className="flex items-center justify-between gap-4 py-1.5 lg:py-2">
      {/* Mobile Hamburger & Logo OR Desktop Greet */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Abrir menu"
          className="grid h-10 w-10 place-items-center rounded-2xl border border-border bg-surface text-text-soft transition-colors hover:text-text lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
        >
          <Menu className="h-[22px] w-[22px]" />
        </button>

        {/* Logo shown only on mobile topNav */}
        <Link href={"/" as never} className="flex items-center gap-2 lg:hidden" aria-label="Início">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-lime text-sm font-black text-ink shadow-[0_0_12px_rgba(159,232,112,0.3)]">
            a
          </span>
          <span className="text-base font-extrabold tracking-tight text-text">angra</span>
        </Link>

        {/* Desktop Welcome Label */}
        <div className="hidden lg:block min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-faint">Painel de Operações</p>
          <p className="text-sm font-bold text-text">Angra BPO Financeiro</p>
        </div>
      </div>

      {/* Right side tools */}
      <div className="flex items-center gap-2.5">
        {/* Search Input - Desktop only */}
        <label className="hidden sm:flex min-w-[240px] items-center gap-2.5 rounded-full border border-border bg-surface px-4 py-2.5 soft-glow focus-within:border-white/20 transition-all">
          <Search className="h-4 w-4 text-text-faint" aria-hidden="true" />
          <span className="sr-only">Buscar</span>
          <input
            type="search"
            name="busca"
            autoComplete="off"
            spellCheck={false}
            className="w-full border-0 bg-transparent text-xs text-text outline-none placeholder:text-text-faint"
            placeholder="Buscar empresa ou documento…"
          />
        </label>

        {/* User Identity info */}
        {user && (
          <div className="hidden md:flex flex-col items-end text-right mr-1.5 min-w-0">
            <span className="text-xs font-bold text-text truncate max-w-[140px]">{user.name}</span>
            <span className="text-[9px] text-text-faint uppercase tracking-wider font-bold mt-0.5">{roleLabels[user.role] ?? user.role}</span>
          </div>
        )}

        {/* Relógio discreto */}
        <HeaderClock />

        {/* Notifications Button */}
        <button
          type="button"
          aria-label="Notificações"
          className="relative grid h-10 w-10 place-items-center rounded-2xl border border-border bg-surface text-text-soft transition-colors hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 soft-glow card-hover"
        >
          <Bell className="h-[18px] w-[18px]" aria-hidden="true" />
          <span className="absolute right-2.5 top-2.5 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-lime"></span>
          </span>
        </button>

        {/* Logout Form */}
        <form action={logoutAction} className="shrink-0">
          <button
            type="submit"
            aria-label="Sair do painel"
            title="Sair"
            className="grid h-10 w-10 place-items-center rounded-2xl bg-lime text-ink transition-all hover:bg-lime-strong hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 shadow-[0_0_12px_rgba(159,232,112,0.2)]"
          >
            <LogOut className="h-[18px] w-[18px]" aria-hidden="true" />
          </button>
        </form>
      </div>
    </header>
  );
}
