"use server";

import { revalidatePath } from "next/cache";
import { apiPost } from "@/lib/api";

export async function generateExport(formData: FormData) {
  const competence = String(formData.get("competence") ?? "2026-05");
  await apiPost("/accounting/exports", { competence, format: "ZIP" });
  revalidatePath("/contador");
}