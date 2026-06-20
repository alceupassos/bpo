"use server";

import { revalidatePath } from "next/cache";
import {
  autoProductPhotos,
  cancelOrder,
  createOrder,
  createPayment,
  emitNfce,
  fetchProductPhoto,
  getCupom,
  getGateways,
  getPaymentStatus,
  identifyCustomer,
  importProductsOcr,
  payOrder,
  salesAssist,
  setProductImage,
  type IdentifyResult,
  type Order,
  type PaymentResult,
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

/** Lista os gateways disponíveis (e quais estão configurados). */
export async function gatewaysAction() {
  return getGateways();
}

/** Cria o pagamento no gateway escolhido (Pix/cartão), com fallback manual. */
export async function createPaymentAction(
  orderId: string,
  opts: { provider?: string; method?: "PIX" | "CARTAO"; payerEmail?: string }
): Promise<PaymentResult | null> {
  return createPayment(orderId, opts);
}

export async function paymentStatusAction(
  txId: string,
  provider?: string
): Promise<{ status: string; provider: string } | null> {
  return getPaymentStatus(txId, provider);
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

/** Emite a NFC-e (cupom) da venda — real (Focus) ou simulada. */
export async function emitNfceAction(orderId: string) {
  return emitNfce(orderId);
}

/** Devolve o HTML do cupom para impressão/visualização. */
export async function cupomHtmlAction(orderId: string): Promise<string | null> {
  const res = await getCupom(orderId);
  return res?.html ?? null;
}

/** Salva a foto batida na câmera (data URL JPEG já reduzido no cliente). */
export async function setProductPhotoAction(id: string, dataUrl: string) {
  if (!id || !dataUrl.startsWith("data:image/")) return null;
  const updated = await setProductImage(id, dataUrl);
  revalidatePath("/pdv");
  revalidatePath("/pdv/loja");
  return updated;
}

/** Busca uma foto do produto na internet (Openverse/LoremFlickr). */
export async function fetchProductPhotoAction(id: string) {
  const res = await fetchProductPhoto(id);
  revalidatePath("/pdv");
  revalidatePath("/pdv/loja");
  return res;
}

/** Preenche fotos de todos os produtos sem imagem. */
export async function autoPhotosAction() {
  const res = await autoProductPhotos();
  revalidatePath("/pdv");
  revalidatePath("/pdv/loja");
  return res;
}

/** OCR de nota do fornecedor → entrada de produtos no catálogo (form action). */
export async function importOcrAction(formData: FormData) {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return;
  await importProductsOcr(file);
  revalidatePath("/pdv");
  revalidatePath("/produtos");
}
