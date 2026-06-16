import {
  financialEntries,
  scopeByCompany,
  type EntryType,
  type FinancialEntry
} from "../../data/seed";

type CreateFinancialEntryPayload = {
  type: EntryType;
  description: string;
  counterpartyName: string;
  amount: number;
  dueDate?: string;
};

export class FinancialEntriesService {
  private readonly entries: FinancialEntry[] = [...financialEntries];

  list(type?: EntryType, companyId?: string | null) {
    let result = scopeByCompany(this.entries, companyId);
    if (type) {
      result = result.filter((entry) => entry.type === type);
    }
    return result;
  }

  create(payload: CreateFinancialEntryPayload, companyId?: string | null) {
    const today = new Date().toISOString().slice(0, 10);
    const entry: FinancialEntry = {
      id: `entry-${this.entries.length + 1}`,
      companyId: companyId ?? "company-1",
      type: payload.type,
      status: "DRAFT",
      description: payload.description,
      counterpartyName: payload.counterpartyName,
      category: payload.type === "RECEIVABLE" ? "Vendas" : "Servicos de Terceiros",
      documentNumber: `MAN-${this.entries.length + 1}`,
      amount: payload.amount,
      issueDate: today,
      dueDate: payload.dueDate ?? today,
      paidDate: null
    };
    this.entries.push(entry);
    return entry;
  }

  markPaid(id: string) {
    const entry = this.entries.find((e) => e.id === id);
    if (!entry) return { id, status: "PAID" };
    entry.status = "PAID";
    entry.paidDate = new Date().toISOString().slice(0, 10);
    return entry;
  }

  markReceived(id: string) {
    const entry = this.entries.find((e) => e.id === id);
    if (!entry) return { id, status: "RECEIVED" };
    entry.status = "RECEIVED";
    entry.paidDate = new Date().toISOString().slice(0, 10);
    return entry;
  }
}
