import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

type Company = { regimeTributario: string; anexoSimples: number };
type ProductLike = {
  icmsAliquota?: unknown;
  pisAliquota?: unknown;
  cofinsAliquota?: unknown;
};

// Faixas do Simples Nacional (Anexos I=comércio e II=indústria). [tetoRBT12, nominal, deducao]
const FAIXAS: Record<number, [number, number, number][]> = {
  1: [
    [180_000, 0.04, 0],
    [360_000, 0.073, 5_940],
    [720_000, 0.095, 13_860],
    [1_800_000, 0.107, 22_500],
    [3_600_000, 0.143, 87_300],
    [4_800_000, 0.19, 378_000]
  ],
  2: [
    [180_000, 0.045, 0],
    [360_000, 0.078, 5_940],
    [720_000, 0.1, 13_860],
    [1_800_000, 0.112, 22_500],
    [3_600_000, 0.147, 85_500],
    [4_800_000, 0.3, 720_000]
  ]
};

/**
 * Motor tributário do BPO. Calcula a alíquota efetiva do Simples Nacional a
 * partir do anexo da empresa e do faturamento dos últimos 12 meses (RBT12) e
 * monta os tributos por item para a emissão do cupom/NFC-e.
 */
@Injectable()
export class TaxEngineService {
  constructor(private readonly prisma: PrismaService) {}

  /** Receita bruta dos últimos 12 meses (base do Simples). */
  async rbt12(companyId?: string | null): Promise<number> {
    const since = new Date();
    since.setMonth(since.getMonth() - 12);
    const entries = await this.prisma.financialEntry.findMany({
      where: { ...(companyId ? { companyId } : {}), type: "RECEIVABLE", issueDate: { gte: since } }
    });
    return entries.reduce((s, e) => s + Number(e.amount), 0);
  }

  /** Alíquota efetiva do Simples: ((RBT12 × nominal) − dedução) ÷ RBT12. */
  aliquotaEfetiva(anexo: number, rbt12: number): number {
    const tabela = FAIXAS[anexo] ?? FAIXAS[1];
    const faixa = tabela.find(([teto]) => rbt12 <= teto) ?? tabela[tabela.length - 1];
    const [, nominal, deducao] = faixa;
    if (rbt12 <= 0) return tabela[0][1];
    return Math.max(0, (rbt12 * nominal - deducao) / rbt12);
  }

  /**
   * Tributos do pedido. No Simples (CSOSN 102), os tributos saem no DAS — então
   * devolvemos a alíquota/valor efetivos do Simples sobre o total, além de
   * eventuais alíquotas por produto (regimes normais).
   */
  async computeOrder(
    company: Company,
    items: { product?: ProductLike | null; total: number }[],
    companyId?: string | null
  ) {
    const total = items.reduce((s, i) => s + i.total, 0);
    if (company.regimeTributario === "SIMPLES" || company.regimeTributario === "MEI") {
      const rbt = await this.rbt12(companyId);
      const aliquota = this.aliquotaEfetiva(company.anexoSimples ?? 1, rbt);
      return {
        regime: company.regimeTributario,
        rbt12: Math.round(rbt),
        aliquotaEfetiva: Math.round(aliquota * 10000) / 100, // %
        tributoTotal: Math.round(total * aliquota * 100) / 100,
        icms: 0,
        pis: 0,
        cofins: 0
      };
    }
    // Regimes normais: soma das alíquotas dos produtos.
    let icms = 0;
    let pis = 0;
    let cofins = 0;
    for (const i of items) {
      icms += i.total * Number(i.product?.icmsAliquota ?? 0);
      pis += i.total * Number(i.product?.pisAliquota ?? 0);
      cofins += i.total * Number(i.product?.cofinsAliquota ?? 0);
    }
    return {
      regime: company.regimeTributario,
      rbt12: 0,
      aliquotaEfetiva: total ? Math.round(((icms + pis + cofins) / total) * 10000) / 100 : 0,
      tributoTotal: Math.round((icms + pis + cofins) * 100) / 100,
      icms: Math.round(icms * 100) / 100,
      pis: Math.round(pis * 100) / 100,
      cofins: Math.round(cofins * 100) / 100
    };
  }
}
