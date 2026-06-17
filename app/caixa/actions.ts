"use server";

import { revalidatePath } from "next/cache";
import { apiPost, apiUpload } from "@/lib/api";

/** Leitor de recibo simples (foto) → lança SAIDA no caixa via IA de visão. */
export async function uploadReceipt(formData: FormData) {
  const sessionId = String(formData.get("sessionId") ?? "");
  const file = formData.get("file");
  if (!sessionId || !(file instanceof File) || file.size === 0) return;
  await apiUpload(`/cash/receipt/${sessionId}`, file);
  revalidatePath("/caixa");
}

export async function openCash(formData: FormData) {
  await apiPost("/cash/open", { openingAmount: Number(formData.get("openingAmount") ?? 0) });
  revalidatePath("/caixa");
}

export async function addCashEntry(formData: FormData) {
  const sessionId = String(formData.get("sessionId") ?? "");
  if (!sessionId) return;
  await apiPost(`/cash/entries/${sessionId}`, {
    type: String(formData.get("type") ?? "SALE"),
    amount: Number(formData.get("amount") ?? 0),
    description: String(formData.get("description") ?? "") || undefined,
    paymentMethod: String(formData.get("paymentMethod") ?? "") || undefined
  });
  revalidatePath("/caixa");
}

export async function closeCash(formData: FormData) {
  const sessionId = String(formData.get("sessionId") ?? "");
  if (!sessionId) return;
  await apiPost(`/cash/close/${sessionId}`);
  revalidatePath("/caixa");
}
