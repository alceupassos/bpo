import { AiInsightCard } from "@/components/ai-insight-card";
import { DashboardTopNav } from "@/components/dashboard-top-nav";
import { ModuleOverview } from "@/components/module-overview";
import { PageShell } from "@/components/page-shell";
import { alertsInsight } from "@/lib/ai-insight-messages";
import { getAlerts, getFinancialEntries } from "@/lib/api";
import { pageSummaries, payablesRows } from "@/lib/data";
import { formatBRL, payableToRow, statusDonut } from "@/lib/formatters";

const summary = pageSummaries["/contas-a-pagar"];
const OPEN = new Set(["DRAFT", "PENDING_APPROVAL", "APPROVED"]);

export default async function ContasAPagarPage() {
  const [entries, alerts] = await Promise.all([getFinancialEntries("PAYABLE"), getAlerts()]);
  const rows = entries ? entries.map(payableToRow) : payablesRows;
  const donut = entries ? statusDonut(entries) : null;

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
    <PageShell title={summary.title} subtitle={summary.subtitle} topNav={<DashboardTopNav />} isDemo={!entries}>
      <AiInsightCard
        title="Alerta de vencimentos"
        message={alertsInsight(alerts)}
        source="regras + calendario fiscal"
        className="mb-6"
      />
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
        chartTitle="Pagar por status"
        chartMeta="Distribuicao das obrigacoes por situacao"
        chartType={donut ? "donut" : "bar"}
        chartSeries={donut ? donut.series : [{ name: "Vencimentos", data: [14, 21, 18, 11] }]}
        chartOptions={
          donut
            ? { labels: donut.labels, colors: donut.colors, legend: { position: "bottom" }, stroke: { width: 0 } }
            : { colors: ["#9fe870"], xaxis: { categories: ["Sem 1", "Sem 2", "Sem 3", "Sem 4"] }, legend: { show: false } }
        }
        sideTitle="Leitura do modulo"
        sideCopy="Aqui o operador resolve aprovacao, comprovante e baixa sem sair do fluxo principal."
      />
    </PageShell>
  );
}
