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
    <div className="min-h-screen bg-bg p-5 md:p-8">
      <div className="mx-auto grid min-h-[calc(100vh-2.5rem)] max-w-[1700px] gap-6 rounded-[46px] border border-[#1d241f] bg-[radial-gradient(120%_80%_at_50%_-10%,rgba(159,232,112,0.10),transparent_60%),#0a0d0a] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.55)] lg:grid-cols-[104px_minmax(0,1fr)]">
        <div className="lg:h-full">
          <Sidebar />
        </div>
        <main className="rounded-[34px] bg-transparent px-2 py-2">
          <div className="space-y-8">
            {topNav}
            <div className="px-2">
              <h1 className="font-sans text-[3rem] font-semibold leading-tight text-white">{title}</h1>
              {subtitle ? <p className="mt-2 text-[1.05rem] text-text-soft">{subtitle}</p> : null}
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
