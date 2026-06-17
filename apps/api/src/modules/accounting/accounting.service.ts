import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

function competenceRange(competence: string): { start: Date; end: Date } | null {
  const [y, m] = competence.split("-").map((n) => parseInt(n, 10));
  if (!y || !m) return null;
  return { start: new Date(y, m - 1, 1), end: new Date(y, m, 1) };
}

@Injectable()
export class AccountingService {
  constructor(private readonly prisma: PrismaService) {}

  list(companyId?: string | null) {
    return this.prisma.accountingExport.findMany({
      where: companyId ? { companyId } : {},
      orderBy: { createdAt: "desc" }
    });
  }

  /**
   * Gera um pacote de fechamento para o contador numa competência: conta as
   * notas, lançamentos e folha do período e registra o export (XML/CSV/ZIP).
   * (Mock de geração de arquivo — sem integração SEFAZ/eSocial nesta versão.)
   */
  async generate(
    competence: string,
    format: "XML" | "CSV" | "ZIP",
    companyId?: string | null
  ) {
    const scope = companyId ?? "company-1";
    const range = competenceRange(competence);
    const dateFilter = range ? { gte: range.start, lt: range.end } : undefined;

    const [notesCount, entriesCount, payrollCount] = await Promise.all([
      this.prisma.fiscalNote.count({
        where: { companyId: scope, ...(dateFilter ? { issueDate: dateFilter } : {}) }
      }),
      this.prisma.financialEntry.count({
        where: { companyId: scope, ...(dateFilter ? { issueDate: dateFilter } : {}) }
      }),
      this.prisma.payrollEntry.count({ where: { companyId: scope, competence } })
    ]);

    return this.prisma.accountingExport.create({
      data: {
        companyId: scope,
        competence,
        format,
        status: "GERADO",
        notesCount,
        entriesCount,
        payrollCount,
        storagePath: `storage/exports/${scope}-${competence}.${format.toLowerCase()}`,
        generatedAt: new Date()
      }
    });
  }

  async summary(companyId?: string | null) {
    const exports = await this.prisma.accountingExport.findMany({
      where: companyId ? { companyId } : {},
      orderBy: { createdAt: "desc" }
    });
    const last = exports[0] ?? null;
    return {
      total: exports.length,
      ultimaCompetencia: last?.competence ?? null,
      ultimoStatus: last?.status ?? "PENDENTE"
    };
  }
}
