import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { UploadedFileLike } from "./storage.service";

export interface OcrExtraction {
  source: "MANUAL" | "HF";
  amount: number | null;
  date: string | null;
  supplier: string | null;
  category: string | null;
  confidence: number;
}

/**
 * OCR plugável via Hugging Face com FALLBACK MANUAL OBRIGATÓRIO.
 *
 * Se HF_API_KEY não estiver configurada — ou se a chamada falhar/expirar —
 * retorna uma extração vazia em modo MANUAL e o documento segue para a fila de
 * revisão. O upload NUNCA é bloqueado por ausência de IA (requisito do BPO.md).
 */
@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);

  constructor(private readonly config: ConfigService) {}

  private manualFallback(): OcrExtraction {
    return { source: "MANUAL", amount: null, date: null, supplier: null, category: null, confidence: 0 };
  }

  async extract(_file: UploadedFileLike): Promise<OcrExtraction> {
    const apiKey = this.config.get<string>("HF_API_KEY");
    if (!apiKey) {
      this.logger.log("HF_API_KEY ausente — documento vai para revisao manual.");
      return this.manualFallback();
    }

    try {
      // Integração real com Hugging Face entra aqui (HF_MODEL_OCR / HF_MODEL_CLASSIFICATION).
      // Mantido como fallback enquanto a IA não está habilitada nesta entrega.
      this.logger.warn("Integracao HF nao habilitada nesta versao — usando fallback manual.");
      return this.manualFallback();
    } catch (error) {
      this.logger.error(`Falha no OCR HF, caindo em revisao manual: ${String(error)}`);
      return this.manualFallback();
    }
  }
}
