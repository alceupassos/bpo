"use server";

import { revalidatePath } from "next/cache";
import { apiPost } from "@/lib/api";

export async function payTaxObligation(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await apiPost(`/tax-obligations/${id}/pay`);
  revalidatePath("/fiscal-trabalhista");
}

export async function generatePayroll(formData: FormData) {
  const competence = String(formData.get("competence") ?? "");
  if (!competence) return;
  await apiPost("/payroll/runs", { competence });
  revalidatePath("/fiscal-trabalhista");
}