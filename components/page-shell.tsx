import { ReactNode } from "react";
import { Sidebar } from "@/components/sidebar";

export function PageShell({
  title,
  subtitle,
  children,
  topNav
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  topNav?: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg panel-grid">
      <div className="mx-auto flex max-w-[1700px] gap-5 px-4 py-5 md:px-6 md:py-6">
        <Sidebar />
        <main className="min-w-0 flex-1">
          <div className="space-y-7">
            {topNav}
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
    </div>
  );
}
