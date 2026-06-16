import {
  ANCHOR_DATE,
  bankTransactions,
  documents,
  financialEntries,
  scopeByCompany
} from "../../data/seed";

const OPEN_PAYABLE = new Set(["DRAFT", "PENDING_APPROVAL", "APPROVED"]);

export class DashboardService {
  summary(companyId?: string | null) {
    const entries = scopeByCompany(financialEntries, companyId);
    const docs = scopeByCompany(documents, companyId);
    const txs = scopeByCompany(bankTransactions, companyId);
    const today = ANCHOR_DATE.getTime();

    const payables = entries.filter((e) => e.type === "PAYABLE");
    const receivables = entries.filter((e) => e.type === "RECEIVABLE");

    const aPagar = payables
      .filter((e) => OPEN_PAYABLE.has(e.status))
      .reduce((sum, e) => sum + e.amount, 0);

    const aReceber = receivables
      .filter((e) => e.status === "APPROVED" || e.status === "PENDING_APPROVAL")
      .reduce((sum, e) => sum + e.amount, 0);

    const inadimplencia = receivables
      .filter((e) => {
        if (e.status === "RECEIVED" || e.status === "CANCELLED") return false;
        const due = new Date(e.dueDate).getTime();
        return today - due > 90 * 24 * 60 * 60 * 1000 || (today > due && e.amount > 8000);
      })
      .reduce((sum, e) => sum + e.amount, 0);

    const recebido = receivables
      .filter((e) => e.status === "RECEIVED")
      .reduce((sum, e) => sum + e.amount, 0);
    const pago = payables
      .filter((e) => e.status === "PAID")
      .reduce((sum, e) => sum + e.amount, 0);

    const ocrPendente = docs.filter((d) => d.status === "NEEDS_REVIEW").length;
    const conciliacaoPendente = txs.filter(
      (t) => t.status !== "RECONCILED"
    ).length;
    const conciliados = txs.filter((t) => t.status === "RECONCILED").length;
    const taxaConciliacao = txs.length ? Math.round((conciliados / txs.length) * 1000) / 10 : 0;

    return {
      saldoProjetado: Math.round(aReceber - aPagar + recebido),
      aPagar: Math.round(aPagar),
      aReceber: Math.round(aReceber),
      inadimplencia: Math.round(inadimplencia),
      recebido: Math.round(recebido),
      pago: Math.round(pago),
      ocrPendente,
      conciliacaoPendente,
      taxaConciliacao,
      slaMedio: 1.8,
      automacao: 63
    };
  }

  cashflow(companyId?: string | null) {
    const entries = scopeByCompany(financialEntries, companyId);
    const anchor = ANCHOR_DATE;
    const months: { key: string; label: string }[] = [];
    const labels = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

    // 6 meses terminando no mês âncora.
    for (let i = 5; i >= 0; i--) {
      const d = new Date(anchor.getFullYear(), anchor.getMonth() - i, 1);
      months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: labels[d.getMonth()] });
    }

    const projected = months.map(() => 0);
    const realized = months.map(() => 0);

    for (const e of entries) {
      const due = new Date(e.dueDate);
      const key = `${due.getFullYear()}-${due.getMonth()}`;
      const idx = months.findIndex((m) => m.key === key);
      if (idx === -1) continue;
      const signed = e.type === "RECEIVABLE" ? e.amount : -e.amount;
      projected[idx] += signed;
      if (e.status === "PAID" || e.status === "RECEIVED") {
        realized[idx] += signed;
      }
    }

    return {
      categories: months.map((m) => m.label),
      projected: projected.map((v) => Math.round(v)),
      realized: realized.map((v) => Math.round(v))
    };
  }
}
