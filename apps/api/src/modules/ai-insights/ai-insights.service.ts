import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { LlmService } from "../ai/llm.service";

// Regras open-source de categorização por palavra-chave (fallback determinístico).
const CATEGORY_RULES: { match: RegExp; category: string }[] = [
  { match: /aluguel|imovel|imobiliaria|condominio/i, category: "Aluguel" },
  { match: /energia|luz|cemig|cpfl|eletric/i, category: "Utilidades e Energia" },
  { match: /agua|saneamento|esgoto/i, category: "Utilidades e Energia" },
  { match: /contabil|contador|escritorio contabil/i, category: "Servicos de Terceiros" },
  { match: /internet|telecom|telefone|celular|vivo|claro|tim/i, category: "Infraestrutura" },
  { match: /gasolina|combustivel|posto|diesel|etanol/i, category: "Combustivel" },
  { match: /cafe|padaria|lanche|restaurante|refeicao|mercado/i, category: "Alimentacao" },
  { match: /imposto|das|darf|tributo|simples/i, category: "Impostos" },
  { match: /salario|folha|funcionario|fgts|inss|rescis/i, category: "Folha" },
  { match: /marketing|anuncio|ads|publicidade|trafego/i, category: "Marketing" },
  { match: /software|cloud|saas|assinatura|sistema/i, category: "Infraestrutura" }
];

function ruleCategory(description: string): { category: string; confidence: number } {
  for (const rule of CATEGORY_RULES) {
    if (rule.match.test(description)) return { category: rule.category, confidence: 0.8 };
  }
  return { category: "Outros", confidence: 0.3 };
}

// Regressão linear simples (mínimos quadrados) — open-source, sem dependências.
function linearForecast(values: number[], steps: number): number[] {
  const n = values.length;
  if (n < 2) return new Array(steps).fill(values[n - 1] ?? 0);
  const xs = values.map((_, i) => i);
  const meanX = xs.reduce((s, x) => s + x, 0) / n;
  const meanY = values.reduce((s, y) => s + y, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - meanX) * (values[i] - meanY);
    den += (xs[i] - meanX) ** 2;
  }
  const slope = den === 0 ? 0 : num / den;
  const intercept = meanY - slope * meanX;
  return Array.from({ length: steps }, (_, k) => Math.round(intercept + slope * (n + k)));
}

@Injectable()
export class AiInsightsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly llm: LlmService
  ) {}

  /** (Feature 5) Categorização automática de lançamentos. */
  async categorize(description: string) {
    const base = ruleCategory(description);
    // Turbo opcional via LLM (open-source/cloud); se indisponível, usa a regra.
    const ai = await this.llm.json<{ category: string }>(
      `Classifique a despesa abaixo em UMA categoria contábil curta (ex.: Aluguel, Energia, Folha, Impostos, Marketing, Combustivel, Alimentacao, Infraestrutura, Servicos de Terceiros, Outros). Descricao: "${description}". Responda {"category": "..."}.`
    );
    if (ai?.category) return { category: ai.category, confidence: 0.9, source: "AI" };
    return { ...base, source: "RULE" };
  }

  /** (Feature 6) Copiloto financeiro conversacional sobre os dados da empresa. */
  async copilot(question: string, companyId?: string | null) {
    const where = companyId ? { companyId } : {};
    const entries = await this.prisma.financialEntry.findMany({ where });
    const now = Date.now();
    const open = (t: string, statuses: string[]) =>
      entries.filter((e) => e.type === t && statuses.includes(e.status));
    const aPagar = open("PAYABLE", ["DRAFT", "PENDING_APPROVAL", "APPROVED"]).reduce((s, e) => s + e.amount, 0);
    const aReceber = open("RECEIVABLE", ["APPROVED", "PENDING_APPROVAL"]).reduce((s, e) => s + e.amount, 0);
    const venceSemana = entries
      .filter((e) => e.type === "PAYABLE" && e.status !== "PAID" && e.status !== "CANCELLED")
      .filter((e) => {
        const due = new Date(e.dueDate).getTime();
        return due >= now && due <= now + 7 * 86400000;
      })
      .reduce((s, e) => s + e.amount, 0);

    const context = `Contexto financeiro (R$): a pagar em aberto=${Math.round(aPagar)}, a receber em aberto=${Math.round(aReceber)}, contas que vencem nos proximos 7 dias=${Math.round(venceSemana)}.`;
    const answer = await this.llm.complete(
      `${context}\n\nPergunta do empresario: ${question}\nResponda em portugues, curto e objetivo, usando os numeros do contexto.`,
      "Voce e um copiloto financeiro de BPO para pequenas empresas do Simples Nacional."
    );

    return {
      answer:
        answer ??
        `Voce tem R$ ${Math.round(aReceber)} a receber e R$ ${Math.round(aPagar)} a pagar em aberto. Nos proximos 7 dias vencem R$ ${Math.round(venceSemana)} em contas.`,
      grounded: { aPagar: Math.round(aPagar), aReceber: Math.round(aReceber), venceSemana: Math.round(venceSemana) },
      source: answer ? "AI" : "FALLBACK"
    };
  }

  /** (Feature 7) Previsão de fluxo de caixa para os próximos 3 meses. */
  async forecast(companyId?: string | null) {
    const entries = await this.prisma.financialEntry.findMany({ where: companyId ? { companyId } : {} });
    const labels = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const anchor = new Date();
    const months: { key: string; label: string }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(anchor.getFullYear(), anchor.getMonth() - i, 1);
      months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: labels[d.getMonth()] });
    }
    const net = months.map(() => 0);
    for (const e of entries) {
      const due = new Date(e.dueDate);
      const idx = months.findIndex((m) => m.key === `${due.getFullYear()}-${due.getMonth()}`);
      if (idx === -1) continue;
      net[idx] += e.type === "RECEIVABLE" ? e.amount : -e.amount;
    }
    const forecast = linearForecast(net, 3);
    const futureLabels: string[] = [];
    for (let k = 1; k <= 3; k++) {
      const d = new Date(anchor.getFullYear(), anchor.getMonth() + k, 1);
      futureLabels.push(labels[d.getMonth()]);
    }
    return {
      history: { categories: months.map((m) => m.label), net: net.map((v) => Math.round(v)) },
      forecast: { categories: futureLabels, net: forecast },
      method: "regressao-linear"
    };
  }

  /** (Feature 8) Detecção de anomalias: notas duplicadas e valores fora do padrão. */
  async anomalies(companyId?: string | null) {
    const where = companyId ? { companyId } : {};
    const [notes, payables] = await Promise.all([
      this.prisma.fiscalNote.findMany({ where }),
      this.prisma.financialEntry.findMany({ where: { ...where, type: "PAYABLE" } })
    ]);

    const findings: { type: string; severity: "alta" | "media" | "baixa"; description: string }[] = [];

    // Notas duplicadas (mesmo fornecedor + total).
    const seen = new Map<string, number>();
    for (const n of notes) {
      const key = `${n.supplierName ?? "?"}|${n.total}`;
      seen.set(key, (seen.get(key) ?? 0) + 1);
    }
    for (const [key, count] of seen) {
      if (count > 1) {
        const [supplier, total] = key.split("|");
        findings.push({
          type: "NOTA_DUPLICADA",
          severity: "alta",
          description: `Possivel nota duplicada: ${supplier} no valor de R$ ${total} (${count}x).`
        });
      }
    }

    // Outliers de pagamento (z-score > 2).
    if (payables.length >= 4) {
      const amounts = payables.map((p) => p.amount);
      const mean = amounts.reduce((s, a) => s + a, 0) / amounts.length;
      const std = Math.sqrt(amounts.reduce((s, a) => s + (a - mean) ** 2, 0) / amounts.length) || 1;
      for (const p of payables) {
        const z = (p.amount - mean) / std;
        if (z > 2) {
          findings.push({
            type: "VALOR_FORA_DO_PADRAO",
            severity: z > 3 ? "alta" : "media",
            description: `Pagamento atipico: ${p.counterpartyName} R$ ${Math.round(p.amount)} (z=${z.toFixed(1)}).`
          });
        }
      }
    }

    return { total: findings.length, findings };
  }

  /** (Feature 9) Alertas inteligentes de obrigações e vencimentos, por risco. */
  async alerts(companyId?: string | null) {
    const where = companyId ? { companyId } : {};
    const now = Date.now();
    const [obligations, entries] = await Promise.all([
      this.prisma.taxObligation.findMany({ where: { ...where, status: { not: "PAGO" } } }),
      this.prisma.financialEntry.findMany({ where })
    ]);

    type Alert = { kind: string; title: string; dueDate: Date; amount: number; risk: number };
    const alerts: Alert[] = [];
    const daysTo = (d: Date) => (new Date(d).getTime() - now) / 86400000;

    for (const o of obligations) {
      const d = daysTo(o.dueDate);
      const risk = d < 0 ? 100 : Math.max(10, 100 - d * 4);
      alerts.push({
        kind: o.type,
        title: `${o.type} ${o.competence}${d < 0 ? " (em atraso)" : ""}`,
        dueDate: o.dueDate,
        amount: o.amount,
        risk
      });
    }
    for (const e of entries) {
      if (e.type === "PAYABLE" && e.status !== "PAID" && e.status !== "CANCELLED") {
        const d = daysTo(e.dueDate);
        if (d <= 7) {
          alerts.push({
            kind: "A_PAGAR",
            title: `Pagar ${e.counterpartyName}${d < 0 ? " (vencido)" : ""}`,
            dueDate: e.dueDate,
            amount: e.amount,
            risk: d < 0 ? 90 : 60 - d * 5
          });
        }
      }
    }

    alerts.sort((a, b) => b.risk - a.risk);
    return { total: alerts.length, alerts: alerts.slice(0, 20) };
  }

  /** (Feature 10) Resumo executivo do mês em linguagem natural. */
  async monthlySummary(companyId?: string | null) {
    const where = companyId ? { companyId } : {};
    const entries = await this.prisma.financialEntry.findMany({ where });
    const anchor = new Date();
    const inMonth = (d: Date) =>
      new Date(d).getMonth() === anchor.getMonth() && new Date(d).getFullYear() === anchor.getFullYear();

    const entrou = entries
      .filter((e) => e.type === "RECEIVABLE" && e.status === "RECEIVED" && e.paidDate && inMonth(e.paidDate))
      .reduce((s, e) => s + e.amount, 0);
    const saiu = entries
      .filter((e) => e.type === "PAYABLE" && e.status === "PAID" && e.paidDate && inMonth(e.paidDate))
      .reduce((s, e) => s + e.amount, 0);
    const sobra = entrou - saiu;

    const data = { entrou: Math.round(entrou), saiu: Math.round(saiu), sobra: Math.round(sobra) };
    const text = await this.llm.complete(
      `Gere um resumo executivo curto (2-3 frases) para o dono de uma pequena empresa do Simples. Numeros do mes (R$): entrou=${data.entrou}, saiu=${data.saiu}, sobra=${data.sobra}.`,
      "Voce escreve resumos financeiros claros e diretos em portugues."
    );
    return {
      summary:
        text ??
        `Neste mes entraram R$ ${data.entrou} e sairam R$ ${data.saiu}, deixando um saldo de R$ ${data.sobra} no caixa.`,
      data,
      source: text ? "AI" : "FALLBACK"
    };
  }
}
