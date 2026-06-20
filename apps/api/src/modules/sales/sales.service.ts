import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { LlmService } from "../ai/llm.service";
import { FiscalEmissionService } from "../fiscal-emission/fiscal-emission.service";

export type SaleItemInput = { productId?: string; qty: number; description?: string; unitPrice?: number };

export type CreateOrderPayload = {
  customerId?: string;
  discount?: number;
  items: SaleItemInput[];
};

export type PayOrderPayload = {
  paymentMethod: string;
  mpPaymentId?: string;
};

const COMPANY_FALLBACK = "company-1";

/**
 * Núcleo do PDV. Cria pedidos (carrinho) e, ao pagar, executa UMA transação
 * Prisma que: marca o pedido como PAID, gera o lançamento financeiro
 * (RECEIVABLE pago), registra a venda no caixa aberto (CashEntry SALE), dá baixa
 * de estoque por item (StockMovement OUT) e grava auditoria. Vendas no crediário
 * acima do limite do cliente abrem ApprovalRequest e NÃO fecham automaticamente.
 */
@Injectable()
export class SalesService {
  private readonly logger = new Logger(SalesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly llm: LlmService,
    private readonly fiscal: FiscalEmissionService
  ) {}

  list(companyId?: string | null) {
    return this.prisma.order.findMany({
      where: companyId ? { companyId } : {},
      orderBy: { createdAt: "desc" },
      include: { items: true },
      take: 50
    });
  }

  async findOne(id: string, companyId?: string | null) {
    const order = await this.prisma.order.findUnique({ where: { id }, include: { items: true } });
    if (!order) throw new NotFoundException("Pedido nao encontrado");
    if (companyId != null && order.companyId !== companyId) {
      throw new NotFoundException("Pedido nao encontrado");
    }
    return order;
  }

  /** Monta o pedido (status OPEN) com preços vindos do catálogo. */
  async create(payload: CreateOrderPayload, companyId?: string | null, actor = "operador") {
    const company = companyId ?? COMPANY_FALLBACK;
    const ids = payload.items.map((i) => i.productId).filter((x): x is string => Boolean(x));
    const products = ids.length
      ? await this.prisma.product.findMany({ where: { id: { in: ids } } })
      : [];
    const byId = new Map(products.map((p) => [p.id, p]));

    const items = payload.items.map((raw) => {
      const product = raw.productId ? byId.get(raw.productId) : undefined;
      const unitPrice = raw.unitPrice ?? (product ? Number(product.price) : 0);
      const qty = raw.qty > 0 ? raw.qty : 1;
      const description = raw.description ?? product?.name ?? "Item avulso";
      return {
        productId: product?.id ?? null,
        description,
        qty,
        unitPrice,
        total: Math.round(unitPrice * qty * 100) / 100
      };
    });

    const subtotal = items.reduce((s, i) => s + i.total, 0);
    const discount = payload.discount && payload.discount > 0 ? payload.discount : 0;
    const total = Math.max(0, Math.round((subtotal - discount) * 100) / 100);

    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    const todayCount = await this.prisma.order.count({
      where: { companyId: company, createdAt: { gte: dayStart } }
    });

    return this.prisma.order.create({
      data: {
        companyId: company,
        customerId: payload.customerId ?? null,
        number: todayCount + 1,
        status: "OPEN",
        subtotal: Math.round(subtotal * 100) / 100,
        discount,
        total,
        createdBy: actor,
        items: { create: items }
      },
      include: { items: true }
    });
  }

  /**
   * Fecha a venda. Idempotente: se o pedido já estiver PAID, devolve como está.
   * No crediário acima do limite, abre aprovação e devolve needsApproval=true.
   */
  async pay(id: string, payload: PayOrderPayload, companyId?: string | null, actor = "operador") {
    const order = await this.findOne(id, companyId);
    if (order.status === "PAID") return { ...order, alreadyPaid: true };
    if (order.status === "CANCELLED") throw new NotFoundException("Pedido cancelado");

    const total = Number(order.total);
    const method = (payload.paymentMethod || "DINHEIRO").toUpperCase();

    // Crediário: valida limite do cliente antes de fechar.
    if (method === "CREDIARIO" && order.customerId) {
      const customer = await this.prisma.customer.findUnique({ where: { id: order.customerId } });
      if (customer) {
        const projected = Number(customer.balance) + total;
        if (Number(customer.creditLimit) > 0 && projected > Number(customer.creditLimit)) {
          await this.prisma.approvalRequest.create({
            data: {
              companyId: order.companyId,
              targetType: "ORDER",
              targetId: order.id,
              description: `Venda crediario acima do limite - ${customer.name}`,
              amount: total,
              requestedBy: actor,
              status: "PENDING"
            }
          });
          return { ...order, needsApproval: true };
        }
      }
    }

    const session = await this.prisma.cashSession.findFirst({
      where: { companyId: order.companyId, status: "OPEN" },
      orderBy: { openedAt: "desc" }
    });

    const updated = await this.prisma.$transaction(async (tx) => {
      const paidOrder = await tx.order.update({
        where: { id: order.id },
        data: {
          status: "PAID",
          paymentMethod: method,
          mpPaymentId: payload.mpPaymentId ?? order.mpPaymentId,
          sessionId: session?.id ?? order.sessionId,
          paidAt: new Date()
        },
        include: { items: true }
      });

      const now = new Date();
      await tx.financialEntry.create({
        data: {
          companyId: order.companyId,
          type: "RECEIVABLE",
          status: "RECEIVED",
          description: `Venda PDV #${order.number}`,
          counterpartyName: order.customerId ? `Cliente ${order.customerId}` : "Consumidor",
          category: "Vendas",
          documentNumber: `PDV-${order.number}`,
          amount: total,
          issueDate: now,
          dueDate: now,
          paidDate: now
        }
      });

      if (session) {
        await tx.cashEntry.create({
          data: {
            sessionId: session.id,
            type: "SALE",
            amount: total,
            description: `Venda PDV #${order.number}`,
            paymentMethod: method
          }
        });
      }

      for (const item of paidOrder.items) {
        if (!item.productId) continue;
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQty: { decrement: Number(item.qty) } }
        });
        await tx.stockMovement.create({
          data: {
            companyId: order.companyId,
            productId: item.productId,
            type: "OUT",
            qty: Number(item.qty),
            reason: "Venda PDV",
            refType: "ORDER",
            refId: order.id
          }
        });
      }

      if (method === "CREDIARIO" && order.customerId) {
        await tx.customer.update({
          where: { id: order.customerId },
          data: { balance: { increment: total } }
        });
      }

      await tx.auditLog.create({
        data: {
          companyId: order.companyId,
          entityType: "ORDER",
          entityId: order.id,
          action: "SALE_PAID",
          actor
        }
      });

      return paidOrder;
    });

    // Emissão fiscal (NFC-e) best-effort — nunca bloqueia a venda.
    try {
      await this.fiscal.emit(order.id, companyId);
    } catch (error) {
      this.logger.warn(`Emissao NFC-e falhou (venda mantida): ${String(error)}`);
    }

    return this.prisma.order.findUnique({ where: { id: order.id }, include: { items: true } }) as Promise<typeof updated>;
  }

  /** Fecha a venda a partir do id de transação de qualquer gateway (webhook). */
  async markPaidByGateway(txId: string, method = "PIX") {
    const order = await this.prisma.order.findUnique({ where: { mpPaymentId: txId } });
    if (!order) {
      this.logger.warn(`Webhook gateway: pedido nao encontrado para txId=${txId}`);
      return { ok: false };
    }
    const paid = await this.pay(order.id, { paymentMethod: method, mpPaymentId: txId }, null, "gateway-webhook");
    return { ok: true, order: paid };
  }

  /** Compat: webhook do Mercado Pago. */
  markPaidByMp(mpPaymentId: string) {
    return this.markPaidByGateway(mpPaymentId, "PIX");
  }

  /** Estorno: reverte estoque do pedido pago e marca CANCELLED. */
  async cancel(id: string, companyId?: string | null, actor = "operador") {
    const order = await this.findOne(id, companyId);
    if (order.status === "CANCELLED") return order;

    return this.prisma.$transaction(async (tx) => {
      if (order.status === "PAID") {
        for (const item of order.items) {
          if (!item.productId) continue;
          await tx.product.update({
            where: { id: item.productId },
            data: { stockQty: { increment: Number(item.qty) } }
          });
          await tx.stockMovement.create({
            data: {
              companyId: order.companyId,
              productId: item.productId,
              type: "IN",
              qty: Number(item.qty),
              reason: "Estorno venda PDV",
              refType: "ORDER_CANCEL",
              refId: order.id
            }
          });
        }
      }
      const cancelled = await tx.order.update({
        where: { id: order.id },
        data: { status: "CANCELLED" },
        include: { items: true }
      });
      await tx.auditLog.create({
        data: {
          companyId: order.companyId,
          entityType: "ORDER",
          entityId: order.id,
          action: "SALE_CANCELLED",
          actor
        }
      });
      return cancelled;
    });
  }

  /**
   * Copiloto de vendas: interpreta linguagem natural ("2 cafés e um pão") e
   * devolve itens do catálogo. Usa o LLM quando disponível; se não, cai numa
   * heurística determinística por correspondência de nome — nunca trava.
   */
  async assist(text: string, companyId?: string | null) {
    const products = await this.prisma.product.findMany({
      where: companyId ? { companyId } : {},
      orderBy: { name: "asc" },
      take: 200
    });
    const catalog = products.map((p) => ({ id: p.id, name: p.name, price: Number(p.price) }));

    const llm = await this.llm.json<{ items?: { productId?: string; name?: string; qty?: number }[] }>(
      `Catalogo (JSON): ${JSON.stringify(catalog)}\n\n` +
        `Pedido do cliente em linguagem natural: "${text}"\n` +
        `Responda SOMENTE JSON {"items":[{"productId": string, "qty": number}]} usando os ids do catalogo.`,
      "Voce e um copiloto de PDV. Mapeie o pedido para itens do catalogo. Responda SOMENTE JSON."
    );

    let items: { productId: string; description: string; qty: number; unitPrice: number }[] = [];
    if (llm?.items?.length) {
      items = llm.items
        .map((it) => {
          const p = products.find((x) => x.id === it.productId);
          if (!p) return null;
          return { productId: p.id, description: p.name, qty: it.qty && it.qty > 0 ? it.qty : 1, unitPrice: Number(p.price) };
        })
        .filter((x): x is NonNullable<typeof x> => Boolean(x));
    }

    // Fallback heurístico: casa nomes de produtos com o texto informado.
    if (!items.length) {
      const lower = text.toLowerCase();
      items = products
        .filter((p) => p.name && lower.includes(p.name.toLowerCase().split(" ")[0]))
        .slice(0, 5)
        .map((p) => ({ productId: p.id, description: p.name, qty: 1, unitPrice: Number(p.price) }));
    }

    return { items, source: llm?.items?.length ? "AI" : "HEURISTIC" };
  }
}
