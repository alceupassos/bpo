import { AiInsightCard } from "@/components/ai-insight-card";
import { DashboardTopNav } from "@/components/dashboard-top-nav";
import { DashboardScreen } from "@/components/dashboard-screen";
import { PageShell } from "@/components/page-shell";
import { forecastInsight } from "@/lib/ai-insight-messages";
import { getCurrentUser, getDashboardSummary, getForecast } from "@/lib/api";

export default async function HomePage() {
  const [summary, user, forecast] = await Promise.all([
    getDashboardSummary(),
    getCurrentUser(),
    getForecast()
  ]);
  const hello = user ? `Ola, ${user.name.split(" ")[0]} —` : "Vamos acompanhar hoje";

  return (
    <PageShell
      title="Dashboard - Operacao Financeira"
      subtitle={`${hello} caixa, recebimentos, pendencias de aprovacao, OCR e conciliacao.`}
      topNav={<DashboardTopNav />}
      isDemo={!summary}
    >
      <AiInsightCard
        title="Previsao de fluxo de caixa"
        message={forecastInsight(forecast)}
        source="regressao-linear"
        className="mb-6"
      />
      <DashboardScreen summary={summary} />
    </PageShell>
  );
}
