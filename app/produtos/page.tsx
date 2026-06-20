import { DashboardTopNav } from "@/components/dashboard-top-nav";
import { ChartCard } from "@/components/chart-card";
import { DataTable } from "@/components/data-table";
import { PageShell } from "@/components/page-shell";
import { getProducts, apiErrorTracker } from "@/lib/api";
import { formatBRL } from "@/lib/formatters";
import { createProduct } from "./actions";

export default async function ProdutosPage() {
  const products = (await getProducts()) ?? [];
  const rows = products.map((p) => ({
    produto: p.name,
    codigo: p.barcode ?? "-",
    fiscal: `${p.ncm ?? "s/ NCM"} · CFOP ${p.cfop ?? "-"}`,
    categoria: p.category ?? "-",
    preco: formatBRL(p.price)
  }));

  return (
    <PageShell
      title="Produtos"
      subtitle="Catalogo de produtos — cadastre manualmente ou a partir de notas fiscais."
      topNav={<DashboardTopNav />}
      isDemo={apiErrorTracker().hasError}
    >
      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <ChartCard title="Catalogo" meta={`${products.length} produtos cadastrados`}>
          <DataTable
            columns={[
              { key: "produto", label: "Produto" },
              { key: "codigo", label: "Codigo" },
              { key: "fiscal", label: "Fiscal (NCM/CFOP)" },
              { key: "categoria", label: "Categoria" },
              { key: "preco", label: "Preco" }
            ]}
            rows={rows}
          />
        </ChartCard>

        <ChartCard title="Novo produto" meta="Cadastro rapido">
          <form action={createProduct} className="space-y-3">
            <div>
              <label htmlFor="name" className="mb-1 block text-[11px] uppercase tracking-[0.14em] text-text-faint">
                Nome
              </label>
              <input
                id="name"
                name="name"
                required
                autoComplete="off"
                placeholder="Ex.: Pao Frances (kg)"
                className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-text outline-none focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-ink/20"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="price" className="mb-1 block text-[11px] uppercase tracking-[0.14em] text-text-faint">
                  Preco
                </label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  placeholder="0,00"
                  className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-text outline-none focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-ink/20"
                />
              </div>
              <div>
                <label htmlFor="unit" className="mb-1 block text-[11px] uppercase tracking-[0.14em] text-text-faint">
                  Unidade
                </label>
                <input
                  id="unit"
                  name="unit"
                  defaultValue="UN"
                  autoComplete="off"
                  className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-text outline-none focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-ink/20"
                />
              </div>
            </div>
            <div>
              <label htmlFor="category" className="mb-1 block text-[11px] uppercase tracking-[0.14em] text-text-faint">
                Categoria
              </label>
              <input
                id="category"
                name="category"
                autoComplete="off"
                placeholder="Ex.: Padaria"
                className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-text outline-none focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-ink/20"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label htmlFor="ncm" className="mb-1 block text-[11px] uppercase tracking-[0.14em] text-text-faint">
                  NCM
                </label>
                <input id="ncm" name="ncm" autoComplete="off" placeholder="00000000" className="w-full rounded-2xl border border-border bg-surface px-3 py-3 text-text outline-none focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-ink/20" />
              </div>
              <div>
                <label htmlFor="cfop" className="mb-1 block text-[11px] uppercase tracking-[0.14em] text-text-faint">
                  CFOP
                </label>
                <input id="cfop" name="cfop" autoComplete="off" defaultValue="5102" className="w-full rounded-2xl border border-border bg-surface px-3 py-3 text-text outline-none focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-ink/20" />
              </div>
              <div>
                <label htmlFor="csosn" className="mb-1 block text-[11px] uppercase tracking-[0.14em] text-text-faint">
                  CSOSN
                </label>
                <input id="csosn" name="csosn" autoComplete="off" defaultValue="102" className="w-full rounded-2xl border border-border bg-surface px-3 py-3 text-text outline-none focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-ink/20" />
              </div>
            </div>
            <button
              type="submit"
              className="w-full rounded-2xl bg-lime px-4 py-3 font-semibold text-ink transition-colors hover:bg-lime-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
            >
              Cadastrar produto
            </button>
          </form>
        </ChartCard>
      </div>
    </PageShell>
  );
}
