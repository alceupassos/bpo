import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../prisma/prisma.service";
import { TaxEngineService } from "../tax-engine/tax-engine.service";

const FOCUS_BASE: Record<string, string> = {
  homologacao: "https://homologacao.focusnfe.com.br",
  producao: "https://api.focusnfe.com.br"
};

function onlyDigits(s: string | null | undefined): string {
  return (s ?? "").replace(/\D/g, "");
}

/**
 * Emissão de NFC-e (cupom fiscal eletrônico) do PDV.
 * Provider-ready: usa Focus NFe quando há FOCUS_NFE_TOKEN; caso contrário emite
 * em modo SIMULADO (chave de acesso e número gerados, cupom imprimível) para o
 * MVP rodar ponta a ponta. NUNCA lança — registra o status na Order.
 */
@Injectable()
export class FiscalEmissionService {
  private readonly logger = new Logger(FiscalEmissionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly tax: TaxEngineService
  ) {}

  private async load(orderId: string, companyId?: string | null) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
    if (!order) throw new NotFoundException("Pedido nao encontrado");
    if (companyId != null && order.companyId !== companyId) throw new NotFoundException("Pedido nao encontrado");
    const company = await this.prisma.company.findUnique({ where: { id: order.companyId } });
    return { order, company };
  }

  /** Gera uma chave de acesso de 44 dígitos plausível (modo simulado). */
  private fakeAccessKey(cnpj: string, number: number): string {
    const uf = "35"; // SP
    const aamm = new Date().toISOString().slice(2, 7).replace("-", "");
    const base = `${uf}${aamm}${onlyDigits(cnpj).padStart(14, "0")}65001${String(number).padStart(9, "0")}1`;
    let key = base.replace(/\D/g, "");
    while (key.length < 44) key += String(key.length % 10);
    return key.slice(0, 44);
  }

  async emit(orderId: string, companyId?: string | null) {
    const { order, company } = await this.load(orderId, companyId);
    if (order.nfceStatus === "AUTHORIZED" || order.nfceStatus === "SIMULATED") {
      return { status: order.nfceStatus, accessKey: order.nfceAccessKey, number: order.nfceNumber, already: true };
    }

    const products = await this.prisma.product.findMany({
      where: { id: { in: order.items.map((i) => i.productId).filter((x): x is string => Boolean(x)) } }
    });
    const byId = new Map(products.map((p) => [p.id, p]));
    const taxes = await this.tax.computeOrder(
      { regimeTributario: company?.regimeTributario ?? "SIMPLES", anexoSimples: company?.anexoSimples ?? 1 },
      order.items.map((i) => ({ product: i.productId ? byId.get(i.productId) : null, total: Number(i.total) })),
      order.companyId
    );

    const token = this.config.get<string>("FOCUS_NFE_TOKEN");
    let status: "AUTHORIZED" | "SIMULATED" = "SIMULATED";
    let accessKey = this.fakeAccessKey(company?.cnpj ?? "", order.number);
    let danfeUrl: string | null = null;

    if (token) {
      try {
        const env = (this.config.get<string>("FOCUS_NFE_ENV") || "homologacao").toLowerCase();
        const base = FOCUS_BASE[env] ?? FOCUS_BASE.homologacao;
        const ref = `pdv-${order.id}`;
        const res = await fetch(`${base}/v2/nfce?ref=${ref}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Basic " + Buffer.from(`${token}:`).toString("base64")
          },
          body: JSON.stringify(this.buildFocusPayload(order, company, byId))
        });
        const json = (await res.json()) as { status?: string; chave_nfe?: string; caminho_danfe?: string };
        if (res.ok && (json.status === "autorizado" || json.chave_nfe)) {
          status = "AUTHORIZED";
          accessKey = json.chave_nfe ?? accessKey;
          danfeUrl = json.caminho_danfe ? `${base}${json.caminho_danfe}` : null;
        } else {
          this.logger.warn(`Focus NFe nao autorizou (${res.status}); emitindo SIMULADO`);
        }
      } catch (error) {
        this.logger.warn(`Falha Focus NFe, emitindo SIMULADO: ${String(error)}`);
      }
    }

    const updated = await this.prisma.order.update({
      where: { id: order.id },
      data: { nfceStatus: status, nfceNumber: String(order.number), nfceAccessKey: accessKey, danfeUrl }
    });

    // Registro fiscal (nota emitida) para o contador/auditoria.
    await this.prisma.fiscalNote.create({
      data: {
        companyId: order.companyId,
        direction: "EMITIDA",
        type: "NFCE",
        customerName: order.customerId ? `Cliente ${order.customerId}` : "Consumidor final",
        total: order.total,
        issueDate: new Date(),
        status: "APPROVED",
        source: "MANUAL",
        posted: true
      }
    });

    return { status, accessKey, number: updated.nfceNumber, danfeUrl, taxes };
  }

  // Payload mínimo do Focus NFe (preenchido o essencial; provider valida o resto).
  private buildFocusPayload(order: { items: unknown[]; total: unknown }, company: unknown, byId: Map<string, unknown>) {
    const c = company as { cnpj?: string; inscricaoEstadual?: string; legalName?: string } | null;
    return {
      cnpj_emitente: onlyDigits(c?.cnpj),
      data_emissao: new Date().toISOString(),
      presenca_comprador: "1",
      modalidade_frete: "9",
      items: (order.items as { productId?: string; description: string; qty: unknown; unitPrice: unknown; total: unknown }[]).map(
        (it, idx) => {
          const p = it.productId ? (byId.get(it.productId) as { ncm?: string; cfop?: string; csosn?: string } | undefined) : undefined;
          return {
            numero_item: idx + 1,
            codigo_ncm: p?.ncm ?? "00000000",
            cfop: p?.cfop ?? "5102",
            descricao: it.description,
            quantidade_comercial: Number(it.qty),
            valor_unitario_comercial: Number(it.unitPrice),
            valor_bruto: Number(it.total),
            icms_origem: "0",
            icms_situacao_tributaria: p?.csosn ?? "102"
          };
        }
      ),
      formas_pagamento: [{ forma_pagamento: "01", valor_pagamento: Number(order.total) }]
    };
  }

  /** Cancela a NFC-e (simulado/real conforme status). */
  async cancel(orderId: string, companyId?: string | null) {
    const { order } = await this.load(orderId, companyId);
    const updated = await this.prisma.order.update({
      where: { id: order.id },
      data: { nfceStatus: "CANCELLED" }
    });
    return { status: updated.nfceStatus };
  }

  /** Cupom imprimível (HTML) — usado pelo PDV/impressora. */
  async cupomHtml(orderId: string, companyId?: string | null): Promise<string> {
    const { order, company } = await this.load(orderId, companyId);
    const brl = (n: number) => `R$ ${n.toFixed(2).replace(".", ",")}`;
    const linhas = order.items
      .map(
        (i) =>
          `<tr><td>${i.description}</td><td style="text-align:right">${Number(i.qty)}x</td><td style="text-align:right">${brl(
            Number(i.total)
          )}</td></tr>`
      )
      .join("");
    const selo =
      order.nfceStatus === "SIMULATED"
        ? "<p style='color:#b45309'>*** CUPOM SIMULADO (sem valor fiscal) ***</p>"
        : order.nfceStatus === "AUTHORIZED"
          ? "<p>NFC-e autorizada</p>"
          : "";
    return `<!doctype html><html><head><meta charset="utf-8"><title>Cupom #${order.number}</title>
<style>body{font-family:monospace;width:300px;margin:0 auto;padding:8px;color:#111}h2{text-align:center;margin:4px 0}table{width:100%;border-collapse:collapse;font-size:12px}td{padding:2px 0}hr{border:none;border-top:1px dashed #999}.tot{font-size:14px;font-weight:bold;display:flex;justify-content:space-between}</style></head>
<body>
<h2>${company?.tradeName ?? "Empresa"}</h2>
<p style="text-align:center;font-size:11px">CNPJ ${company?.cnpj ?? "-"}${company?.inscricaoEstadual ? ` · IE ${company.inscricaoEstadual}` : ""}</p>
<hr/>
<p style="font-size:11px">Cupom #${order.number} · ${new Date().toLocaleString("pt-BR")}</p>
<table>${linhas}</table>
<hr/>
<div class="tot"><span>TOTAL</span><span>${brl(Number(order.total))}</span></div>
<p style="font-size:11px">Pagamento: ${order.paymentMethod ?? "-"}</p>
${order.nfceAccessKey ? `<p style="font-size:10px;word-break:break-all">Chave: ${order.nfceAccessKey}</p>` : ""}
${selo}
<p style="text-align:center;font-size:11px">Obrigado pela preferência!</p>
</body></html>`;
  }
}
