import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Rotas publicas: login e chamadas à API (proxy/backend)
  if (pathname === "/login" || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Verifica cookie de sessao
  const token = req.cookies.get("bpo_token")?.value;
  if (!token) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"]
};

