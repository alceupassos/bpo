import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export interface VisionItem {
  description: string;
  qty: number;
  unitPrice: number;
  total: number;
}

export interface VisionResult {
  source: "MANUAL" | "AI";
  type: "NFE" | "NFCE" | "CUPOM" | "BOLETO" | "OUTRO";
  supplierName: string | null;
  supplierCnpj: string | null;
  issueDate: string | null; // ISO yyyy-mm-dd
  total: number | null;
  items: VisionItem[];
  confidence: number;
  rawText?: string | null;
}

const PROMPT = `Voce extrai dados de documentos fiscais brasileiros (cupom fiscal de padaria/mercado,
nota de posto de gasolina, NF-e, NFC-e ou boleto). Responda SOMENTE um objeto JSON valido com as chaves:
{"type": "NFE|NFCE|CUPOM|BOLETO|OUTRO", "supplierName": string|null, "supplierCnpj": string|null,
"issueDate": "yyyy-mm-dd"|null, "total": number|null,
"items": [{"description": string, "qty": number, "unitPrice": number, "total": number}]}.
Use ponto decimal. Se nao houver itens, retorne items como lista vazia. Nao escreva texto fora do JSON.`;

/**
 * Leitor de nota fiscal por IA de visao (LLM). Provider configuravel via
 * AI_VISION_PROVIDER (openai|gemini); auto-detecta pela chave disponivel.
 * FALLBACK MANUAL OBRIGATORIO: sem chave / erro / timeout / arquivo nao-imagem
 * -> retorna source=MANUAL e a nota segue para revisao (nunca trava).
 */
@Injectable()
export class AiVisionService {
  private readonly logger = new Logger(AiVisionService.name);

  constructor(private readonly config: ConfigService) {}

  private manual(reason: string): VisionResult {
    this.logger.log(`Vision em fallback manual: ${reason}`);
    return {
      source: "MANUAL",
      type: "OUTRO",
      supplierName: null,
      supplierCnpj: null,
      issueDate: null,
      total: null,
      items: [],
      confidence: 0
    };
  }

  private resolveProvider(): "openai" | "gemini" | null {
    const explicit = (this.config.get<string>("AI_VISION_PROVIDER") || "").toLowerCase();
    const openaiKey = this.config.get<string>("OPENAI_API_KEY");
    const geminiKey = this.config.get<string>("GEMINI_API_KEY");
    if (explicit === "openai" && openaiKey) return "openai";
    if (explicit === "gemini" && geminiKey) return "gemini";
    if (openaiKey) return "openai";
    if (geminiKey) return "gemini";
    return null;
  }

  async extract(file: { buffer: Buffer; mimetype: string; originalname: string }): Promise<VisionResult> {
    if (!file?.mimetype?.startsWith("image/")) {
      return this.manual("arquivo nao e imagem (PDF/sem suporte de visao nesta versao)");
    }
    const provider = this.resolveProvider();
    if (!provider) return this.manual("nenhuma chave de IA configurada");

    const dataUrl = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
    try {
      const parsed = provider === "openai" ? await this.openai(dataUrl) : await this.gemini(file);
      if (!parsed) return this.manual("resposta vazia da IA");
      return {
        source: "AI",
        type: (parsed.type as VisionResult["type"]) ?? "OUTRO",
        supplierName: parsed.supplierName ? String(parsed.supplierName) : null,
        supplierCnpj: parsed.supplierCnpj ? String(parsed.supplierCnpj) : null,
        issueDate: parsed.issueDate ? String(parsed.issueDate) : null,
        total: typeof parsed.total === "number" ? parsed.total : null,
        items: Array.isArray(parsed.items)
          ? parsed.items.map((it: Record<string, unknown>) => ({
              description: String(it.description ?? ""),
              qty: Number(it.qty ?? 1),
              unitPrice: Number(it.unitPrice ?? 0),
              total: Number(it.total ?? 0)
            }))
          : [],
        confidence: 88
      };
    } catch (error) {
      return this.manual(`erro na IA: ${String(error)}`);
    }
  }

  private async openai(dataUrl: string): Promise<Record<string, unknown> | null> {
    const key = this.config.get<string>("OPENAI_API_KEY");
    const model = this.config.get<string>("OPENAI_VISION_MODEL") || "gpt-4o-mini";
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model,
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "Responda SOMENTE JSON valido." },
          {
            role: "user",
            content: [
              { type: "text", text: PROMPT },
              { type: "image_url", image_url: { url: dataUrl } }
            ]
          }
        ]
      })
    });
    if (!res.ok) throw new Error(`openai ${res.status}`);
    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const content = json.choices?.[0]?.message?.content;
    return content ? JSON.parse(content) : null;
  }

  private async gemini(file: { buffer: Buffer; mimetype: string }): Promise<Record<string, unknown> | null> {
    const key = this.config.get<string>("GEMINI_API_KEY");
    const model = this.config.get<string>("GEMINI_VISION_MODEL") || "gemini-1.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: PROMPT },
              { inline_data: { mime_type: file.mimetype, data: file.buffer.toString("base64") } }
            ]
          }
        ],
        generationConfig: { responseMimeType: "application/json", temperature: 0 }
      })
    });
    if (!res.ok) throw new Error(`gemini ${res.status}`);
    const json = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const content = json.candidates?.[0]?.content?.parts?.[0]?.text;
    return content ? JSON.parse(content) : null;
  }
}
