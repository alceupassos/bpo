import { DashboardTopNav } from "@/components/dashboard-top-nav";
import { ModuleOverview } from "@/components/module-overview";
import { PageShell } from "@/components/page-shell";
import { getCashflow, getFinancialEntries } from "@/lib/api";
import { pageSummaries, reportRows } from "@/lib/data";
import { buildReportRows, formatBRL } from "@/lib/formatters";

const summary = pageSummaries["/relatorios"];

export default async function RelatoriosPage() {
  const [payables, receivables, cashflow] = await Promise.all([
    getFinancialEntries("PAYABLE"),
    getFinancialEntries("RECEIVABLE"),
    getCashflow()
  ]);

  const allEntries = [...(payables ?? []), ...(receivables ?? [])];
  const rows = payables || receivables ? buildReportRows(allEntries) : reportRows;

  const recebida = (receivables ?? [])
    .filter((e) => e.status === "RECEIVED")
    .reduce((s, e) => s + e.amount, 0);
  const paga = (payables ?? []).filter((e) => e.status === "PAID").reduce((s, e) => s + e.amount, 0);

  const metrics =
    payables || receivables
      ? [
          { label: "Resultado caixa", value: formatBRL(recebida - paga) },
          { label: "Receita recebida", value: formatBRL(recebida) },
          { label: "Despesa paga", value: formatBRL(paga) }
        ]
      : summary.metrics;

  const chartSeries = cashflow
    ? [
        { name: "Previsto", data: cashflow.projected },
        { name: "Realizado", data: cashflow.realized }
      ]
    : [
        { name: "Entradas", data: [68, 74, 70, 91, 87, 82] },
        { name: "Saidas", data: [52, 58, 63, 66, 71, 64] }
      ];
  const chartCategories = cashflow ? cashflow.categories : ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"];

  return (
    <PageShell title={summary.title} subtitle={summary.subtitle} topNav={<DashboardTopNav />}>
      <ModuleOverview
        metrics={metrics}
        tableTitle="Resumo semanal"
        tableMeta="Leitura de entradas, saidas e saldo por periodo"
        tableColumns={[
          { key: "periodo", label: "Periodo" },
          { key: "entradas", label: "Entradas" },
          { key: "saidas", label: "Saidas" },
          { key: "saldo", label: "Saldo" }
        ]}
        tableRows={rows}
        chartTitle="Fluxo mensal"
        chartMeta="Previsto x realizado nos ultimos meses"
        chartSeries={chartSeries}
        chartOptions={{
          colors: ["#9fe870", "#ef6a5a"],
          xaxis: { categories: chartCategories },
          stroke: { curve: "smooth", width: 3 },
          legend: { position: "top" }
        }}
        chartType="line"
        sideTitle="Leitura do modulo"
        sideCopy="Relatorios aqui sao leitura gerencial enxuta: caixa, categorias e exportacao, sem virar BI paralelo nem painel executivo pesado."
      />
    </PageShell>
  );
}
