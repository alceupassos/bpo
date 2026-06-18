import { DashboardTopNav } from "@/components/dashboard-top-nav";
import { ChartCard } from "@/components/chart-card";
import { DataTable } from "@/components/data-table";
import { PageShell } from "@/components/page-shell";
import { apiErrorTracker, getAuditLogs } from "@/lib/api";
import { auditLogRows } from "@/lib/data";
import { formatDateBR } from "@/lib/formatters";

export default async function AuditoriaPage() {
  const logs = await getAuditLogs();
  const isDemo = apiErrorTracker().hasError || !logs;

  const rows = logs
    ? logs.map((l) => ({
        data: formatDateBR(l.createdAt),
        entidade: l.entityType,
        acao: l.action,
        responsavel: l.actor,
        referencia: l.entityId.slice(0, 12)
      }))
    : auditLogRows;

  return (
    <PageShell
      title="Auditoria"
      subtitle="Trilha de quem fez o que e quando — mutacoes registradas automaticamente."
      topNav={<DashboardTopNav />}
      isDemo={isDemo}
    >
      <ChartCard title="Eventos recentes" meta={`${rows.length} registros`}>
        <DataTable
          columns={[
            { key: "data", label: "Data" },
            { key: "entidade", label: "Entidade" },
            { key: "acao", label: "Acao" },
            { key: "responsavel", label: "Responsavel" },
            { key: "referencia", label: "Referencia" }
          ]}
          rows={rows}
        />
      </ChartCard>
    </PageShell>
  );
}