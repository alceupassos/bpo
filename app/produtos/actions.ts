"use server";

import { revalidatePath } from "next/cache";
import { apiPost } from "@/lib/api";

export async function createProduct(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  await apiPost("/products", {
    name,
    price: Number(formData.get("price") ?? 0),
    unit: String(formData.get("unit") ?? "UN") || "UN",
    category: String(formData.get("category") ?? "") || undefined,
    barcode: String(formData.get("barcode") ?? "") || undefined
  });
  revalidatePath("/produtos");
}
