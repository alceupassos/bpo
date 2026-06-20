"use server";

import { revalidatePath } from "next/cache";
import { classifyAllProducts } from "@/lib/api";

/** Roda a classificação fiscal automática (Angra IA) nos produtos sem NCM. */
export async function classifyAllAction() {
  const res = await classifyAllProducts();
  revalidatePath("/tributos");
  revalidatePath("/produtos");
  return res;
}
