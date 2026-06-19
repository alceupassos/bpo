import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE = "bpo_token";

/**
 * Origem pública real da requisição. Atrás do nginx/Cloudflare, `req.url` traz o
 * host de bind interno (`127.0.0.1:5001`), então os redirects precisam ser
 * montados a partir dos headers de proxy (`x-forwarded-host`/`host` +
 * `x-forwarded-proto`). Em acesso direto (dev), cai no host real do request.
 */
function redirectUrl(req: NextRequest, path: string): URL {
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") ?? req.nextUrl.protocol.replace(":", "");
  return host ? new URL(path, `${proto}://${host}`) : new URL(path, req.url);
}

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
    return NextResponse.redirect(redirectUrl(req, "/login"));
  }

  // Decodifica papel do usuário para regras de acesso
  const payload = decodeJwtPayload(token);
  if (!payload) {
    const response = NextResponse.redirect(redirectUrl(req, "/login"));
    response.cookies.delete(AUTH_COOKIE);
    return response;
  }

  const isClient = payload.role === "GESTOR_EMPRESA" || payload.role === "FINANCEIRO_EMPRESA";

  if (isClient) {
    // Clientes só podem acessar o painel do cliente
    if (pathname !== "/painel-cliente") {
      return NextResponse.redirect(redirectUrl(req, "/painel-cliente"));
    }
  } else {
    // Operadores não devem acessar o painel do cliente
    if (pathname === "/painel-cliente") {
      return NextResponse.redirect(redirectUrl(req, "/"));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"]
};
