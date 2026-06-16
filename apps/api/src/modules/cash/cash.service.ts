import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

type EntryType = "SALE" | "IN" | "OUT" | "SANGRIA" | "SUPRIMENTO";
const INFLOW = new Set(["SALE", "IN", "SUPRIMENTO"]);

function balanceOf(session: { openingAmount: number; entries: { type: string; amount: number }[] }): number {
  return session.entries.reduce(
    (acc, e) => acc + (INFLOW.has(e.type) ? e.amount : -e.amount),
    session.openingAmount
  );
}

@Injectable()
export class CashService {
  constructor(private readonly prisma: PrismaService) {}

  async current(companyId?: string | null) {
    const session = await this.prisma.cashSession.findFirst({
      where: { ...(companyId ? { companyId } : {}), status: "OPEN" },
      orderBy: { openedAt: "desc" },
      include: { entries: { orderBy: { createdAt: "desc" } } }
    });
    if (!session) return null;
    return { ...session, balance: balanceOf(session) };
  }

  open(companyId: string | null, openedBy: string, openingAmount: number) {
    return this.prisma.cashSession.create({
      data: { companyId: companyId ?? "company-1", openedBy, openingAmount, status: "OPEN" },
      include: { entries: true }
    });
  }

  async close(sessionId: string) {
    const session = await this.prisma.cashSession.findUnique({
      where: { id: sessionId },
      include: { entries: true }
    });
    const closingAmount = session ? balanceOf(session) : 0;
    return this.prisma.cashSession.update({
      where: { id: sessionId },
      data: { status: "CLOSED", closedAt: new Date(), closingAmount }
    });
  }

  addEntry(sessionId: string, type: EntryType, amount: number, description?: string, paymentMethod?: string) {
    return this.prisma.cashEntry.create({
      data: { sessionId, type, amount, description, paymentMethod }
    });
  }

  sessions(companyId?: string | null) {
    return this.prisma.cashSession.findMany({
      where: companyId ? { companyId } : {},
      orderBy: { openedAt: "desc" },
      include: { entries: true },
      take: 30
    });
  }
}
