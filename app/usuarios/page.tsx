import { DashboardTopNav } from "@/components/dashboard-top-nav";
import { ChartCard } from "@/components/chart-card";
import { DataTable } from "@/components/data-table";
import { PageShell } from "@/components/page-shell";
import { apiErrorTracker, getCompanies, getUsers } from "@/lib/api";

const roleLabels: Record<string, string> = {
  ADMIN_PLATAFORMA: "Admin plataforma",
  OPERADOR_BPO: "Operador BPO",
  GESTOR_EMPRESA: "Gestor empresa",
  FINANCEIRO_EMPRESA: "Financeiro empresa"
};

export default async function UsuariosPage() {
  const [users, companies] = await Promise.all([getUsers(), getCompanies()]);
  const companyMap = new Map((companies ?? []).map((c) => [c.id, c.tradeName]));

  const rows = (users ?? []).map((u) => ({
    nome: u.name,
    email: u.email,
    papel: roleLabels[u.role] ?? u.role,
    empresa: u.companyId ? (companyMap.get(u.companyId) ?? u.companyId) : "Plataforma Angra",
    desde: new Date(u.createdAt).toLocaleDateString("pt-BR")
  }));

  const byRole = (users ?? []).reduce<Record<string, number>>((acc, u) => {
    const label = roleLabels[u.role] ?? u.role;
    acc[label] = (acc[label] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <PageShell
      title="Usuarios e papeis"
      subtitle="Visualize quem tem acesso ao sistema e qual papel exerce em cada empresa."
      topNav={<DashboardTopNav />}
      isDemo={apiErrorTracker().hasError || !users}
    >
      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <ChartCard title="Usuarios cadastrados" meta={`${rows.length} contas ativas`}>
          <DataTable
            columns={[
              { key: "nome", label: "Nome" },
              { key: "email", label: "E-mail" },
              { key: "papel", label: "Papel" },
              { key: "empresa", label: "Empresa" },
              { key: "desde", label: "Desde" }
            ]}
            rows={rows}
          />
        </ChartCard>

        <ChartCard title="Distribuicao por papel" meta="Visao rapida de permissoes">
          <ul className="space-y-3 text-sm">
            {Object.entries(byRole).map(([papel, qtd]) => (
              <li
                key={papel}
                className="flex items-center justify-between rounded-2xl border border-border bg-surface-muted px-4 py-3"
              >
                <span className="text-text-soft">{papel}</span>
                <span className="font-bold text-text">{qtd}</span>
              </li>
            ))}
            {Object.keys(byRole).length === 0 ? (
              <li className="text-text-faint">Nenhum usuario encontrado.</li>
            ) : null}
          </ul>
        </ChartCard>
      </div>
    </PageShell>
  );
}