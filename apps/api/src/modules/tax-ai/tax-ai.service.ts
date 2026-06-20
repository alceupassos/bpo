import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { AngraAiService } from "../ai/angra-ai.service";
import { DashboardService } from "../dashboard/dashboard.service";
import { TaxEngineService } from "../tax-engine/tax-engine.service";

type FiscalSuggestion = {
  ncm: string;
  cfop: string;
  csosn: string;
  origem: "NACIONAL" | "IMPORTADO";
  icmsAliquota: number;
  pisAliquota: number;
  cofinsAliquota: number;
  confidence: number;
};

// Heurística de fallback por palavra-chave (sem IA) — NCM aproximado por familia.
const NCM_HINTS: { re: RegExp; ncm: string }[] = [
  { re: /agua|água|refri|suco|bebida|cerveja/i, ncm: "22021000" },
  { re: /pao|pão|bolo|biscoito|padaria/i, ncm: "19059090" },
  { re: /cafe|café/i, ncm: "09011110" },
  { re: /leite|queijo|iogurte/i, ncm: "04061010" },
  { re: /carne|frango|linguica|linguiça/i, ncm: "02013000" },
  { re: /sabao|sabão|limpeza|detergente/i, ncm: "34022000" },
  { re: /camisa|roupa|calca|calça|vestuario|vestuário/i, ncm: "62052000" }
];

/**
 * Agente tributário preditivo "Angra IA": classifica produtos/notas (NCM, CFOP,
 * CST/CSOSN, origem, alíquotas) e projeta a carga tributária, o enquadramento no
 * Simples e divergências de malha fina. Automatiza ao máximo: confiança alta
 * aplica sozinho; baixa vai para revisão. Nunca expõe o modelo de IA.
 */
@Injectable()
export class TaxAiService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AngraAiService,
    private readonly tax: TaxEngineService,
    private readonly dashboard: DashboardService
  ) {}

  private heuristic(name: string): FiscalSuggestion {
    const hit = NCM_HINTS.find((h) => h.re.test(name));
    return {
      ncm: hit?.ncm ?? "00000000",
      cfop: "5102",
      csosn: "102",
      origem: "NACIONAL",
      icmsAliquota: 0,
      pisAliquota: 0,
      cofinsAliquota: 0,
      confidence: hit ? 0.55 : 0.3
    };
  }

  /** Sugere (e opcionalmente aplica) a classificação fiscal de um produto. */
  async classifyProduct(productId: string, autoApply = true) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) return { ok: false, reason: "produto nao encontrado" };

    const llm = await this.ai.json<FiscalSuggestion>(
      `Classifique fiscalmente este produto de varejo (Simples Nacional, venda ao consumidor) e responda SOMENTE JSON ` +
        `{"ncm": "8 digitos","cfop":"5102","csosn":"102","origem":"NACIONAL","icmsAliquota":0,"pisAliquota":0,"cofinsAliquota":0,"confidence":0..1}.\n` +
        `Produto: "${product.name}" categoria: "${product.category ?? "-"}".`,
      "Voce e um classificador fiscal brasileiro. Responda SOMENTE JSON valido."
    );

    const suggestion: FiscalSuggestion = llm?.ncm
      ? {
          ncm: String(llm.ncm).replace(/\D/g, "").slice(0, 8) || "00000000",
          cfop: String(llm.cfop ?? "5102"),
          csosn: String(llm.csosn ?? "102"),
          origem: llm.origem === "IMPORTADO" ? "IMPORTADO" : "NACIONAL",
          icmsAliquota: Number(llm.icmsAliquota ?? 0),
          pisAliquota: Number(llm.pisAliquota ?? 0),
          cofinsAliquota: Number(llm.cofinsAliquota ?? 0),
          confidence: Number(llm.confidence ?? 0.7)
        }
      : this.heuristic(product.name);

    const applied = autoApply && suggestion.confidence >= 0.7;
    if (applied) {
      await this.prisma.product.update({
        where: { id: productId },
        data: {
          ncm: suggestion.ncm,
          cfop: suggestion.cfop,
          csosn: suggestion.csosn,
          origem: suggestion.origem,
          icmsAliquota: suggestion.icmsAliquota,
          pisAliquota: suggestion.pisAliquota,
          cofinsAliquota: suggestion.cofinsAliquota
        }
      });
    }
    return { ok: true, applied, source: llm?.ncm ? "AI" : "HEURISTIC", suggestion };
  }

  /** Classifica em lote os produtos sem NCM (automação). */
  async classifyAll(companyId?: string | null) {
    const products = await this.prisma.product.findMany({
      where: { ...(companyId ? { companyId } : {}), OR: [{ ncm: null }, { ncm: "" }] },
      take: 100
    });
    let applied = 0;
    for (const p of products) {
      const r = await this.classifyProduct(p.id, true);
      if (r.ok && r.applied) applied += 1;
    }
    return { ok: true, classificados: products.length, aplicados: applied };
  }

  /**
   * Painel preditivo: DAS do mês, projeção/enquadramento no Simples e
   * divergências de malha fina, com recomendações acionáveis.
   */
  async insights(companyId?: string | null) {
    const company = companyId
      ? await this.prisma.company.findUnique({ where: { id: companyId } })
      : await this.prisma.company.findFirst();
    const anexo = company?.anexoSimples ?? 1;

    const [fat, rbt, products] = await Promise.all([
      this.dashboard.faturamento12m(companyId),
      this.tax.rbt12(companyId),
      this.prisma.product.findMany({ where: companyId ? { companyId } : {} })
    ]);

    const aliquota = this.tax.aliquotaEfetiva(anexo, rbt);
    const receitaMes = fat.faturamento.length ? fat.faturamento[fat.faturamento.length - 1] : 0;
    const receitaMedia = fat.total12m / 12;
    const baseProj = receitaMes || receitaMedia;
    const dasPrevisto = Math.round(baseProj * aliquota);

    // Malha fina / divergências.
    const semNcm = products.filter((p) => !p.ncm || p.ncm === "00000000");
    const semCfop = products.filter((p) => !p.cfop);
    const divergencias: { tipo: string; severidade: string; descricao: string }[] = [];
    if (semNcm.length)
      divergencias.push({
        tipo: "NCM",
        severidade: semNcm.length > 5 ? "alta" : "media",
        descricao: `${semNcm.length} produto(s) sem NCM definido — risco de rejeição na NFC-e.`
      });
    if (semCfop.length)
      divergencias.push({ tipo: "CFOP", severidade: "baixa", descricao: `${semCfop.length} produto(s) sem CFOP.` });

    // Enquadramento.
    const alertas: string[] = [];
    if (fat.percentualTeto > 80)
      alertas.push(`Faturamento em ${fat.percentualTeto}% do teto do Simples — risco de desenquadramento.`);
    if (fat.total12m > 3_600_000)
      alertas.push("Acima do sublimite de R$ 3,6 mi — atenção ao recolhimento de ICMS/ISS por fora do DAS.");

    const recomendacoes: string[] = [];
    if (semNcm.length) recomendacoes.push("Rodar a classificação automática (Angra IA) para preencher NCM/CFOP.");
    if (dasPrevisto > 0) recomendacoes.push(`Reservar ~${dasPrevisto.toLocaleString("pt-BR")} para o DAS deste mês.`);

    return {
      anexo,
      rbt12: Math.round(rbt),
      aliquotaEfetiva: Math.round(aliquota * 10000) / 100,
      dasPrevisto,
      faturamento12m: fat.total12m,
      percentualTeto: fat.percentualTeto,
      teto: fat.teto,
      divergencias,
      alertas,
      recomendacoes
    };
  }
}
