import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../prisma/prisma.service";
import { SalesService } from "../sales/sales.service";

export type ProviderId = "MERCADOPAGO" | "ASAAS" | "STRIPE" | "PAGBANK" | "REDE" | "INFINITYPAY";
export type PayMethod = "PIX" | "CARTAO";

export interface PaymentResult {
  provider: ProviderId | "MANUAL";
  method: PayMethod;
  status: string; // pending | approved | simulated | manual | error
  txId: string | null;
  qrCode: string | null; // copia-e-cola Pix
  qrCodeBase64: string | null; // imagem do QR (quando o provedor devolve)
  redirectUrl: string | null; // checkout/cartão/link
  message?: string;
}

interface Capability {
  pix: boolean;
  cartao: boolean;
  label: string;
}

export const GATEWAYS: Record<ProviderId, Capability> = {
  MERCADOPAGO: { pix: true, cartao: true, label: "Mercado Pago" },
  ASAAS: { pix: true, cartao: true, label: "Asaas" },
  STRIPE: { pix: true, cartao: true, label: "Stripe" },
  PAGBANK: { pix: true, cartao: true, label: "PagBank" },
  REDE: { pix: false, cartao: true, label: "Rede" },
  INFINITYPAY: { pix: true, cartao: true, label: "InfinityPay" }
};

/**
 * Orquestrador multi-gateway. Roteia o pagamento para o provedor escolhido
 * (Mercado Pago, Asaas, Stripe, PagBank, Rede, InfinityPay). Cada adapter tenta
 * a API real quando há credencial e cai para SIMULADO/MANUAL caso contrário —
 * a venda nunca trava. O webhook re-roteia por provedor e fecha a venda.
 */
@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly sales: SalesService
  ) {}

  gateways() {
    return Object.entries(GATEWAYS).map(([id, cap]) => ({
      id,
      label: cap.label,
      pix: cap.pix,
      cartao: cap.cartao,
      configured: this.hasCredential(id as ProviderId)
    }));
  }

  private hasCredential(provider: ProviderId): boolean {
    const map: Record<ProviderId, string> = {
      MERCADOPAGO: "MP_ACCESS_TOKEN",
      ASAAS: "ASAAS_API_KEY",
      STRIPE: "STRIPE_SECRET_KEY",
      PAGBANK: "PAGBANK_TOKEN",
      REDE: "REDE_TOKEN",
      INFINITYPAY: "INFINITYPAY_TOKEN"
    };
    return Boolean(this.config.get<string>(map[provider]));
  }

  private defaultProvider(): ProviderId {
    const p = (this.config.get<string>("PAYMENT_PROVIDER") || "MERCADOPAGO").toUpperCase();
    return (p in GATEWAYS ? p : "MERCADOPAGO") as ProviderId;
  }

  private simulated(provider: ProviderId, method: PayMethod, orderId: string, total: number): PaymentResult {
    const txId = `sim-${provider.toLowerCase()}-${orderId}`;
    return {
      provider,
      method,
      status: "simulated",
      txId,
      qrCode: method === "PIX" ? `00020126SIMULADO-${provider}-${total.toFixed(2)}` : null,
      qrCodeBase64: null,
      redirectUrl: null,
      message: `${GATEWAYS[provider].label} em modo simulado (sem credencial). Receba e confirme manualmente.`
    };
  }

  /** Cria o pagamento no provedor escolhido. */
  async createPayment(
    orderId: string,
    opts: { provider?: string; method?: PayMethod; payerEmail?: string },
    companyId?: string | null
  ): Promise<PaymentResult> {
    const order = await this.sales.findOne(orderId, companyId);
    const total = Number(order.total);
    const provider = ((opts.provider || this.defaultProvider()).toUpperCase() as ProviderId) ?? "MERCADOPAGO";
    const cap = GATEWAYS[provider] ?? GATEWAYS.MERCADOPAGO;
    let method: PayMethod = opts.method === "CARTAO" ? "CARTAO" : "PIX";
    if (method === "PIX" && !cap.pix) method = "CARTAO";
    if (method === "CARTAO" && !cap.cartao) method = "PIX";

    let result: PaymentResult;
    try {
      if (!this.hasCredential(provider)) {
        result = this.simulated(provider, method, order.id, total);
      } else {
        result = await this.dispatch(provider, method, order, total, opts.payerEmail);
      }
    } catch (error) {
      this.logger.error(`Falha no gateway ${provider}: ${String(error)}`);
      result = this.simulated(provider, method, order.id, total);
      result.status = "error";
    }

    if (result.txId) {
      await this.prisma.order.update({ where: { id: order.id }, data: { mpPaymentId: result.txId } });
    }
    return result;
  }

  private dispatch(
    provider: ProviderId,
    method: PayMethod,
    order: { id: string; number: number },
    total: number,
    payerEmail?: string
  ): Promise<PaymentResult> {
    switch (provider) {
      case "MERCADOPAGO":
        return this.mercadopago(order, total, payerEmail);
      case "STRIPE":
        return this.stripe(order, total, method);
      case "ASAAS":
        return this.asaas(order, total, method);
      case "PAGBANK":
        return this.pagbank(order, total, method);
      case "INFINITYPAY":
        return this.infinitypay(order, total);
      case "REDE":
        return this.rede(order, total);
      default:
        return Promise.resolve(this.simulated("MERCADOPAGO", method, order.id, total));
    }
  }

  // ---------------- Adapters ----------------

  private async mercadopago(order: { id: string; number: number }, total: number, payerEmail?: string): Promise<PaymentResult> {
    const token = this.config.get<string>("MP_ACCESS_TOKEN")!;
    const res = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, "X-Idempotency-Key": order.id },
      body: JSON.stringify({
        transaction_amount: total,
        description: `Venda PDV #${order.number}`,
        payment_method_id: "pix",
        notification_url: this.config.get<string>("MP_NOTIFICATION_URL") || undefined,
        payer: { email: payerEmail || "comprador@bpo.angra.io" }
      })
    });
    if (!res.ok) throw new Error(`mp ${res.status}`);
    const json = (await res.json()) as {
      id: number;
      status: string;
      point_of_interaction?: { transaction_data?: { qr_code?: string; qr_code_base64?: string } };
    };
    const data = json.point_of_interaction?.transaction_data;
    return {
      provider: "MERCADOPAGO",
      method: "PIX",
      status: json.status,
      txId: String(json.id),
      qrCode: data?.qr_code ?? null,
      qrCodeBase64: data?.qr_code_base64 ?? null,
      redirectUrl: null
    };
  }

  private async stripe(order: { id: string; number: number }, total: number, method: PayMethod): Promise<PaymentResult> {
    const key = this.config.get<string>("STRIPE_SECRET_KEY")!;
    // Checkout Session (cartão). Stripe usa form-urlencoded.
    const body = new URLSearchParams({
      mode: "payment",
      "payment_method_types[0]": "card",
      "line_items[0][price_data][currency]": "brl",
      "line_items[0][price_data][product_data][name]": `Venda PDV #${order.number}`,
      "line_items[0][price_data][unit_amount]": String(Math.round(total * 100)),
      "line_items[0][quantity]": "1",
      success_url: (this.config.get<string>("APP_ORIGIN") || "https://bpo.angra.io") + "/pdv?paid=1",
      cancel_url: (this.config.get<string>("APP_ORIGIN") || "https://bpo.angra.io") + "/pdv?canceled=1",
      client_reference_id: order.id
    });
    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Authorization: `Bearer ${key}` },
      body
    });
    if (!res.ok) throw new Error(`stripe ${res.status}`);
    const json = (await res.json()) as { id: string; url: string };
    return {
      provider: "STRIPE",
      method: method,
      status: "pending",
      txId: json.id,
      qrCode: null,
      qrCodeBase64: null,
      redirectUrl: json.url
    };
  }

  private async asaas(order: { id: string; number: number }, total: number, method: PayMethod): Promise<PaymentResult> {
    const key = this.config.get<string>("ASAAS_API_KEY")!;
    const base = (this.config.get<string>("ASAAS_ENV") || "sandbox") === "producao"
      ? "https://api.asaas.com/v3"
      : "https://sandbox.asaas.com/api/v3";
    const res = await fetch(`${base}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", access_token: key },
      body: JSON.stringify({
        customer: this.config.get<string>("ASAAS_CUSTOMER_ID") || "cus_000000000000",
        billingType: method === "PIX" ? "PIX" : "CREDIT_CARD",
        value: total,
        dueDate: new Date().toISOString().slice(0, 10),
        externalReference: order.id
      })
    });
    if (!res.ok) throw new Error(`asaas ${res.status}`);
    const json = (await res.json()) as { id: string; status: string; invoiceUrl?: string };
    let qrCode: string | null = null;
    let qrCodeBase64: string | null = null;
    if (method === "PIX") {
      const qr = await fetch(`${base}/payments/${json.id}/pixQrCode`, { headers: { access_token: key } });
      if (qr.ok) {
        const q = (await qr.json()) as { payload?: string; encodedImage?: string };
        qrCode = q.payload ?? null;
        qrCodeBase64 = q.encodedImage ?? null;
      }
    }
    return {
      provider: "ASAAS",
      method,
      status: json.status ?? "pending",
      txId: json.id,
      qrCode,
      qrCodeBase64,
      redirectUrl: json.invoiceUrl ?? null
    };
  }

  private async pagbank(order: { id: string; number: number }, total: number, method: PayMethod): Promise<PaymentResult> {
    const token = this.config.get<string>("PAGBANK_TOKEN")!;
    const res = await fetch("https://api.pagseguro.com/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        reference_id: order.id,
        customer: { name: "Consumidor", email: "comprador@bpo.angra.io", tax_id: "12345678909" },
        items: [{ name: `Venda PDV #${order.number}`, quantity: 1, unit_amount: Math.round(total * 100) }],
        qr_codes: method === "PIX" ? [{ amount: { value: Math.round(total * 100) } }] : undefined
      })
    });
    if (!res.ok) throw new Error(`pagbank ${res.status}`);
    const json = (await res.json()) as {
      id: string;
      qr_codes?: { text?: string; links?: { rel: string; href: string }[] }[];
    };
    const qr = json.qr_codes?.[0];
    return {
      provider: "PAGBANK",
      method,
      status: "pending",
      txId: json.id,
      qrCode: qr?.text ?? null,
      qrCodeBase64: null,
      redirectUrl: qr?.links?.find((l) => l.rel.includes("PNG"))?.href ?? null
    };
  }

  private async infinitypay(order: { id: string; number: number }, total: number): Promise<PaymentResult> {
    const token = this.config.get<string>("INFINITYPAY_TOKEN")!;
    const handle = this.config.get<string>("INFINITYPAY_HANDLE") || "loja";
    // InfinityPay: link de pagamento (checkout) — tap-to-pay no app da maquininha.
    const res = await fetch("https://api.infinitepay.io/invoices/public/checkout/links", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        handle,
        order_nsu: order.id,
        items: [{ name: `Venda PDV #${order.number}`, price: Math.round(total * 100), quantity: 1 }]
      })
    });
    if (!res.ok) throw new Error(`infinitypay ${res.status}`);
    const json = (await res.json()) as { url?: string; id?: string };
    return {
      provider: "INFINITYPAY",
      method: "CARTAO",
      status: "pending",
      txId: json.id ?? order.id,
      qrCode: null,
      qrCodeBase64: null,
      redirectUrl: json.url ?? null
    };
  }

  private async rede(order: { id: string; number: number }, total: number): Promise<PaymentResult> {
    // Rede e-Rede (cartão). Sem captura aqui — devolve referência para o checkout.
    const pv = this.config.get<string>("REDE_PV");
    const token = this.config.get<string>("REDE_TOKEN")!;
    const res = await fetch("https://api.userede.com.br/erede/v1/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + Buffer.from(`${pv}:${token}`).toString("base64")
      },
      body: JSON.stringify({ reference: order.id, amount: Math.round(total * 100), kind: "credit", capture: true })
    });
    if (!res.ok) throw new Error(`rede ${res.status}`);
    const json = (await res.json()) as { tid?: string; returnCode?: string };
    return {
      provider: "REDE",
      method: "CARTAO",
      status: json.returnCode === "00" ? "approved" : "pending",
      txId: json.tid ?? order.id,
      qrCode: null,
      qrCodeBase64: null,
      redirectUrl: null
    };
  }

  // ---------------- Status & webhook ----------------

  async status(provider: string, txId: string) {
    const p = (provider || "").toUpperCase() as ProviderId;
    if (txId.startsWith("sim-")) return { status: "simulated", provider: p };
    try {
      if (p === "MERCADOPAGO") {
        const token = this.config.get<string>("MP_ACCESS_TOKEN");
        if (!token) return { status: "unknown", provider: p };
        const res = await fetch(`https://api.mercadopago.com/v1/payments/${txId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = (await res.json()) as { status?: string };
        return { status: json.status ?? "unknown", provider: p };
      }
      // Demais provedores: status via webhook; aqui devolve pending.
      return { status: "pending", provider: p };
    } catch {
      return { status: "unknown", provider: p };
    }
  }

  /**
   * Webhook genérico. Aceita ?provider= e o id no corpo/query. Para o MP,
   * re-consulta o pagamento; para os demais, confia no evento de aprovação.
   */
  async webhook(provider: string, body: Record<string, unknown>, queryId?: string) {
    const p = (provider || "MERCADOPAGO").toUpperCase();
    const id =
      queryId ||
      (typeof body?.data === "object" && body?.data ? String((body.data as Record<string, unknown>).id ?? "") : "") ||
      String(body?.id ?? "");
    if (!id) return { received: true, handled: false };

    try {
      if (p === "MERCADOPAGO") {
        const token = this.config.get<string>("MP_ACCESS_TOKEN");
        if (!token) return { received: true, handled: false };
        const res = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const payment = (await res.json()) as { id: number; status?: string };
        if (payment.status === "approved") {
          const r = await this.sales.markPaidByGateway(String(payment.id), "PIX");
          return { received: true, handled: r.ok };
        }
        return { received: true, handled: false, status: payment.status };
      }
      // Provedores que enviam evento de pagamento aprovado diretamente.
      const status = String(body?.status ?? (body as { event?: string }).event ?? "");
      if (/approved|paid|received|confirmed|autorizado/i.test(status)) {
        const r = await this.sales.markPaidByGateway(id, "CARTAO");
        return { received: true, handled: r.ok };
      }
      return { received: true, handled: false };
    } catch (error) {
      this.logger.error(`Erro webhook ${p}: ${String(error)}`);
      return { received: true, handled: false };
    }
  }
}
