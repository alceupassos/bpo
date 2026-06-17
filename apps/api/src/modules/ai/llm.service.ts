import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

/**
 * Cliente de texto para os recursos de IA (categorização, copiloto, resumos).
 *
 * Open-source por padrão: aponta para um Ollama local (llama3.1/qwen2.5),
 * configurável via OLLAMA_URL / OLLAMA_MODEL. Se houver chave OpenAI e
 * AI_TEXT_PROVIDER=openai, usa a nuvem como turbo. Sem nada disponível ou em
 * caso de erro, retorna null — e cada chamador SEMPRE tem um fallback
 * determinístico (heurística/regra), de modo que nenhum recurso trava.
 */
@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);

  constructor(private readonly config: ConfigService) {}

  private provider(): "openai" | "ollama" {
    const explicit = (this.config.get<string>("AI_TEXT_PROVIDER") || "").toLowerCase();
    if (explicit === "openai" && this.config.get<string>("OPENAI_API_KEY")) return "openai";
    if (explicit === "ollama") return "ollama";
    if (this.config.get<string>("OPENAI_API_KEY")) return "openai";
    return "ollama";
  }

  /** Retorna texto livre do modelo, ou null se indisponível/erro. */
  async complete(prompt: string, system?: string): Promise<string | null> {
    try {
      return this.provider() === "openai"
        ? await this.openai(prompt, system)
        : await this.ollama(prompt, system);
    } catch (error) {
      this.logger.warn(`LLM indisponível, usando fallback: ${String(error)}`);
      return null;
    }
  }

  /** Conveniência: pede JSON e tenta parsear; null se falhar. */
  async json<T = Record<string, unknown>>(prompt: string, system?: string): Promise<T | null> {
    const text = await this.complete(prompt, system ?? "Responda SOMENTE JSON valido.");
    if (!text) return null;
    try {
      const start = text.indexOf("{");
      const end = text.lastIndexOf("}");
      const slice = start >= 0 && end >= 0 ? text.slice(start, end + 1) : text;
      return JSON.parse(slice) as T;
    } catch {
      return null;
    }
  }

  private async openai(prompt: string, system?: string): Promise<string | null> {
    const key = this.config.get<string>("OPENAI_API_KEY");
    const model = this.config.get<string>("OPENAI_TEXT_MODEL") || "gpt-4o-mini";
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages: [
          ...(system ? [{ role: "system", content: system }] : []),
          { role: "user", content: prompt }
        ]
      })
    });
    if (!res.ok) throw new Error(`openai ${res.status}`);
    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    return json.choices?.[0]?.message?.content ?? null;
  }

  private async ollama(prompt: string, system?: string): Promise<string | null> {
    const url = this.config.get<string>("OLLAMA_URL") || "http://127.0.0.1:11434";
    const model = this.config.get<string>("OLLAMA_MODEL") || "llama3.1";
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const res = await fetch(`${url}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          prompt: system ? `${system}\n\n${prompt}` : prompt,
          stream: false,
          options: { temperature: 0.2 }
        }),
        signal: controller.signal
      });
      if (!res.ok) throw new Error(`ollama ${res.status}`);
      const json = (await res.json()) as { response?: string };
      return json.response ?? null;
    } finally {
      clearTimeout(timeout);
    }
  }
}
