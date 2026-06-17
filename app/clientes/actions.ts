"use server";

import { revalidatePath } from "next/cache";
import { apiPost, type Customer } from "@/lib/api";

export async function createCustomer(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  await apiPost("/customers", {
    name,
    document: String(formData.get("document") ?? "") || undefined,
    phone: String(formData.get("phone") ?? "") || undefined,
    qrToken: String(formData.get("qrToken") ?? "") || undefined,
    creditLimit: Number(formData.get("creditLimit") ?? 0)
  });
  revalidatePath("/clientes");
}

/** Identifica o cliente pelo QR e lança a venda na conta (crediário) dele. */
export async function chargeByQr(formData: FormData) {
  const qrToken = String(formData.get("qrToken") ?? "").trim();
  const amount = Number(formData.get("amount") ?? 0);
  if (!qrToken || !amount) return;

  const identified = await apiPost<{ matched: boolean; customer: Customer | null }>(
    "/customers/identify",
    { method: "QR", qrToken }
  );
  if (identified?.matched && identified.customer) {
    await apiPost(`/customers/${identified.customer.id}/charge`, {
      amount,
      description: `Venda no caixa (QR) - ${identified.customer.name}`
    });
  }
  revalidatePath("/clientes");
}
