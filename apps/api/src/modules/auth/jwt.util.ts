import { createHmac, timingSafeEqual } from "crypto";
import * as bcrypt from "bcryptjs";

export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  role: string;
  companyId: string | null;
}

export type DecodedJwt = JwtPayload & { iat: number; exp: number };

/**
 * Assina/verifica JWT HS256 com o `crypto` nativo do Node — sem dependências
 * externas. Suficiente para o login básico do MVP demo.
 */
export function signJwt(payload: JwtPayload, secret: string, expiresInSec = 60 * 60 * 8): string {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const body = { ...payload, iat: now, exp: now + expiresInSec };
  const headerB64 = Buffer.from(JSON.stringify(header)).toString("base64url");
  const bodyB64 = Buffer.from(JSON.stringify(body)).toString("base64url");
  const data = `${headerB64}.${bodyB64}`;
  const sig = createHmac("sha256", secret).update(data).digest("base64url");
  return `${data}.${sig}`;
}

function decodeSignedJwt(token: string, secret: string): DecodedJwt | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [headerB64, bodyB64, sig] = parts;
  const data = `${headerB64}.${bodyB64}`;
  const expected = createHmac("sha256", secret).update(data).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    return JSON.parse(Buffer.from(bodyB64, "base64url").toString()) as DecodedJwt;
  } catch {
    return null;
  }
}

export function verifyJwt(token: string, secret: string): DecodedJwt | null {
  const payload = decodeSignedJwt(token, secret);
  if (!payload) return null;
  if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) return null;
  return payload;
}

/** Verifica assinatura ignorando expiração (refresh dentro da janela de graça). */
export function verifyJwtForRefresh(
  token: string,
  secret: string,
  graceSec = 60 * 60 * 24 * 7
): DecodedJwt | null {
  const payload = decodeSignedJwt(token, secret);
  if (!payload?.exp) return null;
  const now = Math.floor(Date.now() / 1000);
  if (now - payload.exp > graceSec) return null;
  return payload;
}

/** Hasheia uma senha usando bcrypt. */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

/** Compara a senha fornecida com o hash armazenado usando bcrypt. */
export async function passwordMatches(provided: string, stored: string): Promise<boolean> {
  return bcrypt.compare(provided, stored);
}

