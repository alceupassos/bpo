import { Injectable } from "@nestjs/common";
import { ResourceScopeService } from "../../common/resource-scope.service";
import { PrismaService } from "../../prisma/prisma.service";

type EntryType = "PAYABLE" | "RECEIVABLE" | "EXPENSE" | "REVENUE";

type CreateFinancialEntryPayload = {
  type: EntryType;
  description: string;
  counterpartyName: string;
  amount: number;
  dueDate?: string;
};

@Injectable()
export class FinancialEntriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scope: ResourceScopeService
  ) {}

  list(type?: EntryType, companyId?: string | null) {
    return this.prisma.financialEntry.findMany({
      where: { ...(type ? { type } : {}), ...(companyId ? { companyId } : {}) },
      orderBy: { dueDate: "asc" }
    });
  }

  create(payload: CreateFinancialEntryPayload, companyId?: string | null) {
    const today = new Date();
    return this.prisma.financialEntry.create({
      data: {
        companyId: companyId ?? "company-1",
        type: payload.type,
        status: "DRAFT",
        description: payload.description,
        counterpartyName: payload.counterpartyName,
        category: payload.type === "RECEIVABLE" ? "Vendas" : "Servicos de Terceiros",
        documentNumber: "MAN",
        amount: payload.amount,
        issueDate: today,
        dueDate: payload.dueDate ? new Date(payload.dueDate) : today,
        paidDate: null
      }
    });
  }

  async markPaid(id: string, companyId?: string | null) {
    await this.scope.financialEntry(id, companyId);
    return this.prisma.financialEntry.update({
      where: { id },
      data: { status: "PAID", paidDate: new Date() }
    });
  }

  async markReceived(id: string, companyId?: string | null) {
    await this.scope.financialEntry(id, companyId);
    return this.prisma.financialEntry.update({
      where: { id },
      data: { status: "RECEIVED", paidDate: new Date() }
    });
  }
}
