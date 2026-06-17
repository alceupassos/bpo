import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

type ProductPayload = {
  name: string;
  barcode?: string;
  unit?: string;
  price?: number;
  cost?: number;
  category?: string;
  minStock?: number;
  supplierId?: string;
};

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  list(companyId?: string | null) {
    return this.prisma.product.findMany({
      where: companyId ? { companyId } : {},
      orderBy: { name: "asc" }
    });
  }

  /** Produtos em ruptura ou abaixo do estoque mínimo. */
  async lowStock(companyId?: string | null) {
    const products = await this.prisma.product.findMany({
      where: companyId ? { companyId } : {}
    });
    return products.filter((p) => p.stockQty <= p.minStock);
  }

  findOne(id: string) {
    return this.prisma.product.findUnique({ where: { id } });
  }

  create(payload: ProductPayload, companyId?: string | null) {
    return this.prisma.product.create({
      data: {
        companyId: companyId ?? "company-1",
        name: payload.name,
        barcode: payload.barcode,
        unit: payload.unit ?? "UN",
        price: payload.price ?? 0,
        cost: payload.cost ?? 0,
        minStock: payload.minStock ?? 0,
        supplierId: payload.supplierId,
        category: payload.category
      }
    });
  }

  update(id: string, payload: Partial<ProductPayload>) {
    return this.prisma.product.update({
      where: { id },
      data: {
        ...(payload.name !== undefined ? { name: payload.name } : {}),
        ...(payload.barcode !== undefined ? { barcode: payload.barcode } : {}),
        ...(payload.unit !== undefined ? { unit: payload.unit } : {}),
        ...(payload.price !== undefined ? { price: payload.price } : {}),
        ...(payload.cost !== undefined ? { cost: payload.cost } : {}),
        ...(payload.minStock !== undefined ? { minStock: payload.minStock } : {}),
        ...(payload.category !== undefined ? { category: payload.category } : {})
      }
    });
  }

  /**
   * Aplica um movimento de estoque (IN/OUT/ADJUST) e atualiza o saldo do
   * produto, registrando o histórico em StockMovement.
   */
  async move(
    productId: string,
    type: "IN" | "OUT" | "ADJUST",
    qty: number,
    opts: { reason?: string; refType?: string; refId?: string } = {}
  ) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) return { ok: false, reason: "produto nao encontrado" };

    const delta = type === "OUT" ? -Math.abs(qty) : type === "IN" ? Math.abs(qty) : qty;
    const nextQty = type === "ADJUST" ? qty : product.stockQty + delta;

    await this.prisma.stockMovement.create({
      data: {
        companyId: product.companyId,
        productId,
        type,
        qty,
        reason: opts.reason,
        refType: opts.refType,
        refId: opts.refId
      }
    });
    const updated = await this.prisma.product.update({
      where: { id: productId },
      data: { stockQty: nextQty }
    });
    return { ok: true, product: updated };
  }

  movements(companyId?: string | null) {
    return this.prisma.stockMovement.findMany({
      where: companyId ? { companyId } : {},
      orderBy: { createdAt: "desc" },
      take: 100
    });
  }
}
