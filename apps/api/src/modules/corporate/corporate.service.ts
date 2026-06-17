import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

type DocPayload = {
  type?: "CONTRATO_SOCIAL" | "CERTIFICADO_DIGITAL" | "PROCURACAO" | "ALVARA" | "OUTRO";
  title: string;
  issueDate?: string;
  expiryDate?: string;
  notes?: string;
};

@Injectable()
export class CorporateService {
  constructor(private readonly prisma: PrismaService) {}

  listDocs(companyId?: string | null) {
    return this.prisma.corporateDoc.findMany({
      where: companyId ? { companyId } : {},
      orderBy: { createdAt: "desc" }
    });
  }

  createDoc(payload: DocPayload, companyId?: string | null) {
    return this.prisma.corporateDoc.create({
      data: {
        companyId: companyId ?? "company-1",
        type: payload.type ?? "OUTRO",
        title: payload.title,
        issueDate: payload.issueDate ? new Date(payload.issueDate) : null,
        expiryDate: payload.expiryDate ? new Date(payload.expiryDate) : null,
        notes: payload.notes
      }
    });
  }

  async company(companyId?: string | null) {
    if (companyId) return this.prisma.company.findUnique({ where: { id: companyId } });
    return this.prisma.company.findFirst();
  }

  /** Documentos vencidos ou a vencer nos próximos 60 dias. */
  async summary(companyId?: string | null) {
    const docs = await this.prisma.corporateDoc.findMany({ where: companyId ? { companyId } : {} });
    const now = Date.now();
    const soon = now + 60 * 86400000;
    const vencidos = docs.filter((d) => d.expiryDate && new Date(d.expiryDate).getTime() < now);
    const aVencer = docs.filter((d) => {
      if (!d.expiryDate) return false;
      const t = new Date(d.expiryDate).getTime();
      return t >= now && t <= soon;
    });
    return { total: docs.length, vencidos: vencidos.length, aVencer: aVencer.length };
  }
}
