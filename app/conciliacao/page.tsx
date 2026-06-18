import { DashboardTopNav } from "@/components/dashboard-top-nav";
import { ModuleOverview } from "@/components/module-overview";
import { PageShell } from "@/components/page-shell";
import { getBankAccounts, getBankTransactions } from "@/lib/api";
import { pageSummaries, reconciliationRows } from "@/lib/data";
import { reconciliationToRow } from "@/lib/formatters";

const summary = pageSummaries["/conciliacao"];

export default async function ConciliacaoPage() {
  const [txs, accounts] = await Promise.all([getBankTransactions(), getBankAccounts()]);
  const rows = txs ? txs.map((tx) => reconciliationToRow(tx, accounts ?? [])) : reconciliationRows;

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
    <PageShell title={summary.title} subtitle={summary.subtitle} topNav={<DashboardTopNav />} isDemo={!txs}>
      <ModuleOverview
        metrics={metrics}
        tableTitle="Fila de conciliacao"
        tableMeta="Extrato, sugestao e divergencia em uma mesma grade"
        tableColumns={[
          { key: "conta", label: "Conta" },
          { key: "extrato", label: "Extrato" },
          { key: "sugestao", label: "Sugestao" },
          { key: "divergencia", label: "Divergencia" },
          { key: "status", label: "Status" }
        ]}
        tableRows={rows}
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
    </PageShell>
  );
}
