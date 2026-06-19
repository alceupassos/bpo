import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../prisma/prisma.service";
import { SalesService } from "../sales/sales.service";

const MP_BASE = "https://api.mercadopago.com";

export interface PixResult {
  provider: "MERCADOPAGO" | "MANUAL";
  status: string;
  mpPaymentId: string | null;
  qrCode: string | null; // copia-e-cola
  qrCodeBase64: string | null; // imagem base64 do QR
  ticketUrl: string | null;
  message?: string;
}

/**
 * Integração de pagamentos do PDV via Mercado Pago (Pix dinâmico).
 * FALLBACK MANUAL OBRIGATÓRIO: sem MP_ACCESS_TOKEN, retorna provider=MANUAL e o
 * operador confirma a venda na mão (POST /sales/:id/pay) — nunca bloqueia o caixa.
 * O webhook re-consulta o pagamento no Mercado Pago (fonte da verdade) antes de
 * fechar a venda, então não depende de confiar no corpo recebido.
 */
@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly sales: SalesService
  ) {}

  private token(): string | null {
    return this.config.get<string>("MP_ACCESS_TOKEN") || null;
  }

  async createPix(orderId: string, payerEmail?: string, companyId?: string | null): Promise<PixResult> {
    const order = await this.sales.findOne(orderId, companyId);
    const total = Number(order.total);
    const token = this.token();

    if (!token) {
      return {
        provider: "MANUAL",
        status: "pending",
        mpPaymentId: null,
        qrCode: null,
        qrCodeBase64: null,
        ticketUrl: null,
        message:
          "Mercado Pago nao configurado (MP_ACCESS_TOKEN ausente). Receba o Pix manualmente e confirme a venda."
      };
    }

    try {
      const res = await fetch(`${MP_BASE}/v1/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-Idempotency-Key": order.id
        },
        body: JSON.stringify({
          transaction_amount: total,
          description: `Venda PDV #${order.number}`,
          payment_method_id: "pix",
          notification_url: this.config.get<string>("MP_NOTIFICATION_URL") || undefined,
          payer: { email: payerEmail || "comprador@bpo.angra.io" }
        })
      });
      if (!res.ok) throw new Error(`mp ${res.status} ${await res.text()}`);
      const json = (await res.json()) as {
        id: number;
        status: string;
        point_of_interaction?: { transaction_data?: { qr_code?: string; qr_code_base64?: string; ticket_url?: string } };
      };
      const mpPaymentId = String(json.id);
      const data = json.point_of_interaction?.transaction_data;

      await this.prisma.order.update({ where: { id: order.id }, data: { mpPaymentId } });

      return {
        provider: "MERCADOPAGO",
        status: json.status,
        mpPaymentId,
        qrCode: data?.qr_code ?? null,
        qrCodeBase64: data?.qr_code_base64 ?? null,
        ticketUrl: data?.ticket_url ?? null
      };
    } catch (error) {
      this.logger.error(`Falha ao criar Pix MP: ${String(error)}`);
      return {
        provider: "MANUAL",
        status: "error",
        mpPaymentId: null,
        qrCode: null,
        qrCodeBase64: null,
        ticketUrl: null,
        message: "Erro ao falar com o Mercado Pago. Receba o Pix manualmente e confirme a venda."
      };
    }
  }

  /** Consulta o status atual de um pagamento (polling pelo frontend). */
  async status(mpPaymentId: string) {
    const token = this.token();
    if (!token) return { status: "unknown", provider: "MANUAL" as const };
    try {
      const res = await fetch(`${MP_BASE}/v1/payments/${mpPaymentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`mp ${res.status}`);
      const json = (await res.json()) as { status?: string };
      return { status: json.status ?? "unknown", provider: "MERCADOPAGO" as const };
    } catch (error) {
      this.logger.warn(`Falha ao consultar pagamento MP: ${String(error)}`);
      return { status: "unknown", provider: "MERCADOPAGO" as const };
    }
  }

  /**
   * Webhook do Mercado Pago. Aceita o id pelo corpo ({data:{id}}) ou query.
   * Re-consulta o pagamento e, se aprovado, fecha a venda de forma idempotente.
   */
  async webhook(body: Record<string, unknown>, queryId?: string) {
    const dataId =
      queryId ||
      (typeof body?.data === "object" && body?.data
        ? String((body.data as Record<string, unknown>).id ?? "")
        : "") ||
      String(body?.id ?? "");

    if (!dataId) return { received: true, handled: false };

    const token = this.token();
    if (!token) {
      this.logger.warn("Webhook MP recebido sem MP_ACCESS_TOKEN configurado");
      return { received: true, handled: false };
    }

    try {
      const res = await fetch(`${MP_BASE}/v1/payments/${dataId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`mp ${res.status}`);
      const payment = (await res.json()) as { id: number; status?: string };
      if (payment.status === "approved") {
        const result = await this.sales.markPaidByMp(String(payment.id));
        return { received: true, handled: result.ok };
      }
      return { received: true, handled: false, status: payment.status };
    } catch (error) {
      this.logger.error(`Erro no webhook MP: ${String(error)}`);
      return { received: true, handled: false };
    }
  }
}
