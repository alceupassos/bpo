import { CalendarDays, ChevronDown, Search } from "lucide-react";

export function FiltersBar() {
  return (
    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
      <div className="grid gap-3 md:grid-cols-3 xl:w-[580px]">
        <div className="rounded-2xl border border-border bg-surface px-4 py-3 shadow-chrome">
          <div className="mb-1 text-[11px] uppercase tracking-[0.18em] text-text-faint">Empresa</div>
          <div className="flex items-center justify-between text-sm text-text">
            <span>Comercial Praia Azul LTDA</span>
            <ChevronDown className="h-4 w-4 text-text-faint" />
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-surface px-4 py-3 shadow-chrome">
          <div className="mb-1 text-[11px] uppercase tracking-[0.18em] text-text-faint">Periodo</div>
          <div className="flex items-center justify-between text-sm text-text">
            <span>01/05/2024 - 31/05/2024</span>
            <CalendarDays className="h-4 w-4 text-text-faint" />
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-surface px-4 py-3 shadow-chrome">
          <div className="mb-1 text-[11px] uppercase tracking-[0.18em] text-text-faint">Status</div>
          <div className="flex items-center justify-between text-sm text-text">
            <span>Todos</span>
            <ChevronDown className="h-4 w-4 text-text-faint" />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="flex min-w-[320px] items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 shadow-chrome">
          <Search className="h-4 w-4 text-text-faint" />
          <input
            className="w-full border-0 bg-transparent text-sm text-text outline-none placeholder:text-text-faint"
            placeholder="Buscar lancamentos, documentos..."
          />
          <span className="rounded-lg bg-surface-muted px-2 py-1 text-[11px] text-text-faint">Ctrl K</span>
        </label>
        <button className="rounded-2xl bg-lime px-5 py-3 text-sm font-medium text-black shadow-panel transition hover:bg-lime-strong">
          Novo lancamento
        </button>
      </div>
    </div>
  );
}
