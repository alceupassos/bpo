import { DashboardTopNav } from "@/components/dashboard-top-nav";
import { ChartCard } from "@/components/chart-card";
import { DataTable } from "@/components/data-table";
import { PageShell } from "@/components/page-shell";
import { StatusBadge } from "@/components/status-badge";
import { apiErrorTracker, getCorporateDocs } from "@/lib/api";
import { formatDateBR } from "@/lib/formatters";

const typeLabels: Record<string, string> = {
  CONTRATO_SOCIAL: "Contrato social",
  CERTIFICADO_DIGITAL: "Certificado digital",
  PROCURACAO: "Procuracao",
  ALVARA: "Alvara",
  OUTRO: "Outro"
};

function expiryStatus(expiryDate: string | null): { label: string; tone: "success" | "warning" | "danger" | "neutral" } {
  if (!expiryDate) return { label: "Sem vencimento", tone: "neutral" };
  const days = Math.ceil((new Date(expiryDate).getTime() - Date.now()) / 86400000);
  if (days < 0) return { label: `Vencido ha ${Math.abs(days)}d`, tone: "danger" };
  if (days <= 60) return { label: `Vence em ${days}d`, tone: "warning" };
  return { label: `Valido (${days}d)`, tone: "success" };
}

export default async function SocietarioPage() {
  const docs = (await getCorporateDocs()) ?? [];

  const alerts = docs
    .filter((d) => d.expiryDate)
    .map((d) => ({ ...d, status: expiryStatus(d.expiryDate) }))
    .filter((d) => d.status.tone === "danger" || d.status.tone === "warning");

  const rows = docs.map((d) => {
    const st = expiryStatus(d.expiryDate);
    return {
      tipo: typeLabels[d.type] ?? d.type,
      titulo: d.title,
      emissao: formatDateBR(d.issueDate),
      validade: formatDateBR(d.expiryDate),
      situacao: st.label
    };
  });

  return (
    <PageShell
      title="Documentos societarios"
      subtitle="Contratos, certificados digitais, procuracoes e alertas de vencimento."
      topNav={<DashboardTopNav />}
      isDemo={apiErrorTracker().hasError}
    >
      {alerts.length > 0 ? (
        <div className="mb-6 space-y-2">
          {alerts.map((d) => (
            <div
              key={d.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/10 px-5 py-3"
            >
              <div>
                <div className="text-sm font-semibold text-text">{d.title}</div>
                <div className="text-xs text-text-soft">
                  {typeLabels[d.type] ?? d.type} · validade {formatDateBR(d.expiryDate)}
                </div>
              </div>
              <StatusBadge label={d.status.label} tone={d.status.tone} />
            </div>
          ))}
        </div>
      ) : null}

      <ChartCard title="Arquivo societario" meta={`${docs.length} documentos`}>
        <DataTable
          columns={[
            { key: "tipo", label: "Tipo" },
            { key: "titulo", label: "Titulo" },
            { key: "emissao", label: "Emissao" },
            { key: "validade", label: "Validade" },
            { key: "situacao", label: "Situacao" }
          ]}
          rows={rows}
        />
      </ChartCard>
    </PageShell>
  );
}