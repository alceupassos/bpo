import { bankAccounts, bankTransactions, scopeByCompany, type BankTransaction } from "../../data/seed";

export class BankingService {
  private readonly transactions: BankTransaction[] = [...bankTransactions];

  listTransactions(companyId?: string | null) {
    return scopeByCompany(this.transactions, companyId);
  }

  listAccounts(companyId?: string | null) {
    return scopeByCompany(bankAccounts, companyId);
  }

  importStatement() {
    const imported = this.transactions.filter((t) => t.status === "IMPORTED").length;
    return { imported, status: "IMPORTED" };
  }

  suggestMatch() {
    const pending = this.transactions.filter(
      (t) => t.status === "IMPORTED" || t.status === "DIVERGENT"
    ).length;
    const suggested = this.transactions.filter((t) => t.status === "SUGGESTED_MATCH").length;
    return { pending, suggested };
  }

  confirmMatch(transactionId: string) {
    const tx = this.transactions.find((t) => t.id === transactionId);
    if (tx) tx.status = "RECONCILED";
    return tx ?? { id: transactionId, status: "RECONCILED" };
  }
}
