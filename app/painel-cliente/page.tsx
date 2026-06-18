import { DashboardTopNav } from "@/components/dashboard-top-nav";
import { ClientPanelScreen } from "@/components/client-panel-screen";
import { PageShell } from "@/components/page-shell";
import { getApprovals, getFinancialEntries } from "@/lib/api";
import { pageSummaries } from "@/lib/data";
import {
  approvalToClientRow,
  entryToHistoryRow,
  formatBRL
} from "@/lib/formatters";

const summary = pageSummaries["/painel-cliente"];
const OPEN = new Set(["DRAFT", "PENDING_APPROVAL", "APPROVED"]);

export default async function PainelClientePage() {
  const [approvals, payables, receivables] = await Promise.all([
    getApprovals(),
    getFinancialEntries("PAYABLE"),
    getFinancialEntries("RECEIVABLE")
  ]);

  const pending = approvals ? approvals.map(approvalToClientRow) : undefined;

  const baixados = [...(payables ?? []), ...(receivables ?? [])]
    .filter((e) => e.status === "PAID" || e.status === "RECEIVED")
    .sort((a, b) => (b.paidDate ?? "").localeCompare(a.paidDate ?? ""))
    .slice(0, 6);
  const history = payables || receivables ? baixados.map(entryToHistoryRow) : undefined;

  const aPagar = (payables ?? []).filter((e) => OPEN.has(e.status)).reduce((s, e) => s + e.amount, 0);
  const aReceber = (receivables ?? []).filter((e) => OPEN.has(e.status)).reduce((s, e) => s + e.amount, 0);
  const metrics =
    payables || receivables
      ? [
          { label: "A receber em aberto", value: formatBRL(aReceber) },
          { label: "A pagar em aberto", value: formatBRL(aPagar) },
          { label: "Pendencias", value: `${approvals?.length ?? 0}` }
        ]
      : undefined;

  return (
    <PageShell title={summary.title} subtitle={summary.subtitle} topNav={<DashboardTopNav />} isDemo={!payables || !receivables || !approvals}>
      <ClientPanelScreen metrics={metrics} pending={pending} history={history} />
    </PageShell>
  );
}
