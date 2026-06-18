import { DashboardTopNav } from "@/components/dashboard-top-nav";
import { DashboardScreen } from "@/components/dashboard-screen";
import { PageShell } from "@/components/page-shell";
import { getCurrentUser, getDashboardSummary } from "@/lib/api";

export default async function HomePage() {
  const [summary, user] = await Promise.all([getDashboardSummary(), getCurrentUser()]);
  const hello = user ? `Ola, ${user.name.split(" ")[0]} —` : "Vamos acompanhar hoje";

  return (
    <PageShell
      title="Dashboard - Operacao Financeira"
      subtitle={`${hello} caixa, recebimentos, pendencias de aprovacao, OCR e conciliacao.`}
      topNav={<DashboardTopNav />}
      isDemo={!summary}
    >
      <DashboardScreen summary={summary} />
    </PageShell>
  );
}
