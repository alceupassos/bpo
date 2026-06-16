import { DashboardTopNav } from "@/components/dashboard-top-nav";
import { ModuleOverview } from "@/components/module-overview";
import { PageShell } from "@/components/page-shell";
import { getFinancialEntries } from "@/lib/api";
import { pageSummaries, payablesRows } from "@/lib/data";
import { formatBRL, payableToRow } from "@/lib/formatters";

const summary = pageSummaries["/contas-a-pagar"];
const OPEN = new Set(["DRAFT", "PENDING_APPROVAL", "APPROVED"]);

export default async function ContasAPagarPage() {
  const entries = await getFinancialEntries("PAYABLE");
  const rows = entries ? entries.map(payableToRow) : payablesRows;

  const metrics = entries
    ? [
        {
          label: "Em aberto",
          value: formatBRL(entries.filter((e) => OPEN.has(e.status)).reduce((s, e) => s + e.amount, 0))
        },
        {
          label: "Aguardando aprovacao",
          value: `${entries.filter((e) => e.status === "PENDING_APPROVAL").length} titulos`
        },
        {
          label: "Pagos",
          value: formatBRL(entries.filter((e) => e.status === "PAID").reduce((s, e) => s + e.amount, 0))
        }
      ]
    : summary.metrics;

  return (
    <PageShell title={summary.title} subtitle={summary.subtitle} topNav={<DashboardTopNav />}>
      <ModuleOverview
        metrics={metrics}
        tableTitle="Agenda operacional de pagamentos"
        tableMeta="Titulos com foco em vencimento, aprovacao e comprovante"
        tableColumns={[
          { key: "fornecedor", label: "Fornecedor" },
          { key: "documento", label: "Documento" },
          { key: "categoria", label: "Categoria" },
          { key: "vencimento", label: "Vencimento" },
          { key: "valor", label: "Valor" },
          { key: "status", label: "Status" }
        ]}
        tableRows={rows}
        chartTitle="Vencimentos por semana"
        chartMeta="Distribuicao das obrigacoes previstas no periodo"
        chartSeries={[{ name: "Vencimentos", data: [14, 21, 18, 11] }]}
        chartOptions={{
          colors: ["#9fe870"],
          xaxis: { categories: ["Sem 1", "Sem 2", "Sem 3", "Sem 4"] },
          legend: { show: false }
        }}
        sideTitle="Leitura do modulo"
        sideCopy="Aqui o operador resolve aprovacao, comprovante e baixa sem sair do fluxo principal."
      />
    </PageShell>
  );
}
