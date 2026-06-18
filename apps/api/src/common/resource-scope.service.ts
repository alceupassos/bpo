import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ResourceScopeService {
  constructor(private readonly prisma: PrismaService) {}

  /** Operador/admin (companyId null) acessa qualquer tenant; cliente só o próprio. */
  private assertScope(companyId: string | null | undefined, resourceCompanyId: string): void {
    if (companyId == null) return;
    if (resourceCompanyId !== companyId) {
      throw new NotFoundException("Recurso nao encontrado");
    }
  }

  async approval(id: string, companyId?: string | null) {
    const row = await this.prisma.approvalRequest.findUnique({ where: { id } });
    if (!row) throw new NotFoundException("Recurso nao encontrado");
    this.assertScope(companyId, row.companyId);
    return row;
  }

  async financialEntry(id: string, companyId?: string | null) {
    const row = await this.prisma.financialEntry.findUnique({ where: { id } });
    if (!row) throw new NotFoundException("Recurso nao encontrado");
    this.assertScope(companyId, row.companyId);
    return row;
  }

  async fiscalNote(id: string, companyId?: string | null) {
    const row = await this.prisma.fiscalNote.findUnique({ where: { id } });
    if (!row) throw new NotFoundException("Recurso nao encontrado");
    this.assertScope(companyId, row.companyId);
    return row;
  }

  async cashSession(id: string, companyId?: string | null) {
    const row = await this.prisma.cashSession.findUnique({ where: { id } });
    if (!row) throw new NotFoundException("Recurso nao encontrado");
    this.assertScope(companyId, row.companyId);
    return row;
  }
}