import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

const OPEN_PAYABLE = new Set(["DRAFT", "PENDING_APPROVAL", "APPROVED"]);

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async summary(companyId?: string | null) {
    const where = companyId ? { companyId } : {};
    const [entries, ocrPendente, conciliacaoPendente, conciliados, totalTx] = await Promise.all([
      this.prisma.financialEntry.findMany({ where }),
      this.prisma.document.count({ where: { ...where, status: "NEEDS_REVIEW" } }),
      this.prisma.bankTransaction.count({ where: { ...where, status: { not: "RECONCILED" } } }),
      this.prisma.bankTransaction.count({ where: { ...where, status: "RECONCILED" } }),
      this.prisma.bankTransaction.count({ where })
    ]);

    const now = Date.now();
    const payables = entries.filter((e) => e.type === "PAYABLE");
    const receivables = entries.filter((e) => e.type === "RECEIVABLE");

    const aPagar = payables.filter((e) => OPEN_PAYABLE.has(e.status)).reduce((s, e) => s + e.amount, 0);
    const aReceber = receivables
      .filter((e) => e.status === "APPROVED" || e.status === "PENDING_APPROVAL")
      .reduce((s, e) => s + e.amount, 0);
    const inadimplencia = receivables
      .filter((e) => {
        if (e.status === "RECEIVED" || e.status === "CANCELLED") return false;
        const due = new Date(e.dueDate).getTime();
        return now - due > 90 * 86400000 || (now > due && e.amount > 8000);
      })
      .reduce((s, e) => s + e.amount, 0);
    const recebido = receivables.filter((e) => e.status === "RECEIVED").reduce((s, e) => s + e.amount, 0);
    const pago = payables.filter((e) => e.status === "PAID").reduce((s, e) => s + e.amount, 0);

    return {
      saldoProjetado: Math.round(aReceber - aPagar + recebido),
      aPagar: Math.round(aPagar),
      aReceber: Math.round(aReceber),
      inadimplencia: Math.round(inadimplencia),
      recebido: Math.round(recebido),
      pago: Math.round(pago),
      ocrPendente,
      conciliacaoPendente,
      taxaConciliacao: totalTx ? Math.round((conciliados / totalTx) * 1000) / 10 : 0,
      slaMedio: 1.8,
      automacao: 63
    };
  }

  async cashflow(companyId?: string | null) {
    const entries = await this.prisma.financialEntry.findMany({ where: companyId ? { companyId } : {} });
    const labels = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const anchor = new Date();
    const months: { key: string; label: string }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(anchor.getFullYear(), anchor.getMonth() - i, 1);
      months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: labels[d.getMonth()] });
    }
    const projected = months.map(() => 0);
    const realized = months.map(() => 0);
    for (const e of entries) {
      const due = new Date(e.dueDate);
      const idx = months.findIndex((m) => m.key === `${due.getFullYear()}-${due.getMonth()}`);
      if (idx === -1) continue;
      const signed = e.type === "RECEIVABLE" ? e.amount : -e.amount;
      projected[idx] += signed;
      if (e.status === "PAID" || e.status === "RECEIVED") realized[idx] += signed;
    }
    return {
      categories: months.map((m) => m.label),
      projected: projected.map((v) => Math.round(v)),
      realized: realized.map((v) => Math.round(v))
    };
  }

  /**
   * Controle de faturamento dos últimos 12 meses (janela móvel) — base para o
   * enquadramento do Simples Nacional. Soma as receitas por mês de emissão.
   */
  async faturamento12m(companyId?: string | null) {
    const entries = await this.prisma.financialEntry.findMany({
      where: { ...(companyId ? { companyId } : {}), type: "RECEIVABLE" }
    });
    const labels = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const anchor = new Date();
    const months: { key: string; label: string }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(anchor.getFullYear(), anchor.getMonth() - i, 1);
      months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: labels[d.getMonth()] });
    }
    const values = months.map(() => 0);
    for (const e of entries) {
      const ref = new Date(e.issueDate);
      const idx = months.findIndex((m) => m.key === `${ref.getFullYear()}-${ref.getMonth()}`);
      if (idx === -1) continue;
      values[idx] += e.amount;
    }
    const total12m = values.reduce((s, v) => s + v, 0);
    // Teto do Simples Nacional = R$ 4.800.000/ano.
    const TETO = 4_800_000;
    return {
      categories: months.map((m) => m.label),
      faturamento: values.map((v) => Math.round(v)),
      total12m: Math.round(total12m),
      teto: TETO,
      percentualTeto: Math.round((total12m / TETO) * 1000) / 10
    };
  }
}
