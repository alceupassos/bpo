import { AiInsightCard } from "@/components/ai-insight-card";
import { ChartCard } from "@/components/chart-card";
import { DashboardTopNav } from "@/components/dashboard-top-nav";
import { DataTable } from "@/components/data-table";
import { PageShell } from "@/components/page-shell";
import { apiErrorTracker, getTaxInsights } from "@/lib/api";
import { pageSummaries } from "@/lib/data";
import { formatBRL } from "@/lib/formatters";
import { ClassifyButton } from "./classify-button";

const summary = pageSummaries["/tributos"];

const sevTone: Record<string, string> = { alta: "Vencido", media: "Aguardando", baixa: "Novo" };

export default async function TributosPage() {
  const tax = await getTaxInsights();
  const isDemo = apiErrorTracker().hasError || !tax;

  const metrics = tax
    ? [
        { label: "DAS previsto (mês)", value: formatBRL(tax.dasPrevisto) },
        { label: "Alíquota efetiva", value: `${tax.aliquotaEfetiva}%`.replace(".", ",") },
        { label: "Faturamento 12m", value: formatBRL(tax.faturamento12m) }
      ]
    : summary.metrics;

  const divRows =
    tax && tax.divergencias.length > 0
      ? tax.divergencias.map((d) => ({
          tipo: d.tipo,
          descricao: d.descricao,
          status: sevTone[d.severidade] ?? "Novo"
        }))
      : [{ tipo: "—", descricao: "Nenhuma divergência fiscal detectada", status: "Aprovado" }];

  const insight =
    tax && (tax.alertas.length || tax.recomendacoes.length)
      ? [...tax.alertas, ...tax.recomendacoes].join(" · ")
      : "";

  return (
    <PageShell title={summary.title} subtitle={summary.subtitle} topNav={<DashboardTopNav />} isDemo={isDemo}>
      <AiInsightCard
        title="Agente tributário Angra IA"
        message={insight}
        source="predição Simples + malha fina"
        className="mb-6"
      />

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        {metrics.map((m) => (
          <article key={m.label} className="rounded-[24px] border border-border bg-surface p-5 soft-glow">
            <div className="text-[12px] font-medium text-text-soft">{m.label}</div>
            <div className="mt-2 text-[1.9rem] font-bold tracking-tight text-text tabular-nums">{m.value}</div>
          </article>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <ChartCard title="Malha fina — divergências fiscais" meta="Verificação automática de NCM/CFOP e duplicidades">
          <DataTable
            columns={[
              { key: "tipo", label: "Tipo" },
              { key: "descricao", label: "Diagnóstico" },
              { key: "status", label: "Severidade" }
            ]}
            rows={divRows}
          />
        </ChartCard>

        <div className="space-y-6">
          <ChartCard title="Enquadramento Simples" meta="Janela móvel de 12 meses">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-soft">Anexo</span>
                <span className="font-semibold text-text">{tax?.anexo ?? "-"}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-soft">% do teto (R$ {((tax?.teto ?? 4800000) / 1_000_000).toFixed(1)} mi)</span>
                <span className="font-semibold text-text">{tax?.percentualTeto ?? 0}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
                <div
                  className="h-full rounded-full bg-lime"
                  style={{ width: `${Math.min(100, tax?.percentualTeto ?? 0)}%` }}
                />
              </div>
            </div>
          </ChartCard>

          <ChartCard title="Classificação fiscal automática" meta="Angra IA preenche NCM/CFOP/CST dos produtos">
            <p className="mb-3 text-sm text-text-soft">
              A IA classifica os produtos sem NCM e aplica automaticamente quando a confiança é alta.
            </p>
            <ClassifyButton />
          </ChartCard>
        </div>
      </div>
    </PageShell>
  );
}
