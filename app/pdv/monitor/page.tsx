import Link from "next/link";
import { ArrowLeft, Activity } from "lucide-react";
import { SalesMonitor } from "@/components/pdv/sales-monitor";

/**
 * Monitor de lançamentos em tela cheia — pensado para uma TV/segundo monitor na
 * loja, exibindo as vendas ao vivo e os KPIs do dia.
 */
export default function PdvMonitorPage() {
  return (
    <div className="min-h-screen bg-bg panel-grid text-text">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-surface/80 px-5 py-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-lime text-ink">
            <Activity className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-lg font-extrabold leading-tight text-text">Monitor de lançamentos</h1>
            <p className="text-xs text-text-soft">Vendas ao vivo da loja</p>
          </div>
        </div>
        <Link
          href="/pdv"
          className="flex items-center gap-2 rounded-2xl border border-border bg-surface-muted px-4 py-2.5 text-sm font-semibold text-text hover:bg-surface"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar ao PDV
        </Link>
      </header>

      <main className="mx-auto w-full max-w-[1100px] px-4 py-6 md:px-6">
        <SalesMonitor />
      </main>
    </div>
  );
}
