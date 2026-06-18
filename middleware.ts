import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE = "bpo_token";

function decodeJwtPayload(token: string): { role: string; companyId: string | null } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Rotas públicas: login e chamadas diretas de assets/API
  if (pathname === "/login" || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Verifica cookie de sessão
  const token = req.cookies.get(AUTH_COOKIE)?.value;
  if (!token) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Decodifica papel do usuário para regras de acesso
  const payload = decodeJwtPayload(token);
  if (!payload) {
    const loginUrl = new URL("/login", req.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(AUTH_COOKIE);
    return response;
  }

  const isClient = payload.role === "GESTOR_EMPRESA" || payload.role === "FINANCEIRO_EMPRESA";

  if (isClient) {
    // Clientes só podem acessar o painel do cliente
    if (pathname !== "/painel-cliente") {
      const target = new URL("/painel-cliente", req.url);
      return NextResponse.redirect(target);
    }
  } else {
    // Operadores não devem acessar o painel do cliente
    if (pathname === "/painel-cliente") {
      const target = new URL("/", req.url);
      return NextResponse.redirect(target);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"]
};
