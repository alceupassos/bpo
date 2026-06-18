import { DashboardTopNav } from "@/components/dashboard-top-nav";
import { ModuleOverview } from "@/components/module-overview";
import { PageShell } from "@/components/page-shell";
import { getBankAccounts, getCompanies } from "@/lib/api";
import { pageSummaries, settingsRows } from "@/lib/data";
import { buildSettingsRows } from "@/lib/formatters";

const summary = pageSummaries["/configuracoes"];

export default async function ConfiguracoesPage() {
  const [companies, accounts] = await Promise.all([getCompanies(), getBankAccounts()]);
  const rows = companies ? buildSettingsRows(companies, accounts ?? []) : settingsRows;

  const metrics = companies
    ? [
        { label: "Empresas", value: `${companies.length}` },
        { label: "Bancos conectados", value: `${(accounts ?? []).length}` },
        { label: "Setup concluido", value: "76%" }
      ]
    : summary.metrics;

  return (
    <PageShell title={summary.title} subtitle={summary.subtitle} topNav={<DashboardTopNav />} isDemo={!companies || !accounts}>
      <ModuleOverview
        metrics={metrics}
        tableTitle="Base operacional"
        tableMeta="Cadastros minimos para empresa, banco, aprovacao e usuarios"
        tableColumns={[
          { key: "grupo", label: "Grupo" },
          { key: "item", label: "Item" },
          { key: "detalhe", label: "Detalhe" },
          { key: "status", label: "Status" }
        ]}
        tableRows={rows}
        chartTitle="Checklist de onboarding"
        chartMeta="Avanco do setup inicial do cliente"
        chartSeries={[76, 24]}
        chartOptions={{
          labels: ["Concluido", "Pendente"],
          colors: ["#9fe870", "#3d5a34"],
          legend: { position: "bottom" },
          stroke: { width: 0 }
        }}
        chartType="donut"
        sideTitle="Leitura do modulo"
        sideCopy="Configuracoes continuam minimas: empresa, banco, categoria e aprovacao. O objetivo e ligar a operacao, nao abrir uma camada de administracao pesada."
      />
    </PageShell>
  );
}
