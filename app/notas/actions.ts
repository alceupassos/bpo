"use server";

import { revalidatePath } from "next/cache";
import { apiPost, apiUpload } from "@/lib/api";

export async function uploadNote(formData: FormData) {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return;
  await apiUpload("/fiscal-notes/upload", file);
  revalidatePath("/notas");
}

export async function postNote(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (id) await apiPost(`/fiscal-notes/${id}/post`);
  revalidatePath("/notas");
}

export async function registerProducts(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (id) await apiPost(`/fiscal-notes/${id}/register-products`);
  revalidatePath("/notas");
  revalidatePath("/produtos");
}

export async function approveNote(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (id) await apiPost(`/fiscal-notes/${id}/review`, { status: "APPROVED" });
  revalidatePath("/notas");
}
