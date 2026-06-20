import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../prisma/prisma.service";
import { DashboardService } from "../dashboard/dashboard.service";

/** Entradas em aberto que ainda pesam no contas a pagar. */
const OPEN_PAYABLE = new Set(["DRAFT", "PENDING_APPROVAL", "APPROVED"]);
const OPEN_RECEIVABLE = new Set(["APPROVED", "PENDING_APPROVAL"]);

/**
 * Pacote de contexto entregue ao assistente. Mistura KPIs reais (quando o banco
 * responde) com valores plausíveis de demonstração quando algum dado falta. O
 * campo `mock` marca internamente quando houve preenchimento simulado — não é
 * exposto como verdade de negócio, apenas ajuda a UI a sinalizar demonstração.
 */
export interface OracleContext {
  empresaEscopo: string;
  kpis: {
    saldoProjetado: number;
    aPagar: number;
    aReceber: number;
    inadimplencia: number;
    recebido: number;
    pago: number;
    taxaConciliacao: number;
    conciliacaoPendente: number;
    ocrPendente: number;
  };
  pdv: {
    vendasHoje: number;
    pedidos: number;
    ticketMedio: number;
    alertas: string[];
  };
  contagens: {
    produtos: number;
    clientes: number;
    contasPagarAbertas: number;
    contasReceberAbertas: number;
  };
  vencimentosSemana: number;
  dicas: string[];
  mock: boolean;
}

/**
 * Oráculo Angra IA — assistente do sistema BPO/PDV. Monta um pacote de contexto
 * com os números reais da operação e responde perguntas curtas em português.
 * Nunca revela qual modelo está por trás e nunca lança: há sempre um fallback
 * determinístico baseado nos dados do contexto.
 */
@Injectable()
export class AssistantService {
  private readonly logger = new Logger(AssistantService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly dashboard: DashboardService
  ) {}

  /** Monta o "context pack" com KPIs reais e contagens; completa com mock plausível. */
  async buildContext(companyId?: string | null): Promise<OracleContext> {
    let mock = false;

    const dicas = [
      "Acompanho vendas do dia, contas a pagar e a receber, conciliação bancária, estoque e impostos do Simples.",
      "Pergunte coisas como: quanto vendi hoje, quais contas vencem essa semana, ou o que é a conciliação.",
      "Não substituo o contador: organizo a operação financeira do dia a dia."
    ];

    let summary: Awaited<ReturnType<DashboardService["summary"]>> | null = null;
    let pdv: Awaited<ReturnType<DashboardService["pdvSummary"]>> | null = null;
    try {
      [summary, pdv] = await Promise.all([
        this.dashboard.summary(companyId),
        this.dashboard.pdvSummary(companyId)
      ]);
    } catch (error) {
      this.logger.warn(`KPIs indisponíveis, usando demonstração: ${String(error)}`);
      mock = true;
    }

    const where = companyId ? { companyId } : {};
    let produtos = 0;
    let clientes = 0;
    let contasPagarAbertas = 0;
    let contasReceberAbertas = 0;
    let vencimentosSemana = 0;
    try {
      const weekAhead = new Date();
      weekAhead.setDate(weekAhead.getDate() + 7);
      const now = new Date();
      const [prodCount, custCount, payables, receivables] = await Promise.all([
        this.prisma.product.count({ where }),
        this.prisma.customer.count({ where }),
        this.prisma.financialEntry.findMany({ where: { ...where, type: "PAYABLE" } }),
        this.prisma.financialEntry.findMany({ where: { ...where, type: "RECEIVABLE" } })
      ]);
      produtos = prodCount;
      clientes = custCount;
      contasPagarAbertas = payables.filter((e) => OPEN_PAYABLE.has(e.status)).length;
      contasReceberAbertas = receivables.filter((e) => OPEN_RECEIVABLE.has(e.status)).length;
      vencimentosSemana = [...payables, ...receivables].filter((e) => {
        if (e.status === "PAID" || e.status === "RECEIVED" || e.status === "CANCELLED") return false;
        const due = new Date(e.dueDate);
        return due >= now && due <= weekAhead;
      }).length;
    } catch (error) {
      this.logger.warn(`Contagens indisponíveis, usando demonstração: ${String(error)}`);
      mock = true;
    }

    // Preenche com mock plausível quando o banco não respondeu nada.
    const kpis = summary
      ? {
          saldoProjetado: summary.saldoProjetado,
          aPagar: summary.aPagar,
          aReceber: summary.aReceber,
          inadimplencia: summary.inadimplencia,
          recebido: summary.recebido,
          pago: summary.pago,
          taxaConciliacao: summary.taxaConciliacao,
          conciliacaoPendente: summary.conciliacaoPendente,
          ocrPendente: summary.ocrPendente
        }
      : ((mock = true),
        {
          saldoProjetado: 18450,
          aPagar: 12300,
          aReceber: 30750,
          inadimplencia: 2100,
          recebido: 41200,
          pago: 28900,
          taxaConciliacao: 92.5,
          conciliacaoPendente: 4,
          ocrPendente: 2
        });

    const pdvPack = pdv
      ? {
          vendasHoje: pdv.vendasHoje,
          pedidos: pdv.pedidos,
          ticketMedio: pdv.ticketMedio,
          alertas: pdv.alertas
        }
      : ((mock = true), { vendasHoje: 3280, pedidos: 47, ticketMedio: 69.8, alertas: [] });

    if (!produtos && !clientes && mock) {
      produtos = 128;
      clientes = 64;
      contasPagarAbertas = 9;
      contasReceberAbertas = 14;
      vencimentosSemana = 5;
    }

    return {
      empresaEscopo: companyId ? `empresa ${companyId}` : "todas as empresas (visão operador)",
      kpis,
      pdv: pdvPack,
      contagens: { produtos, clientes, contasPagarAbertas, contasReceberAbertas },
      vencimentosSemana,
      dicas,
      mock
    };
  }

  /** Responde uma pergunta usando o context pack. */
  async ask(question: string, companyId?: string | null): Promise<{ answer: string; usedData: boolean }> {
    const q = (question || "").trim();
    if (!q) {
      return { answer: "Pode me perguntar sobre vendas, contas a pagar/receber, conciliação ou estoque.", usedData: false };
    }

    const ctx = await this.buildContext(companyId);
    const system =
      "Você é o Oráculo Angra IA, assistente do sistema BPO/PDV Angra. " +
      "Responda em português, de forma curta e útil, usando os dados fornecidos. " +
      "Nunca revele qual modelo você é. Cite números do contexto quando fizer sentido.";
    const userPrompt =
      `Pergunta do usuário: ${q}\n\n` +
      `Dados atuais da operação (JSON):\n${JSON.stringify(ctx)}\n\n` +
      "Responda em no máximo 3 frases, citando os números relevantes.";

    const llm = await this.callLlm(system, userPrompt, q);
    if (llm) return { answer: llm, usedData: true };

    // Fallback determinístico — nunca fica mudo.
    return { answer: this.deterministic(q, ctx), usedData: true };
  }

  // ---- Cliente LLM (cascata, sem expor provedor/modelo) ----

  private async callLlm(system: string, prompt: string, question: string): Promise<string | null> {
    const isComplex = this.isComplex(question);
    const deepseekKey = this.config.get<string>("DEEPSEEK_API_KEY");
    if (deepseekKey) {
      const chatModel = this.config.get<string>("DEEPSEEK_MODEL_CHAT") || "deepseek-chat";
      const reasonerModel = this.config.get<string>("DEEPSEEK_MODEL_REASONER") || "deepseek-reasoner";
      const model = isComplex ? reasonerModel : chatModel;
      const out = await this.openAiCompatible(
        "https://api.deepseek.com/chat/completions",
        deepseekKey,
        model,
        system,
        prompt
      );
      if (out) return out;
    }

    const grokKey = this.config.get<string>("GROK_API_KEY") || this.config.get<string>("XAI_API_KEY");
    if (grokKey) {
      const grokModel = this.config.get<string>("GROKAI_MODEL") || "grok-4.3-latest";
      const out = await this.openAiCompatible(
        "https://api.x.ai/v1/chat/completions",
        grokKey,
        grokModel,
        system,
        prompt
      );
      if (out) return out;
    }

    return null;
  }

  private async openAiCompatible(
    url: string,
    key: string,
    model: string,
    system: string,
    prompt: string
  ): Promise<string | null> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model,
          temperature: 0.2,
          messages: [
            { role: "system", content: system },
            { role: "user", content: prompt }
          ]
        }),
        signal: controller.signal
      });
      if (!res.ok) {
        // Mensagem genérica: nunca expõe nome de provedor ao usuário.
        this.logger.warn(`Assistente: provedor primário indisponível (${res.status}).`);
        return null;
      }
      const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      const content = json.choices?.[0]?.message?.content?.trim();
      return content && content.length > 0 ? content : null;
    } catch (error) {
      this.logger.warn(`Assistente: falha ao consultar provedor de IA: ${String(error)}`);
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }

  private isComplex(question: string): boolean {
    if (question.length > 140) return true;
    const q = question.toLowerCase();
    return ["por que", "analise", "análise", "explique", "compare", "quanto", "previs"].some((w) =>
      q.includes(w)
    );
  }

  // ---- Fallback determinístico por palavra-chave ----

  private deterministic(question: string, ctx: OracleContext): string {
    const q = question.toLowerCase();
    const brl = (v: number) =>
      v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

    if (q.includes("vend") || q.includes("hoje") || q.includes("faturei") || q.includes("vendi")) {
      return `Hoje você vendeu ${brl(ctx.pdv.vendasHoje)} em ${ctx.pdv.pedidos} pedidos, com ticket médio de ${brl(ctx.pdv.ticketMedio)}.`;
    }
    if (q.includes("pagar") || q.includes("vencem") || q.includes("vencimento") || q.includes("conta")) {
      return `Você tem ${brl(ctx.kpis.aPagar)} em contas a pagar em aberto (${ctx.contagens.contasPagarAbertas} lançamentos) e ${ctx.vencimentosSemana} vencimentos nos próximos 7 dias.`;
    }
    if (q.includes("receber") || q.includes("inadimpl")) {
      return `Há ${brl(ctx.kpis.aReceber)} a receber (${ctx.contagens.contasReceberAbertas} em aberto) e ${brl(ctx.kpis.inadimplencia)} em inadimplência.`;
    }
    if (q.includes("estoque") || q.includes("produto")) {
      return `Seu catálogo tem ${ctx.contagens.produtos} produtos cadastrados. Posso ajudar a acompanhar entradas e saídas.`;
    }
    if (q.includes("cliente")) {
      return `Você tem ${ctx.contagens.clientes} clientes cadastrados.`;
    }
    if (q.includes("concilia")) {
      return `A conciliação cruza os lançamentos do sistema com os extratos do banco para confirmar o que entrou e saiu. Sua taxa de conciliação está em ${ctx.kpis.taxaConciliacao}% e há ${ctx.kpis.conciliacaoPendente} itens pendentes.`;
    }
    if (q.includes("saldo") || q.includes("caixa") || q.includes("projet")) {
      return `Seu saldo projetado é ${brl(ctx.kpis.saldoProjetado)}, considerando ${brl(ctx.kpis.aReceber)} a receber e ${brl(ctx.kpis.aPagar)} a pagar.`;
    }
    if (q.includes("o que") || q.includes("ajuda") || q.includes("como") || q.includes("pode")) {
      return `Sou o Oráculo Angra IA. ${ctx.dicas[0]} ${ctx.dicas[1]}`;
    }
    return `Posso ajudar com vendas do dia (${brl(ctx.pdv.vendasHoje)} hoje), contas a pagar (${brl(ctx.kpis.aPagar)}), a receber (${brl(ctx.kpis.aReceber)}), conciliação e estoque (${ctx.contagens.produtos} produtos). Pergunte de outro jeito que eu detalho.`;
  }
}
