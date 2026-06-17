import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

// Similaridade de strings (Jaro-Winkler) — open-source, sem dependências.
function jaro(a: string, b: string): number {
  if (a === b) return 1;
  const matchWindow = Math.max(0, Math.floor(Math.max(a.length, b.length) / 2) - 1);
  const aMatches = new Array(a.length).fill(false);
  const bMatches = new Array(b.length).fill(false);
  let matches = 0;
  for (let i = 0; i < a.length; i++) {
    const start = Math.max(0, i - matchWindow);
    const end = Math.min(i + matchWindow + 1, b.length);
    for (let j = start; j < end; j++) {
      if (bMatches[j] || a[i] !== b[j]) continue;
      aMatches[i] = true;
      bMatches[j] = true;
      matches++;
      break;
    }
  }
  if (matches === 0) return 0;
  let t = 0;
  let k = 0;
  for (let i = 0; i < a.length; i++) {
    if (!aMatches[i]) continue;
    while (!bMatches[k]) k++;
    if (a[i] !== b[k]) t++;
    k++;
  }
  t /= 2;
  return (matches / a.length + matches / b.length + (matches - t) / matches) / 3;
}

function jaroWinkler(a: string, b: string): number {
  const s1 = a.toLowerCase();
  const s2 = b.toLowerCase();
  const j = jaro(s1, s2);
  let prefix = 0;
  while (prefix < 4 && prefix < s1.length && prefix < s2.length && s1[prefix] === s2[prefix]) prefix++;
  return j + prefix * 0.1 * (1 - j);
}

@Injectable()
export class BankingService {
  constructor(private readonly prisma: PrismaService) {}

  listTransactions(companyId?: string | null) {
    return this.prisma.bankTransaction.findMany({
      where: companyId ? { companyId } : {},
      orderBy: { date: "desc" }
    });
  }

  listAccounts(companyId?: string | null) {
    return this.prisma.bankAccount.findMany({ where: companyId ? { companyId } : {} });
  }

  async importStatement() {
    const imported = await this.prisma.bankTransaction.count({ where: { status: "IMPORTED" } });
    return { imported, status: "IMPORTED" };
  }

  /**
   * Conciliação inteligente (auto-matcher): para cada transação pendente,
   * acha o lançamento mais provável combinando proximidade de valor, data e
   * similaridade do nome (Jaro-Winkler). Marca como SUGGESTED_MATCH quando há
   * candidato confiável; deixa para confirmação humana.
   */
  async suggestMatch(companyId?: string | null) {
    const where = companyId ? { companyId } : {};
    const [pending, entries] = await Promise.all([
      this.prisma.bankTransaction.findMany({
        where: { ...where, status: { in: ["IMPORTED", "DIVERGENT"] } }
      }),
      this.prisma.financialEntry.findMany({ where })
    ]);

    let suggested = 0;
    for (const tx of pending) {
      const best = this.bestEntryFor(tx, entries);
      if (best && best.score >= 0.6) {
        await this.prisma.bankTransaction.update({
          where: { id: tx.id },
          data: { status: "SUGGESTED_MATCH", matchedEntryId: best.entryId }
        });
        suggested++;
      }
    }
    return { pending: pending.length, suggested };
  }

  private bestEntryFor(
    tx: { amount: number; date: Date; description: string },
    entries: { id: string; amount: number; dueDate: Date; counterpartyName: string }[]
  ): { entryId: string; score: number } | null {
    let best: { entryId: string; score: number } | null = null;
    const txAmount = Math.abs(tx.amount);
    for (const e of entries) {
      const amountDiff = Math.abs(Math.abs(e.amount) - txAmount);
      const amountScore = amountDiff < 0.01 ? 1 : Math.max(0, 1 - amountDiff / Math.max(txAmount, 1));
      const days = Math.abs(new Date(tx.date).getTime() - new Date(e.dueDate).getTime()) / 86400000;
      const dateScore = Math.max(0, 1 - days / 15);
      const nameScore = jaroWinkler(tx.description, e.counterpartyName);
      const score = amountScore * 0.6 + dateScore * 0.2 + nameScore * 0.2;
      if (!best || score > best.score) best = { entryId: e.id, score };
    }
    return best;
  }

  /** Confirma automaticamente todos os matches sugeridos com alta confiança. */
  async autoReconcile(companyId?: string | null) {
    await this.suggestMatch(companyId);
    const result = await this.prisma.bankTransaction.updateMany({
      where: { ...(companyId ? { companyId } : {}), status: "SUGGESTED_MATCH" },
      data: { status: "RECONCILED" }
    });
    return { reconciled: result.count };
  }

  confirmMatch(transactionId: string) {
    return this.prisma.bankTransaction.update({
      where: { id: transactionId },
      data: { status: "RECONCILED" }
    });
  }
}
