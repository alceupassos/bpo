"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="grid min-h-[60vh] place-items-center p-6 text-center">
      <div className="max-w-md rounded-[32px] border border-border bg-surface p-8 soft-glow flex flex-col items-center">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-danger/10 border border-danger/20 text-sm font-bold text-danger mb-4">
          ⚠️
        </span>
        <h2 className="text-pretty text-base font-bold text-text">Ocorreu um erro inesperado</h2>
        <p className="mt-2 text-xs text-text-soft">
          Não foi possível carregar esta área operacional. Se o servidor estiver indisponível, verifique as configurações ou tente novamente.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => reset()}
            className="rounded-2xl bg-lime px-5 py-2.5 text-xs font-semibold text-ink transition-colors hover:bg-lime-strong"
          >
            Tentar Novamente
          </button>
          <Link
            href="/"
            className="rounded-2xl border border-border bg-surface-muted px-5 py-2.5 text-xs font-medium text-text transition-colors hover:bg-surface"
          >
            Voltar ao Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
