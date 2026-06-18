import { Injectable } from "@nestjs/common";
import { ResourceScopeService } from "../../common/resource-scope.service";
import { PrismaService } from "../../prisma/prisma.service";
import { AiVisionService } from "../ai/ai-vision.service";
import { StorageService, type UploadedFileLike } from "../documents/storage.service";
import { ProductsService } from "../products/products.service";
import { SuppliersService } from "../suppliers/suppliers.service";

@Injectable()
export class FiscalNotesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly vision: AiVisionService,
    private readonly suppliers: SuppliersService,
    private readonly products: ProductsService,
    private readonly scope: ResourceScopeService
  ) {}

  list(companyId?: string | null) {
    return this.prisma.fiscalNote.findMany({
      where: companyId ? { companyId } : {},
      orderBy: { createdAt: "desc" },
      include: { items: true }
    });
  }

  async findOne(id: string, companyId?: string | null) {
    await this.scope.fiscalNote(id, companyId);
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

  async review(
    id: string,
    data: { supplierName?: string; total?: number; status?: "APPROVED" | "REJECTED" },
    companyId?: string | null
  ) {
    await this.scope.fiscalNote(id, companyId);
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
    const note = await this.scope.fiscalNote(id, companyId);
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
    await this.prisma.fiscalNote.update({ where: { id }, data: { status: "APPROVED", posted: true } });
    return { id, posted: true, entryId: entry.id };
  }

  /** Cadastra/atualiza produtos a partir dos itens da nota, dando ENTRADA no estoque. */
  async registerProducts(id: string, companyId?: string | null, supplierId?: string) {
    await this.scope.fiscalNote(id, companyId);
    const note = await this.prisma.fiscalNote.findUnique({ where: { id }, include: { items: true } });
    if (!note) return { id, created: 0, restocked: 0 };
    const scope = companyId ?? note.companyId;
    let created = 0;
    let restocked = 0;
    for (const item of note.items) {
      if (!item.description) continue;
      const existing = await this.prisma.product.findFirst({
        where: { companyId: scope, name: item.description }
      });
      let productId: string;
      if (existing) {
        await this.prisma.product.update({
          where: { id: existing.id },
          data: { cost: item.unitPrice, ...(supplierId ? { supplierId } : {}) }
        });
        productId = existing.id;
      } else {
        const product = await this.prisma.product.create({
          data: {
            companyId: scope,
            name: item.description,
            price: item.unitPrice,
            cost: item.unitPrice,
            sourceNoteId: note.id,
            supplierId
          }
        });
        await this.prisma.noteItem.update({ where: { id: item.id }, data: { productId: product.id } });
        productId = product.id;
        created += 1;
      }
      // Entrada de estoque pela quantidade da nota.
      await this.products.move(productId, "IN", Number(item.qty) || 0, {
        reason: "Entrada por NF",
        refType: "FISCAL_NOTE",
        refId: note.id
      });
      restocked += 1;
    }
    return { id, created, restocked };
  }

  /**
   * Pipeline completo (1 clique): cadastra/atualiza o fornecedor, dá entrada
   * dos produtos no estoque, gera a saída no caixa (se houver caixa aberto) e
   * lança o título a pagar. Reusa os services existentes.
   */
  async processFull(id: string, companyId?: string | null) {
    const note = await this.scope.fiscalNote(id, companyId);
    const scope = companyId ?? note.companyId;

    const supplier = await this.suppliers.upsertFromNote(scope, {
      name: note.supplierName,
      cnpj: note.supplierCnpj
    });

    const products = await this.registerProducts(id, scope, supplier.id);
    const posted = await this.post(id, scope);

    // Saída no caixa aberto (compra paga pelo caixa), se existir.
    const session = await this.prisma.cashSession.findFirst({
      where: { companyId: scope, status: "OPEN" },
      orderBy: { openedAt: "desc" }
    });
    let cashEntryId: string | null = null;
    if (session && Number(note.total) > 0) {
      const cashEntry = await this.prisma.cashEntry.create({
        data: {
          sessionId: session.id,
          type: "OUT",
          amount: note.total,
          description: `Compra ${supplier.name}`,
          paymentMethod: "Caixa",
          noteId: note.id
        }
      });
      cashEntryId = cashEntry.id;
    }

    return {
      id,
      processed: true,
      supplierId: supplier.id,
      products,
      entryId: posted.entryId ?? null,
      cashEntryId
    };
  }
}
