import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Mantém o mesmo nome do cookie usado em lib/api.ts (AUTH_COOKIE).
const AUTH_COOKIE = "bpo_token";

export function middleware(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE)?.value;
  const { pathname } = req.nextUrl;
  const isLogin = pathname === "/login";

  // Atrás do nginx/Cloudflare, req.url usa o host interno (127.0.0.1:5001).
  // Reconstrói a base a partir dos headers do proxy para redirecionar ao host real.
  const proto = req.headers.get("x-forwarded-proto") ?? req.nextUrl.protocol.replace(":", "");
  const host =
    req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? req.nextUrl.host;
  const base = `${proto}://${host}`;

  if (!token && !isLogin) {
    return NextResponse.redirect(`${base}/login`);
  }
  if (token && isLogin) {
    return NextResponse.redirect(`${base}/`);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"]
};
