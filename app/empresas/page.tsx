import { DashboardTopNav } from "@/components/dashboard-top-nav";
import { ChartCard } from "@/components/chart-card";
import { DataTable } from "@/components/data-table";
import { PageShell } from "@/components/page-shell";
import { getCompanies, apiErrorTracker } from "@/lib/api";
import { CompanyForm } from "./company-form";

export default async function EmpresasPage() {
  const companies = (await getCompanies()) ?? [];

  const rows = companies.map((c) => ({
    cnpj: c.cnpj,
    nome: c.tradeName,
    razao: c.legalName,
    regime: c.taxRegime === "SIMPLES_NACIONAL" ? "Simples Nacional" : c.taxRegime
  }));

  return (
    <PageShell
      title="Gestão de Empresas"
      subtitle="Cadastre novas empresas e crie os primeiros usuários administradores para isolamento multi-tenant."
      topNav={<DashboardTopNav />}
      isDemo={apiErrorTracker().hasError}
    >
      <div className="grid gap-6 xl:grid-cols-[1.7fr_1.3fr]">
        <ChartCard title="Empresas integradas" meta={`${companies.length} cadastradas`}>
          <DataTable
            columns={[
              { key: "nome", label: "Nome Fantasia" },
              { key: "razao", label: "Razão Social" },
              { key: "cnpj", label: "CNPJ" },
              { key: "regime", label: "Regime" }
            ]}
            rows={rows}
          />
        </ChartCard>

        <ChartCard title="Novo Onboarding" meta="Cadastre empresa e gestor de forma atômica">
          <CompanyForm />
        </ChartCard>
      </div>
    </PageShell>
  );
}
