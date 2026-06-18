"use server";

import { redirect } from "next/navigation";
import { apiPost } from "@/lib/api";

export async function changePasswordAction(formData: FormData) {
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!currentPassword || newPassword.length < 6) {
    redirect("/perfil?error=invalid");
  }
  if (newPassword !== confirmPassword) {
    redirect("/perfil?error=mismatch");
  }

  const result = await apiPost<{ changed: boolean }>("/auth/change-password", {
    currentPassword,
    newPassword
  });

  if (!result?.changed) {
    redirect("/perfil?error=wrong");
  }

  redirect("/perfil?ok=1");
}