import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { OcrService } from "./ocr.service";
import { StorageService, type UploadedFileLike } from "./storage.service";

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly ocr: OcrService
  ) {}

  list(companyId?: string | null) {
    return this.prisma.document.findMany({
      where: companyId ? { companyId } : {},
      orderBy: { uploadedAt: "desc" }
    });
  }

  async process(id: string) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc) return { id, status: "NEEDS_REVIEW" };
    return {
      id: doc.id,
      status: doc.status,
      extracted: { amount: doc.amount, date: doc.uploadedAt, supplier: doc.supplier, category: doc.category }
    };
  }

  review(id: string, category?: string) {
    return this.prisma.document.update({
      where: { id },
      data: { status: "APPROVED", ...(category ? { category } : {}) }
    });
  }

  async upload(file: UploadedFileLike, companyId?: string | null) {
    const { path } = this.storage.save(file);
    const extraction = await this.ocr.extract(file);
    return this.prisma.document.create({
      data: {
        companyId: companyId ?? "company-1",
        type: file.mimetype.includes("pdf") ? "PDF" : "Imagem",
        status: "NEEDS_REVIEW",
        supplier: extraction.supplier ?? file.originalname,
        amount: extraction.amount ?? 0,
        category: extraction.category ?? "A classificar",
        confidence: extraction.confidence,
        source: extraction.source,
        storagePath: path
      }
    });
  }
}
