import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { AiVisionService } from "../ai/ai-vision.service";
import { StorageService, type UploadedFileLike } from "../documents/storage.service";

@Injectable()
export class FiscalNotesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly vision: AiVisionService
  ) {}

  list(companyId?: string | null) {
    return this.prisma.fiscalNote.findMany({
      where: companyId ? { companyId } : {},
      orderBy: { createdAt: "desc" },
      include: { items: true }
    });
  }

  findOne(id: string) {
    return this.prisma.fiscalNote.findUnique({ where: { id }, include: { items: true } });
  }

  /** Upload + leitura por IA (com fallback manual). Cria a nota em NEEDS_REVIEW. */
  async upload(file: UploadedFileLike, companyId?: string | null) {
    const { path } = this.storage.save(file);
    const r = await this.vision.extract(file);
    return this.prisma.fiscalNote.create({
      data: {
        companyId: companyId ?? "company-1",
        type: r.type,
        supplierName: r.supplierName,
        supplierCnpj: r.supplierCnpj,
        total: r.total ?? 0,
        issueDate: r.issueDate ? new Date(r.issueDate) : null,
        status: "NEEDS_REVIEW",
        source: r.source,
        storagePath: path,
        items: {
          create: r.items.map((it) => ({
            description: it.description,
            qty: it.qty,
            unitPrice: it.unitPrice,
            total: it.total
          }))
        }
      },
      include: { items: true }
    });
  }

  review(id: string, data: { supplierName?: string; total?: number; status?: "APPROVED" | "REJECTED" }) {
    return this.prisma.fiscalNote.update({
      where: { id },
      data: {
        ...(data.supplierName !== undefined ? { supplierName: data.supplierName } : {}),
        ...(data.total !== undefined ? { total: data.total } : {}),
        status: data.status ?? "APPROVED"
      },
      include: { items: true }
    });
  }

  /** Gera um lançamento financeiro (a pagar) a partir da nota. */
  async post(id: string, companyId?: string | null) {
    const note = await this.prisma.fiscalNote.findUnique({ where: { id } });
    if (!note) return { id, posted: false };
    const entry = await this.prisma.financialEntry.create({
      data: {
        companyId: companyId ?? note.companyId,
        type: "PAYABLE",
        status: "PENDING_APPROVAL",
        description: `Nota ${note.supplierName ?? note.type}`,
        counterpartyName: note.supplierName ?? "Fornecedor",
        category: "Material de Consumo",
        documentNumber: note.type,
        amount: note.total,
        issueDate: note.issueDate ?? new Date(),
        dueDate: note.issueDate ?? new Date()
      }
    });
    await this.prisma.fiscalNote.update({ where: { id }, data: { status: "APPROVED" } });
    return { id, posted: true, entryId: entry.id };
  }

  /** Cadastra/atualiza produtos a partir dos itens da nota. */
  async registerProducts(id: string, companyId?: string | null) {
    const note = await this.prisma.fiscalNote.findUnique({ where: { id }, include: { items: true } });
    if (!note) return { id, created: 0 };
    let created = 0;
    for (const item of note.items) {
      if (!item.description) continue;
      const existing = await this.prisma.product.findFirst({
        where: { companyId: companyId ?? note.companyId, name: item.description }
      });
      if (existing) {
        await this.prisma.product.update({ where: { id: existing.id }, data: { price: item.unitPrice } });
      } else {
        const product = await this.prisma.product.create({
          data: {
            companyId: companyId ?? note.companyId,
            name: item.description,
            price: item.unitPrice,
            sourceNoteId: note.id
          }
        });
        await this.prisma.noteItem.update({ where: { id: item.id }, data: { productId: product.id } });
        created += 1;
      }
    }
    return { id, created };
  }
}
