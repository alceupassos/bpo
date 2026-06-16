import { DashboardTopNav } from "@/components/dashboard-top-nav";
import { ModuleOverview } from "@/components/module-overview";
import { PageShell } from "@/components/page-shell";
import { getFinancialEntries } from "@/lib/api";
import { pageSummaries, receivablesRows } from "@/lib/data";
import { formatBRL, receivableToRow } from "@/lib/formatters";

const summary = pageSummaries["/contas-a-receber"];
const OPEN = new Set(["DRAFT", "PENDING_APPROVAL", "APPROVED"]);

function isOverdue(dueDate: string): boolean {
  return new Date(`${dueDate.slice(0, 10)}T00:00:00`).getTime() < Date.now();
}

export default async function ContasAReceberPage() {
  const entries = await getFinancialEntries("RECEIVABLE");
  const rows = entries ? entries.map(receivableToRow) : receivablesRows;

  const metrics = entries
    ? [
        {
          label: "Total a receber",
          value: formatBRL(entries.filter((e) => OPEN.has(e.status)).reduce((s, e) => s + e.amount, 0))
        },
        {
          label: "Em atraso",
          value: formatBRL(
            entries
              .filter((e) => OPEN.has(e.status) && isOverdue(e.dueDate))
              .reduce((s, e) => s + e.amount, 0)
          )
        },
        {
          label: "Recebido",
          value: formatBRL(entries.filter((e) => e.status === "RECEIVED").reduce((s, e) => s + e.amount, 0))
        }
      ]
    : summary.metrics;

  return (
    <PageShell title={summary.title} subtitle={summary.subtitle} topNav={<DashboardTopNav />}>
      <ModuleOverview
        metrics={metrics}
        tableTitle="Carteira de recebiveis"
        tableMeta="Titulos a vencer, vencidos e em follow-up"
        tableColumns={[
          { key: "cliente", label: "Cliente" },
          { key: "fatura", label: "Fatura" },
          { key: "emissao", label: "Emissao" },
          { key: "vencimento", label: "Vencimento" },
          { key: "valor", label: "Valor" },
          { key: "status", label: "Status" }
        ]}
        tableRows={rows}
        chartTitle="Aging da carteira"
        chartMeta="Faixas de atraso e previsao de caixa"
        chartSeries={[{ name: "Titulos", data: [21, 13, 7, 4] }]}
        chartOptions={{
          colors: ["#9fe870"],
          xaxis: { categories: ["1-30", "31-60", "61-90", "90+"] },
          legend: { show: false }
        }}
        sideTitle="Leitura do modulo"
        sideCopy="A tela de receber prioriza follow-up, aging e registro de baixa com o mesmo design system do dashboard."
      />
    </PageShell>
  );
}
