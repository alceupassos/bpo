import { AiInsightCard } from "@/components/ai-insight-card";
import { ApexChart } from "@/components/apex-chart";
import { ChartCard } from "@/components/chart-card";
import { DashboardTopNav } from "@/components/dashboard-top-nav";
import { DataTable } from "@/components/data-table";
import { PageShell } from "@/components/page-shell";
import { PdvTerminal } from "@/components/pdv/pdv-terminal";
import { apiErrorTracker, getCashCurrent, getCustomers, getPdvSummary, getProducts } from "@/lib/api";
import { pageSummaries } from "@/lib/data";
import { formatBRL } from "@/lib/formatters";
import { importOcrAction } from "./actions";

const summary = pageSummaries["/pdv"];

export default async function PdvPage() {
  const [products, customers, session, pdv] = await Promise.all([
    getProducts(),
    getCustomers(),
    getCashCurrent(),
    getPdvSummary()
  ]);

  const isDemo = apiErrorTracker().hasError;

  const metrics = pdv
    ? [
        { label: "Vendas hoje", value: formatBRL(pdv.vendasHoje) },
        { label: "Pedidos", value: String(pdv.pedidos) },
        { label: "Ticket médio", value: formatBRL(pdv.ticketMedio) }
      ]
    : summary.metrics;

  // Vendas por hora (recorte do horário comercial 7h–22h).
  const horas = Array.from({ length: 16 }, (_, i) => i + 7);
  const porHora = horas.map((h) => (pdv ? pdv.porHora[h] ?? 0 : 0));

  return (
    <PageShell title={summary.title} subtitle={summary.subtitle} topNav={<DashboardTopNav />} isDemo={isDemo}>
      {pdv && pdv.alertas.length > 0 && (
        <AiInsightCard
          title="Inteligência do caixa"
          message={pdv.alertas.join(" · ")}
          source="anti-fraude + ticket médio"
          className="mb-6"
        />
      )}

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        {metrics.map((m) => (
          <article key={m.label} className="rounded-[24px] border border-border bg-surface p-5 soft-glow">
            <div className="text-[12px] font-medium text-text-soft">{m.label}</div>
            <div className="mt-2 text-[1.9rem] font-bold tracking-tight text-text tabular-nums">{m.value}</div>
          </article>
        ))}
      </div>

      <PdvTerminal products={products ?? []} customers={customers ?? []} hasSession={Boolean(session)} />

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <ChartCard title="Vendas por hora" meta="Faturamento do dia por faixa horária" actionHref="/relatorios">
          <ApexChart
            type="bar"
            height={280}
            series={[{ name: "Vendas", data: porHora }]}
            options={{
              colors: ["#9fe870"],
              xaxis: { categories: horas.map((h) => `${String(h).padStart(2, "0")}h`) },
              legend: { show: false }
            }}
          />
        </ChartCard>

        <div className="space-y-6">
          <ChartCard title="Top produtos do dia" meta="Por faturamento" actionHref="/produtos">
            <DataTable
              columns={[
                { key: "produto", label: "Produto" },
                { key: "qtd", label: "Qtd" },
                { key: "total", label: "Total" }
              ]}
              rows={
                pdv && pdv.topProdutos.length > 0
                  ? pdv.topProdutos.map((p) => ({
                      produto: p.description,
                      qtd: String(p.qty),
                      total: formatBRL(p.total)
                    }))
                  : [{ produto: "Sem vendas hoje", qtd: "-", total: "-" }]
              }
            />
          </ChartCard>

          <ChartCard
            title="Entrada por OCR"
            meta="Foto da nota do fornecedor → produtos e estoque (IA)"
            actionHref="/produtos"
          >
            <form action={importOcrAction} className="space-y-3">
              <input
                id="ocr-file"
                name="file"
                type="file"
                accept="image/*"
                capture="environment"
                required
                className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-text-soft file:mr-3 file:rounded-xl file:border-0 file:bg-lime file:px-3 file:py-1.5 file:font-semibold file:text-ink"
              />
              <button
                type="submit"
                className="w-full rounded-2xl bg-lime px-4 py-3 font-semibold text-ink transition-colors hover:bg-lime-strong"
              >
                Importar produtos da nota
              </button>
              <p className="text-[11px] text-text-faint">
                Sem IA configurada, a nota cai para revisão manual — nunca trava.
              </p>
            </form>
          </ChartCard>
        </div>
      </div>
    </PageShell>
  );
}
