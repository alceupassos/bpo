import { Injectable } from "@nestjs/common";
import { AiVisionService } from "../ai/ai-vision.service";
import type { UploadedFileLike } from "./storage.service";

export interface OcrExtraction {
  source: "MANUAL" | "AI";
  amount: number | null;
  date: string | null;
  supplier: string | null;
  category: string | null;
  confidence: number;
}

/**
 * OCR de documentos delegando ao leitor de visao por IA, com fallback manual
 * (AiVisionService garante MANUAL quando nao ha IA / em erro).
 */
@Injectable()
export class OcrService {
  constructor(private readonly vision: AiVisionService) {}

  async extract(file: UploadedFileLike): Promise<OcrExtraction> {
    const r = await this.vision.extract(file);
    return {
      source: r.source,
      amount: r.total,
      date: r.issueDate,
      supplier: r.supplierName,
      category: null,
      confidence: r.confidence
    };
  }
}
