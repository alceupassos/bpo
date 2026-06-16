import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

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

  async suggestMatch() {
    const pending = await this.prisma.bankTransaction.count({
      where: { status: { in: ["IMPORTED", "DIVERGENT"] } }
    });
    const suggested = await this.prisma.bankTransaction.count({ where: { status: "SUGGESTED_MATCH" } });
    return { pending, suggested };
  }

  confirmMatch(transactionId: string) {
    return this.prisma.bankTransaction.update({
      where: { id: transactionId },
      data: { status: "RECONCILED" }
    });
  }
}
