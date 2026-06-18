import { DashboardTopNav } from "@/components/dashboard-top-nav";
import { ChartCard } from "@/components/chart-card";
import { DataTable } from "@/components/data-table";
import { PageShell } from "@/components/page-shell";
import { apiErrorTracker, getSuppliers } from "@/lib/api";
import { createSupplier } from "./actions";

const inputClass =
  "w-full rounded-2xl border border-border bg-surface px-4 py-3 text-text outline-none focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-ink/20";
const labelClass = "mb-1 block text-[11px] uppercase tracking-[0.14em] text-text-faint";

export default async function FornecedoresPage() {
  const suppliers = (await getSuppliers()) ?? [];

  const rows = suppliers.map((s) => ({
    nome: s.name,
    cnpj: s.cnpj ?? "—",
    categoria: s.category ?? "—",
    contato: s.phone ?? s.email ?? "—"
  }));

  return (
    <PageShell
      title="Fornecedores"
      subtitle="Cadastro de fornecedores vinculados a notas fiscais e contas a pagar."
      topNav={<DashboardTopNav />}
      isDemo={apiErrorTracker().hasError}
    >
      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <ChartCard title="Fornecedores cadastrados" meta={`${suppliers.length} fornecedores`}>
          <DataTable
            columns={[
              { key: "nome", label: "Nome" },
              { key: "cnpj", label: "CNPJ" },
              { key: "categoria", label: "Categoria" },
              { key: "contato", label: "Contato" }
            ]}
            rows={rows}
          />
        </ChartCard>

        <ChartCard title="Novo fornecedor" meta="Cadastro manual">
          <form action={createSupplier} className="space-y-3">
            <div>
              <label htmlFor="name" className={labelClass}>
                Nome / Razao social
              </label>
              <input id="name" name="name" required placeholder="Ex.: Martins Distribuicao" className={inputClass} />
            </div>
            <div>
              <label htmlFor="cnpj" className={labelClass}>
                CNPJ
              </label>
              <input id="cnpj" name="cnpj" placeholder="00.000.000/0001-00" className={inputClass} />
            </div>
            <div>
              <label htmlFor="category" className={labelClass}>
                Categoria
              </label>
              <input id="category" name="category" placeholder="Ex.: Mercearia" className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="phone" className={labelClass}>
                  Telefone
                </label>
                <input id="phone" name="phone" placeholder="+55 ..." className={inputClass} />
              </div>
              <div>
                <label htmlFor="email" className={labelClass}>
                  E-mail
                </label>
                <input id="email" name="email" type="email" placeholder="contato@..." className={inputClass} />
              </div>
            </div>
            <button
              type="submit"
              className="w-full rounded-2xl bg-lime px-4 py-3 font-semibold text-ink transition-colors hover:bg-lime-strong"
            >
              Cadastrar fornecedor
            </button>
          </form>
        </ChartCard>
      </div>
    </PageShell>
  );
}