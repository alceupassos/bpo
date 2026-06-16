import { Injectable } from "@nestjs/common";
import { documents, scopeByCompany, type DocumentRecord } from "../../data/seed";
import { OcrService } from "./ocr.service";
import { StorageService, type UploadedFileLike } from "./storage.service";

@Injectable()
export class DocumentsService {
  private readonly documents: DocumentRecord[] = [...documents];

  constructor(
    private readonly storage: StorageService,
    private readonly ocr: OcrService
  ) {}

  list(companyId?: string | null) {
    return scopeByCompany(this.documents, companyId);
  }

  process(id: string) {
    const doc = this.documents.find((d) => d.id === id);
    if (!doc) return { id, status: "NEEDS_REVIEW" };
    return {
      id: doc.id,
      status: doc.status,
      extracted: {
        amount: doc.amount,
        date: doc.uploadedAt,
        supplier: doc.supplier,
        category: doc.category
      }
    };
  }

  review(id: string, category?: string) {
    const doc = this.documents.find((d) => d.id === id);
    if (!doc) return { id, status: "APPROVED" };
    doc.status = "APPROVED";
    if (category) doc.category = category;
    return doc;
  }

  /**
   * Upload manual: grava o arquivo, roda OCR (que cai em fallback manual quando
   * não há HF configurado) e registra o documento na fila de revisão.
   */
  async upload(file: UploadedFileLike, companyId?: string | null) {
    const { path } = this.storage.save(file);
    const extraction = await this.ocr.extract(file);
    const doc: DocumentRecord = {
      id: `doc-${this.documents.length + 1}`,
      companyId: companyId ?? "company-1",
      type: file.mimetype.includes("pdf") ? "PDF" : "Imagem",
      status: "NEEDS_REVIEW",
      supplier: extraction.supplier ?? file.originalname,
      amount: extraction.amount ?? 0,
      category: extraction.category ?? "A classificar",
      confidence: extraction.confidence,
      source: extraction.source,
      storagePath: path,
      uploadedAt: new Date().toISOString().slice(0, 10)
    };
    this.documents.unshift(doc);
    return doc;
  }
}
