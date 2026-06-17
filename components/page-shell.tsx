"use client";

import { ReactNode, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar, navGroups } from "@/components/sidebar";
import { DashboardTopNav } from "@/components/dashboard-top-nav";
import { Menu, X, Settings2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import clsx from "clsx";
import { IconResolver } from "@/components/icon-resolver";

export function PageShell({
  title,
  subtitle,
  children,
  topNav: _topNav // Ignore standard prop and render internally to inject hamburger triggers
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  topNav?: ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const pathname = usePathname();

  // Load state on client mount
  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved !== null) {
      setIsCollapsed(saved === "true");
    }
  }, []);

  const toggleSidebar = () => {
    const newVal = !isCollapsed;
    setIsCollapsed(newVal);
    localStorage.setItem("sidebar-collapsed", String(newVal));
  };

  // Close mobile menu on page navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-bg panel-grid text-text selection:bg-lime/30 selection:text-lime">
      <div className={clsx(
        "mx-auto grid grid-cols-1 max-w-[1700px] gap-5 px-4 py-5 md:px-6 md:py-6 transition-all duration-300 ease-in-out",
        isCollapsed ? "lg:grid-cols-[76px_1fr]" : "lg:grid-cols-[260px_1fr]"
      )}>
        
        {/* Desktop Collapsible Left Sidebar */}
        <Sidebar isCollapsed={isCollapsed} onToggle={toggleSidebar} />

        {/* Main Workspace */}
        <main className="min-w-0 flex flex-col gap-6">
          
          {/* Header containing search, profile, mobile menu trigger */}
          <DashboardTopNav onMenuClick={() => setMobileMenuOpen(true)} />

          {/* Page Title & Body */}
          <div className="flex-1 space-y-7">
            <div className="px-1">
              <h1 className="text-pretty text-[2.6rem] font-bold leading-[1.05] tracking-tight text-text">
                {title}
              </h1>
              {subtitle ? <p className="mt-2 max-w-2xl text-[1rem] text-text-soft">{subtitle}</p> : null}
            </div>
            
            {children}
          </div>
        </main>
      </div>

      {/* Mobile/Tablet slide-over Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm lg:hidden"
            />

            {/* Slide-out Menu Panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 top-0 z-50 flex w-72 flex-col justify-between border-r border-border bg-slate-950/95 p-5 shadow-2xl backdrop-blur-2xl lg:hidden"
            >
              <div className="flex flex-col gap-5 overflow-hidden">
                {/* Header with Title and Close Button */}
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="grid h-8 w-8 place-items-center rounded-xl bg-lime text-base font-black text-ink shadow-[0_0_12px_rgba(159,232,112,0.3)]">
                      a
                    </span>
                    <span className="text-lg font-extrabold tracking-tight text-text">angra</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="grid h-9 w-9 place-items-center rounded-full bg-white/5 text-text-soft hover:bg-white/10 hover:text-text"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Scroller for mobile menu links */}
                <nav className="no-scrollbar flex flex-col gap-5 overflow-y-auto" aria-label="Mobile Navigation">
                  {navGroups.map((group) => (
                    <div key={group.title} className="flex flex-col gap-1.5">
                      <h4 className="px-2.5 text-[9px] font-bold uppercase tracking-[0.15em] text-text-faint">
                        {group.title}
                      </h4>
                      <div className="flex flex-col gap-1">
                        {group.items.map((item) => {
                          const active = pathname === item.href;
                          return (
                            <Link
                              key={item.href}
                              href={item.href as never}
                              className={clsx(
                                "flex items-center rounded-2xl h-10 px-3 w-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40",
                                active
                                  ? "bg-lime text-ink font-bold shadow-[0_0_15px_rgba(159,232,112,0.3)]"
                                  : "text-text-soft hover:bg-surface-muted hover:text-text"
                              )}
                            >
                              <IconResolver
                                name={item.icon as never}
                                className={clsx("h-[18px] w-[18px] shrink-0 mr-2.5", active ? "text-ink" : "")}
                              />
                              <span className="text-xs font-semibold">{item.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </nav>
              </div>

              {/* Bottom adjustments and Close */}
              <div className="flex flex-col gap-2 border-t border-white/5 pt-3">
                <Link
                  href={"/configuracoes" as never}
                  className={clsx(
                    "flex items-center rounded-2xl h-10 px-3 w-full text-text-soft transition-colors hover:bg-surface-muted hover:text-text",
                    pathname === "/configuracoes" ? "bg-surface-muted text-text" : ""
                  )}
                >
                  <Settings2 className="h-[18px] w-[18px] shrink-0 mr-2.5" />
                  <span className="text-xs font-semibold">Configurações</span>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
