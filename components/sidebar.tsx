"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, Settings2 } from "lucide-react";
import clsx from "clsx";
import { IconResolver } from "@/components/icon-resolver";

export const navGroups = [
  {
    title: "Geral",
    items: [
      { href: "/", label: "Dashboard", icon: "layout-dashboard" },
      { href: "/inteligencia", label: "IA Financeira", icon: "sparkles" },
      { href: "/relatorios", label: "Relatórios", icon: "chart-column-big" },
      { href: "/painel-cliente", label: "Painel Cliente", icon: "monitor-dot" },
      { href: "/empresas", label: "Empresas", icon: "building-2" },
      { href: "/auditoria", label: "Auditoria", icon: "scroll-text" },
    ]
  },
  {
    title: "Financeiro",
    items: [
      { href: "/contas-a-pagar", label: "A Pagar", icon: "wallet" },
      { href: "/contas-a-receber", label: "A Receber", icon: "badge-dollar-sign" },
      { href: "/aprovacoes", label: "Aprovações", icon: "shield-check" },
      { href: "/caixa", label: "Caixa", icon: "calculator" },
      { href: "/conciliacao", label: "Conciliação", icon: "scale" },
    ]
  },
  {
    title: "Operações",
    items: [
      { href: "/notas", label: "Notas (OCR)", icon: "receipt-text" },
      { href: "/produtos", label: "Produtos", icon: "package" },
      { href: "/clientes", label: "Clientes", icon: "users-round" },
      { href: "/whatsapp", label: "WhatsApp", icon: "message-circle" },
    ]
  },
  {
    title: "Contabilidade",
    items: [
      { href: "/contador", label: "Contador", icon: "briefcase" },
      { href: "/fiscal-trabalhista", label: "Fiscal / Trab", icon: "percent" },
    ]
  }
];

export interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside 
      className={clsx(
        "sticky top-6 hidden h-[calc(100vh-3rem)] shrink-0 lg:block transition-all duration-300 ease-in-out z-40",
        isCollapsed ? "w-[76px]" : "w-[260px]"
      )}
    >
      <div className="flex h-full w-full flex-col justify-between rounded-[28px] border border-border bg-surface py-5 px-3.5 soft-glow backdrop-blur-xl">
        <div className="flex flex-col gap-5 overflow-hidden">
          {/* Logo Brand area */}
          <div className={clsx(
            "flex items-center gap-2.5 px-1 pb-2 border-b border-white/5",
            isCollapsed ? "justify-center" : "justify-start"
          )}>
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-lime text-base font-black text-ink shadow-[0_0_12px_rgba(159,232,112,0.3)]">
              a
            </span>
            <span className={clsx(
              "font-extrabold tracking-tight text-text transition-all duration-300 ease-in-out text-lg overflow-hidden whitespace-nowrap",
              isCollapsed ? "opacity-0 max-w-0" : "opacity-100 max-w-[120px]"
            )}>
              angra
            </span>
          </div>

          {/* Nav groups */}
          <nav className="no-scrollbar flex flex-col gap-5 overflow-y-auto" aria-label="Navegação principal">
            {navGroups.map((group) => (
              <div key={group.title} className="flex flex-col gap-1.5">
                {/* Group Title */}
                <h4 className={clsx(
                  "px-2.5 text-[9px] font-bold uppercase tracking-[0.15em] text-text-faint transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap",
                  isCollapsed ? "opacity-0 max-w-0 max-h-0 py-0 opacity-0" : "opacity-100 max-w-[180px] max-h-4"
                )}>
                  {group.title}
                </h4>

                {/* Items */}
                <div className="flex flex-col gap-1">
                  {group.items.map((item) => {
                    const active = pathname === item.href;
                    return (
                      <div key={item.href} className="relative group/item">
                        <Link
                          href={item.href as never}
                          aria-label={item.label}
                          aria-current={active ? "page" : undefined}
                          className={clsx(
                            "flex items-center rounded-2xl h-10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40",
                            isCollapsed ? "justify-center w-10 px-0 mx-auto" : "px-3 w-full",
                            active
                              ? "bg-lime text-ink font-bold shadow-[0_0_15px_rgba(159,232,112,0.3)]"
                              : "text-text-soft hover:bg-surface-muted hover:text-text"
                          )}
                        >
                          <IconResolver 
                            name={item.icon as never} 
                            className={clsx("h-[18px] w-[18px] shrink-0", active ? "text-ink" : "")} 
                            aria-hidden="true" 
                          />
                          <span className={clsx(
                            "transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden text-xs font-semibold",
                            isCollapsed ? "opacity-0 max-w-0" : "opacity-100 max-w-[180px] ml-2.5"
                          )}>
                            {item.label}
                          </span>
                        </Link>

                        {/* Tooltip when collapsed */}
                        {isCollapsed && (
                          <div className="absolute left-full ml-3.5 top-1/2 -translate-y-1/2 opacity-0 pointer-events-none group-hover/item:opacity-100 transition-opacity bg-slate-950/95 border border-white/10 rounded-xl px-2.5 py-1.5 text-[10px] font-semibold tracking-wide text-text whitespace-nowrap z-50 shadow-2xl backdrop-blur-md">
                            {item.label}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Footer actions: Settings and Toggle */}
        <div className="flex flex-col gap-2.5 border-t border-white/5 pt-3">
          <div className="relative group/settings">
            <Link
              href={"/configuracoes" as never}
              aria-label="Configurações"
              className={clsx(
                "flex items-center rounded-2xl h-10 text-text-soft transition-colors hover:bg-surface-muted hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40",
                isCollapsed ? "justify-center w-10 px-0 mx-auto" : "px-3 w-full",
                pathname === "/configuracoes" ? "bg-surface-muted text-text" : ""
              )}
            >
              <Settings2 className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
              <span className={clsx(
                "transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden text-xs font-semibold",
                isCollapsed ? "opacity-0 max-w-0" : "opacity-100 max-w-[180px] ml-2.5"
              )}>
                Configurações
              </span>
            </Link>
            
            {/* Tooltip */}
            {isCollapsed && (
              <div className="absolute left-full ml-3.5 top-1/2 -translate-y-1/2 opacity-0 pointer-events-none group-hover/settings:opacity-100 transition-opacity bg-slate-950/95 border border-white/10 rounded-xl px-2.5 py-1.5 text-[10px] font-semibold tracking-wide text-text whitespace-nowrap z-50 shadow-2xl backdrop-blur-md">
                Configurações
              </div>
            )}
          </div>

          {/* Toggle button */}
          <button
            type="button"
            onClick={onToggle}
            aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
            className="flex items-center justify-center rounded-2xl h-10 w-10 mx-auto text-text-soft hover:bg-surface-muted hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40"
          >
            {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </aside>
  );
}
