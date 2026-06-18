"use server";

import { revalidatePath } from "next/cache";
import { apiPost } from "@/lib/api";

export async function suggestMatches() {
  await apiPost("/reconciliations/suggest");
  revalidatePath("/conciliacao");
}

export async function autoReconcile() {
  await apiPost("/reconciliations/auto");
  revalidatePath("/conciliacao");
}

export async function confirmMatch(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await apiPost(`/reconciliations/confirm/${id}`);
  revalidatePath("/conciliacao");
}

export async function markDivergent(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await apiPost(`/reconciliations/divergent/${id}`);
  revalidatePath("/conciliacao");
}