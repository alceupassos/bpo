"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE, login } from "@/lib/api";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  let targetRedirect = "/";
  let ok = false;
  try {
    const { accessToken, user } = await login(email, password);
    const store = await cookies();
    await store.set(AUTH_COOKIE, accessToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8
    });
    if (user.role === "GESTOR_EMPRESA" || user.role === "FINANCEIRO_EMPRESA") {
      targetRedirect = "/painel-cliente";
    }
    ok = true;
  } catch {
    redirect("/login?error=1");
  }
  if (ok) redirect(targetRedirect);
}

export async function logoutAction() {
  const store = await cookies();
  store.delete(AUTH_COOKIE);
  redirect("/login");
}
