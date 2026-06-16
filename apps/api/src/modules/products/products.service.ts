import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

type ProductPayload = {
  name: string;
  barcode?: string;
  unit?: string;
  price?: number;
  category?: string;
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
        ...(payload.category !== undefined ? { category: payload.category } : {})
      }
    });
  }
}
