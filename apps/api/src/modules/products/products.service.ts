import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { AiVisionService } from "../ai/ai-vision.service";
import type { UploadedFileLike } from "../documents/storage.service";

const COMPANY_FALLBACK = "company-1";

type ProductPayload = {
  name: string;
  barcode?: string;
  unit?: string;
  price?: number;
  cost?: number;
  category?: string;
  minStock?: number;
  supplierId?: string;
  imageUrl?: string;
};

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly vision: AiVisionService
  ) {}

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
    return products.filter((p) => Number(p.stockQty) <= Number(p.minStock));
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
        category: payload.category,
        imageUrl: payload.imageUrl
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
        ...(payload.category !== undefined ? { category: payload.category } : {}),
        ...(payload.imageUrl !== undefined ? { imageUrl: payload.imageUrl } : {})
      }
    });
  }

  /**
   * Busca uma foto representativa do produto na internet (uso interno).
   * Tenta o Openverse (imagens livres, sem chave); cai para o LoremFlickr por
   * palavra-chave. Guarda a URL em imageUrl. Nunca lança — devolve {ok:false}.
   */
  async fetchPhoto(productId: string) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) return { ok: false, reason: "produto nao encontrado" };
    const url = await this.lookupPhoto(product.name);
    const updated = await this.prisma.product.update({
      where: { id: productId },
      data: { imageUrl: url }
    });
    return { ok: true, imageUrl: updated.imageUrl };
  }

  /** Preenche fotos de todos os produtos sem imagem (catálogo pequeno). */
  async autoPhotos(companyId?: string | null) {
    const products = await this.prisma.product.findMany({
      where: { ...(companyId ? { companyId } : {}), imageUrl: null }
    });
    let filled = 0;
    for (const p of products) {
      const url = await this.lookupPhoto(p.name);
      await this.prisma.product.update({ where: { id: p.id }, data: { imageUrl: url } });
      filled += 1;
    }
    return { ok: true, filled, total: products.length };
  }

  private async lookupPhoto(name: string): Promise<string> {
    const query = encodeURIComponent(name.trim());
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(
        `https://api.openverse.org/v1/images/?q=${query}&page_size=1&mature=false`,
        { headers: { "User-Agent": "bpo-angra/1.0 (uso interno)" }, signal: controller.signal }
      );
      clearTimeout(timeout);
      if (res.ok) {
        const json = (await res.json()) as { results?: { url?: string }[] };
        const found = json.results?.[0]?.url;
        if (found) return found;
      }
    } catch {
      /* cai no fallback abaixo */
    }
    // Fallback determinístico por palavra-chave (sempre responde uma imagem).
    return `https://loremflickr.com/640/480/${query}`;
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
    const nextQty = type === "ADJUST" ? qty : Number(product.stockQty) + delta;

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

  /**
   * Importa produtos a partir da foto de uma nota fiscal via OCR (AiVisionService).
   * Cada item vira/atualiza um produto no catálogo e dá entrada de estoque (IN).
   * Fallback manual embutido no AiVisionService: sem IA, devolve needsReview.
   */
  async importFromOcr(file: UploadedFileLike, companyId?: string | null) {
    const company = companyId ?? COMPANY_FALLBACK;
    const r = await this.vision.extract(file);
    const products: unknown[] = [];

    for (const item of r.items) {
      if (!item.description) continue;
      const existing = await this.prisma.product.findFirst({
        where: { companyId: company, name: { equals: item.description, mode: "insensitive" } }
      });

      const qty = item.qty > 0 ? item.qty : 0;
      const product = existing
        ? await this.prisma.product.update({
            where: { id: existing.id },
            data: {
              stockQty: { increment: qty },
              cost: item.unitPrice || Number(existing.cost)
            }
          })
        : await this.prisma.product.create({
            data: {
              companyId: company,
              name: item.description,
              unit: "UN",
              price: item.unitPrice ?? 0,
              cost: item.unitPrice ?? 0,
              stockQty: qty
            }
          });

      if (qty > 0) {
        await this.prisma.stockMovement.create({
          data: {
            companyId: company,
            productId: (product as { id: string }).id,
            type: "IN",
            qty,
            reason: "Entrada por OCR de nota",
            refType: "OCR"
          }
        });
      }
      products.push(product);
    }

    return {
      imported: products.length,
      source: r.source,
      needsReview: r.source === "MANUAL",
      supplier: r.supplierName,
      extracted: r,
      products
    };
  }
}
