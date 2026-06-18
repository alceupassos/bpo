"use server";

import { revalidatePath } from "next/cache";
import { apiPost } from "@/lib/api";

export async function createSupplier(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  await apiPost("/suppliers", {
    name,
    cnpj: String(formData.get("cnpj") ?? "").trim() || undefined,
    email: String(formData.get("email") ?? "").trim() || undefined,
    phone: String(formData.get("phone") ?? "").trim() || undefined,
    category: String(formData.get("category") ?? "").trim() || undefined
  });

  revalidatePath("/fornecedores");
}