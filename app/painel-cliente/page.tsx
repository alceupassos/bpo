import Link from "next/link";
import { ShoppingCart } from "lucide-react";
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
      <Link
        href="/pdv/loja"
        className="mb-6 flex items-center justify-between rounded-[24px] border border-lime/30 bg-lime/10 px-5 py-4 transition-colors hover:bg-lime/20"
      >
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-lime text-ink">
            <ShoppingCart className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-bold text-text">Abrir PDV (frente de caixa)</p>
            <p className="text-xs text-text-soft">Venda em tela cheia com leitor, Pix e IA.</p>
          </div>
        </div>
        <span className="text-sm font-semibold text-lime">Abrir →</span>
      </Link>
      <ClientPanelScreen metrics={metrics} pending={pending} history={history} />
    </PageShell>
  );
}
