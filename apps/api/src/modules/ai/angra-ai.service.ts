import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

/**
 * Cliente de IA institucional "Angra IA". Encadeia DeepSeek (chat → reasoner em
 * perguntas complexas) com fallback para o Grok. NUNCA expõe o nome do provedor
 * ou modelo — internamente apenas. Cada chamador tem fallback determinístico,
 * de modo que nenhum recurso trava se a IA estiver indisponível.
 */
@Injectable()
export class AngraAiService {
  private readonly logger = new Logger(AngraAiService.name);

  constructor(private readonly config: ConfigService) {}

  private isComplex(text: string): boolean {
    return text.length > 140 || /por que|analise|análise|explique|compare|previs|proje|enquadr/i.test(text);
  }

  async complete(prompt: string, system: string): Promise<string | null> {
    const messages = [
      { role: "system", content: system },
      { role: "user", content: prompt }
    ];
    const deepseek = this.config.get<string>("DEEPSEEK_API_KEY");
    const grok = this.config.get<string>("GROK_API_KEY") || this.config.get<string>("XAI_API_KEY");

    if (deepseek) {
      const model = this.isComplex(prompt)
        ? this.config.get<string>("DEEPSEEK_MODEL_REASONER") || "deepseek-reasoner"
        : this.config.get<string>("DEEPSEEK_MODEL_CHAT") || "deepseek-chat";
      const r = await this.call("https://api.deepseek.com/chat/completions", deepseek, model, messages);
      if (r) return r;
    }
    if (grok) {
      const model = this.config.get<string>("GROKAI_MODEL") || "grok-4.3-latest";
      const r = await this.call("https://api.x.ai/v1/chat/completions", grok, model, messages);
      if (r) return r;
    }
    return null;
  }

  async json<T = Record<string, unknown>>(prompt: string, system?: string): Promise<T | null> {
    const text = await this.complete(prompt, system ?? "Responda SOMENTE JSON valido, sem texto fora do JSON.");
    if (!text) return null;
    try {
      const start = text.indexOf("{");
      const end = text.lastIndexOf("}");
      return JSON.parse(start >= 0 && end >= 0 ? text.slice(start, end + 1) : text) as T;
    } catch {
      return null;
    }
  }

  private async call(
    url: string,
    key: string,
    model: string,
    messages: { role: string; content: string }[]
  ): Promise<string | null> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify({ model, messages, temperature: 0.2 }),
        signal: controller.signal
      });
      if (!res.ok) throw new Error(String(res.status));
      const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      return json.choices?.[0]?.message?.content ?? null;
    } catch (error) {
      this.logger.warn(`Angra IA indisponivel, usando fallback: ${String(error)}`);
      return null;
    }
  }
}
