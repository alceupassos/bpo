"use server";

import { revalidatePath } from "next/cache";
import { apiPost } from "@/lib/api";

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
