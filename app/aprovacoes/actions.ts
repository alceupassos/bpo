"use server";

import { revalidatePath } from "next/cache";
import { apiPost } from "@/lib/api";

export async function approveRequest(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await apiPost(`/approvals/${id}/approve`);
  revalidatePath("/aprovacoes");
  revalidatePath("/painel-cliente");
}

export async function rejectRequest(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await apiPost(`/approvals/${id}/reject`);
  revalidatePath("/aprovacoes");
  revalidatePath("/painel-cliente");
}