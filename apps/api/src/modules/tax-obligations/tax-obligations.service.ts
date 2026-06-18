import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

type ObligationPayload = {
  type?: "DAS" | "DEFIS" | "OUTRO";
  competence: string;
  dueDate: string;
  amount?: number;
  baseRevenue?: number;
  notes?: string;
};

@Injectable()
export class TaxObligationsService {
  constructor(private readonly prisma: PrismaService) {}

  list(companyId?: string | null) {
    return this.prisma.taxObligation.findMany({
      where: companyId ? { companyId } : {},
      orderBy: { dueDate: "desc" }
    });
  }

  create(payload: ObligationPayload, companyId?: string | null) {
    return this.prisma.taxObligation.create({
      data: {
        companyId: companyId ?? "company-1",
        type: payload.type ?? "DAS",
        competence: payload.competence,
        dueDate: new Date(payload.dueDate),
        amount: payload.amount ?? 0,
        baseRevenue: payload.baseRevenue ?? 0,
        notes: payload.notes
      }
    });
  }

  pay(id: string) {
    return this.prisma.taxObligation.update({
      where: { id },
      data: { status: "PAGO", paidDate: new Date() }
    });
  }

  /** KPIs do módulo Fiscal: DAS do mês, em atraso e próximos vencimentos. */
  async summary(companyId?: string | null) {
    const where = companyId ? { companyId } : {};
    const all = await this.prisma.taxObligation.findMany({ where });
    const now = Date.now();
    const pendentes = all.filter((o) => o.status !== "PAGO");
    const atrasadas = pendentes.filter((o) => new Date(o.dueDate).getTime() < now);
    const dasMes = all
      .filter((o) => o.type === "DAS" && o.status !== "PAGO")
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];
    return {
      dasMes: dasMes ? Math.round(Number(dasMes.amount)) : 0,
      dasVencimento: dasMes?.dueDate ?? null,
      pendentes: pendentes.length,
      atrasadas: atrasadas.length,
      totalPendente: Math.round(pendentes.reduce((s, o) => s + Number(o.amount), 0))
    };
  }
}
