import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

type SupplierPayload = {
  name: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  category?: string;
};

@Injectable()
export class SuppliersService {
  constructor(private readonly prisma: PrismaService) {}

  list(companyId?: string | null) {
    return this.prisma.supplier.findMany({
      where: companyId ? { companyId } : {},
      orderBy: { name: "asc" }
    });
  }

  create(payload: SupplierPayload, companyId?: string | null) {
    return this.prisma.supplier.create({
      data: {
        companyId: companyId ?? "company-1",
        name: payload.name,
        cnpj: payload.cnpj,
        email: payload.email,
        phone: payload.phone,
        category: payload.category
      }
    });
  }

  /** Upsert por (companyId, cnpj) ou nome — usado pelo pipeline de NF. */
  async upsertFromNote(
    companyId: string,
    data: { name?: string | null; cnpj?: string | null }
  ) {
    const name = data.name?.trim() || "Fornecedor";
    const cnpj = data.cnpj?.trim() || null;
    const existing = await this.prisma.supplier.findFirst({
      where: { companyId, ...(cnpj ? { cnpj } : { name }) }
    });
    if (existing) return existing;
    return this.prisma.supplier.create({ data: { companyId, name, cnpj: cnpj ?? undefined } });
  }
}
