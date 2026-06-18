"use server";

import { revalidatePath } from "next/cache";
import { createCompany } from "@/lib/api";

export async function createNewCompany(formData: FormData) {
  const legalName = String(formData.get("legalName") ?? "").trim();
  const tradeName = String(formData.get("tradeName") ?? "").trim();
  const cnpj = String(formData.get("cnpj") ?? "").trim();
  const taxRegime = String(formData.get("taxRegime") ?? "").trim();
  const adminName = String(formData.get("adminName") ?? "").trim();
  const adminEmail = String(formData.get("adminEmail") ?? "").trim();
  const adminPassword = String(formData.get("adminPassword") ?? "").trim();

  if (!legalName || !tradeName || !cnpj || !adminEmail || !adminPassword) {
    return { error: "Preencha todos os campos obrigatórios." };
  }

  const res = await createCompany({
    legalName,
    tradeName,
    cnpj,
    taxRegime,
    adminName,
    adminEmail,
    adminPassword
  });

  if (!res) {
    return { error: "Erro ao criar empresa. CNPJ ou e-mail podem já estar cadastrados." };
  }

  revalidatePath("/empresas");
  return { success: true };
}
