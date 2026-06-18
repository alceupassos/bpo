import { DashboardTopNav } from "@/components/dashboard-top-nav";
import { ApprovalsTable } from "@/components/approvals-table";
import { ChartCard } from "@/components/chart-card";
import { PageShell } from "@/components/page-shell";
import { apiErrorTracker, getApprovals } from "@/lib/api";
import { approvalRows, pageSummaries } from "@/lib/data";
import { formatBRL } from "@/lib/formatters";

const summary = pageSummaries["/aprovacoes"];

export default async function AprovacoesPage() {
  const approvals = await getApprovals();
  const isDemo = apiErrorTracker().hasError || !approvals;

  const total = approvals?.reduce((s, a) => s + a.amount, 0) ?? 0;

  const metrics = approvals
    ? [
        { label: "Pendentes", value: `${approvals.length}` },
        { label: "Valor total", value: formatBRL(total) },
        { label: "Maior titulo", value: formatBRL(Math.max(...approvals.map((a) => a.amount), 0)) }
      ]
    : summary.metrics;

  return (
    <PageShell title={summary.title} subtitle={summary.subtitle} topNav={<DashboardTopNav />} isDemo={isDemo}>
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {metrics.map((m) => (
            <article key={m.label} className="rounded-[24px] border border-border bg-surface p-5 soft-glow">
              <div className="text-[12px] font-medium text-text-soft">{m.label}</div>
              <div className="mt-2 text-[1.9rem] font-bold tracking-tight text-text tabular-nums">{m.value}</div>
            </article>
          ))}
        </div>

        <ChartCard title="Fila de aprovacoes" meta="Pagamentos aguardando decisao do cliente ou operador">
          <ApprovalsTable approvals={approvals} fallbackRows={approvalRows} />
        </ChartCard>
      </div>
    </PageShell>
  );
}