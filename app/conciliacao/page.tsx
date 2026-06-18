import { DashboardTopNav } from "@/components/dashboard-top-nav";
import { ModuleOverview } from "@/components/module-overview";
import { PageShell } from "@/components/page-shell";
import { ReconciliationTable } from "@/components/reconciliation-table";
import { apiErrorTracker, getBankAccounts, getBankTransactions } from "@/lib/api";
import { pageSummaries, reconciliationRows } from "@/lib/data";
import { autoReconcile, suggestMatches } from "./actions";

const summary = pageSummaries["/conciliacao"];

export default async function ConciliacaoPage() {
  const [txs, accounts] = await Promise.all([getBankTransactions(), getBankAccounts()]);
  const isDemo = apiErrorTracker().hasError || !txs;

  const metrics = txs
    ? [
        { label: "Movimentos", value: `${txs.length}` },
        { label: "Pendentes", value: `${txs.filter((t) => t.status !== "RECONCILED").length}` },
        {
          label: "Taxa automatica",
          value: `${txs.length ? Math.round((txs.filter((t) => t.status === "RECONCILED").length / txs.length) * 100) : 0}%`
        }
      ]
    : summary.metrics;

  return (
    <PageShell title={summary.title} subtitle={summary.subtitle} topNav={<DashboardTopNav />} isDemo={isDemo}>
      <div className="space-y-6">
        {txs && (
          <div className="flex flex-wrap gap-3">
            <form action={suggestMatches}>
              <button
                type="submit"
                className="rounded-2xl border border-border bg-surface-muted px-5 py-2.5 text-xs font-semibold text-text transition-colors hover:bg-surface"
              >
                Sugerir matches
              </button>
            </form>
            <form action={autoReconcile}>
              <button
                type="submit"
                className="rounded-2xl bg-lime px-5 py-2.5 text-xs font-semibold text-ink transition-colors hover:bg-lime-strong"
              >
                Conciliar automatico
              </button>
            </form>
          </div>
        )}

        <ModuleOverview
          metrics={metrics}
          tableTitle="Fila de conciliacao"
          tableMeta="Extrato, sugestao e divergencia em uma mesma grade"
          tableColumns={[]}
          tableRows={[]}
          customTable={<ReconciliationTable txs={txs} accounts={accounts} fallbackRows={reconciliationRows} />}
          chartTitle="Pendencias por origem"
          chartMeta="Conta bancaria, cartao e caixa na mesma leitura"
          chartSeries={[{ name: "Pendencias", data: [21, 11, 7, 3] }]}
          chartOptions={{
            colors: ["#9fe870"],
            xaxis: { categories: ["Banco", "Cartao", "Caixa", "Tarifas"] },
            legend: { show: false }
          }}
          sideTitle="Leitura do modulo"
          sideCopy="A conciliacao resolve o dia a dia por excecao: ver sugestao, confirmar match e isolar divergencias sem abrir uma tela pesada."
        />
      </div>
    </PageShell>
  );
}