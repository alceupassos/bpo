import { RechartsChart } from "@/components/recharts-chart";
import { ChartCard } from "@/components/chart-card";
import { PageShell } from "@/components/page-shell";
import {
  apiPost,
  getAlerts,
  getAnomalies,
  getForecast,
  getMonthlySummary,
  apiErrorTracker
} from "@/lib/api";
import { formatBRL } from "@/lib/formatters";

const severityColor: Record<string, string> = {
  alta: "text-danger bg-danger/15 border-danger/30",
  media: "text-warning bg-warning/15 border-warning/30",
  baixa: "text-text-soft bg-surface-muted border-border"
};

export default async function InteligenciaPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const question = sp.q?.trim();

  const [forecast, anomalies, alerts, summary, copilot] = await Promise.all([
    getForecast(),
    getAnomalies(),
    getAlerts(),
    getMonthlySummary(),
    question
      ? apiPost<{ answer: string; source: string }>("/ai/copilot", { question })
      : Promise.resolve(null)
  ]);

  const fc = forecast ?? { history: { categories: [], net: [] }, forecast: { categories: [], net: [] }, method: "" };
  const series = [
    { name: "Realizado", data: [...fc.history.net, ...fc.forecast.net.map(() => null)] },
    { name: "Previsto", data: [...fc.history.net.map(() => null), ...fc.forecast.net] }
  ];
  const categories = [...fc.history.categories, ...fc.forecast.categories];

  return (
    <PageShell
      title="IA Financeira"
      subtitle="Recursos de IA open-source: copiloto, previsão de caixa, detecção de anomalias e alertas inteligentes — todos com fallback determinístico."
      isDemo={apiErrorTracker().hasError}
    >
      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <ChartCard title="Previsão de fluxo de caixa" meta="Regressão linear (open-source) — próximos 3 meses">
            <RechartsChart
              type="line"
              height={260}
              series={series as never}
              options={{
                colors: ["#9fe870", "#60a5fa"],
                stroke: { width: 3, curve: "smooth", dashArray: [0, 6] },
                xaxis: { categories }
              }}
            />
          </ChartCard>

          <ChartCard title="Copiloto financeiro" meta="Pergunte sobre suas contas (Ollama/cloud + fallback)">
            <form method="get" className="flex gap-2">
              <input
                name="q"
                defaultValue={question ?? ""}
                placeholder="Ex.: quanto tenho a pagar essa semana?"
                className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-text outline-none focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-ink/20"
                autoComplete="off"
              />
              <button
                type="submit"
                className="shrink-0 rounded-2xl bg-lime px-5 py-3 font-semibold text-ink transition-colors hover:bg-lime-strong"
              >
                Perguntar
              </button>
            </form>
            {copilot && (
              <div className="mt-4 rounded-2xl border border-border bg-surface-muted p-4 text-sm text-text">
                {copilot.answer}
                <div className="mt-2 text-[10px] uppercase tracking-wide text-text-faint">
                  Fonte: {copilot.source}
                </div>
              </div>
            )}
          </ChartCard>
        </div>

        <div className="space-y-6">
          <ChartCard title="Resumo do mês" meta="Gerado por IA">
            <p className="text-sm text-text">{summary?.summary ?? "Sem dados suficientes para o resumo."}</p>
            {summary && (
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl border border-border bg-surface-muted p-3">
                  <div className="text-[10px] uppercase text-text-faint">Entrou</div>
                  <div className="text-sm font-bold tabular-nums text-success">{formatBRL(summary.data.entrou)}</div>
                </div>
                <div className="rounded-xl border border-border bg-surface-muted p-3">
                  <div className="text-[10px] uppercase text-text-faint">Saiu</div>
                  <div className="text-sm font-bold tabular-nums text-danger">{formatBRL(summary.data.saiu)}</div>
                </div>
                <div className="rounded-xl border border-border bg-surface-muted p-3">
                  <div className="text-[10px] uppercase text-text-faint">Sobra</div>
                  <div className="text-sm font-bold tabular-nums text-text">{formatBRL(summary.data.sobra)}</div>
                </div>
              </div>
            )}
          </ChartCard>

          <ChartCard title="Alertas inteligentes" meta={`${alerts?.total ?? 0} pendências por risco`}>
            <ul className="space-y-2">
              {(alerts?.alerts ?? []).slice(0, 6).map((a, i) => (
                <li key={i} className="flex items-center justify-between rounded-xl border border-border bg-surface-muted p-3">
                  <span className="text-xs text-text">{a.title}</span>
                  <span className="text-xs font-semibold tabular-nums text-text-soft">{formatBRL(a.amount)}</span>
                </li>
              ))}
              {(!alerts || alerts.alerts.length === 0) && (
                <li className="text-xs text-text-soft">Nenhum alerta no momento.</li>
              )}
            </ul>
          </ChartCard>

          <ChartCard title="Anomalias detectadas" meta={`${anomalies?.total ?? 0} ocorrências`}>
            <ul className="space-y-2">
              {(anomalies?.findings ?? []).slice(0, 6).map((f, i) => (
                <li key={i} className="rounded-xl border border-border bg-surface-muted p-3">
                  <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium ${severityColor[f.severity] ?? severityColor.baixa}`}>
                    {f.severity}
                  </span>
                  <p className="mt-1 text-xs text-text">{f.description}</p>
                </li>
              ))}
              {(!anomalies || anomalies.findings.length === 0) && (
                <li className="text-xs text-text-soft">Nenhuma anomalia encontrada.</li>
              )}
            </ul>
          </ChartCard>
        </div>
      </div>
    </PageShell>
  );
}
