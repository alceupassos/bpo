import { cookies } from "next/headers";
import { AUTH_COOKIE } from "@/lib/api";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:3002/api";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const store = await cookies();
  const token = store.get(AUTH_COOKIE)?.value;
  if (!token) {
    return new Response("Nao autorizado", { status: 401 });
  }

  const res = await fetch(`${BASE}/accounting/exports/${id}/download`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store"
  });

  if (!res.ok) {
    return new Response("Arquivo indisponivel", { status: res.status });
  }

  const blob = await res.blob();
  const disposition = res.headers.get("Content-Disposition") ?? `attachment; filename="fechamento-${id}.zip"`;
  return new Response(blob, {
    headers: {
      "Content-Type": res.headers.get("Content-Type") ?? "application/zip",
      "Content-Disposition": disposition
    }
  });
}