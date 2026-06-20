"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { classifyAllAction } from "./actions";

export function ClassifyButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function run() {
    setBusy(true);
    const res = await classifyAllAction();
    setBusy(false);
    if (res) setMsg(`${res.aplicados}/${res.classificados} produto(s) classificados pela Angra IA.`);
    else setMsg("Não foi possível classificar agora.");
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={run}
        disabled={busy}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-lime px-4 py-3 font-semibold text-ink transition-colors hover:bg-lime-strong disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {busy ? "Classificando…" : "Classificar produtos (Angra IA)"}
      </button>
      {msg && <p className="text-[11px] text-text-faint">{msg}</p>}
    </div>
  );
}
