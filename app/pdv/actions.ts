"use server";

import { revalidatePath } from "next/cache";
import {
  cancelOrder,
  createOrder,
  createPix,
  getPaymentStatus,
  identifyCustomer,
  importProductsOcr,
  payOrder,
  salesAssist,
  type IdentifyResult,
  type Order,
  type PixResult,
  type SalesAssistResult
} from "@/lib/api";

export type CartLine = { productId?: string; description?: string; qty: number; unitPrice?: number };

/** Cria o pedido (carrinho) com status OPEN. */
export async function createOrderAction(input: {
  items: CartLine[];
  discount?: number;
  customerId?: string;
}): Promise<Order | null> {
  const order = await createOrder(input);
  revalidatePath("/pdv");
  return order;
}

/** Fecha a venda no método informado (DINHEIRO/CARTAO/PIX/CREDIARIO). */
export async function payOrderAction(id: string, paymentMethod: string, mpPaymentId?: string): Promise<Order | null> {
  const order = await payOrder(id, { paymentMethod, mpPaymentId });
  revalidatePath("/pdv");
  return order;
}

export async function cancelOrderAction(id: string): Promise<Order | null> {
  const order = await cancelOrder(id);
  revalidatePath("/pdv");
  return order;
}

/** Gera o Pix (QR dinâmico) via Mercado Pago, com fallback manual. */
export async function createPixAction(orderId: string, payerEmail?: string): Promise<PixResult | null> {
  return createPix(orderId, payerEmail);
}

export async function paymentStatusAction(mpPaymentId: string): Promise<{ status: string; provider: string } | null> {
  return getPaymentStatus(mpPaymentId);
}

/** Copiloto de vendas: linguagem natural → itens do catálogo. */
export async function assistAction(text: string): Promise<SalesAssistResult | null> {
  if (!text.trim()) return null;
  return salesAssist(text);
}

/** Identifica o cliente pelo QR Code (fidelidade / crediário). */
export async function identifyQrAction(qrToken: string): Promise<IdentifyResult | null> {
  if (!qrToken.trim()) return null;
  return identifyCustomer({ method: "QR", qrToken });
}

/** OCR de nota do fornecedor → entrada de produtos no catálogo (form action). */
export async function importOcrAction(formData: FormData) {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return;
  await importProductsOcr(file);
  revalidatePath("/pdv");
  revalidatePath("/produtos");
}
