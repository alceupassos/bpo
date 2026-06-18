import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

const PREFIX = "enc:v1:";

function keyFromEnv(): Buffer {
  const raw = process.env.BIOMETRIC_ENCRYPTION_KEY ?? process.env.JWT_SECRET ?? "dev-only-key";
  return createHash("sha256").update(raw).digest();
}

/** Criptografa descritor facial (AES-256-GCM) para repouso — LGPD art. 11. */
export function encryptBiometric(plain: string): string {
  const key = keyFromEnv();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${PREFIX}${iv.toString("base64url")}.${enc.toString("base64url")}.${tag.toString("base64url")}`;
}

export function decryptBiometric(stored: string): string | null {
  if (!stored.startsWith(PREFIX)) return stored;
  try {
    const key = keyFromEnv();
    const [, payload] = stored.split(PREFIX);
    const [ivB64, dataB64, tagB64] = payload.split(".");
    const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivB64, "base64url"));
    decipher.setAuthTag(Buffer.from(tagB64, "base64url"));
    const dec = Buffer.concat([
      decipher.update(Buffer.from(dataB64, "base64url")),
      decipher.final()
    ]);
    return dec.toString("utf8");
  } catch {
    return null;
  }
}