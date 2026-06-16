"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="grid min-h-screen place-items-center bg-bg p-6">
      <div className="w-full max-w-[420px] rounded-[28px] border border-border bg-surface p-8 text-center soft-glow">
        <div className="text-lg font-semibold text-text">Algo deu errado</div>
        <p className="mt-2 text-sm text-text-soft">
          Nao foi possivel carregar esta area. Tente novamente em instantes.
        </p>
        <button
          onClick={reset}
          className="mt-6 rounded-2xl bg-lime px-5 py-3 font-semibold text-ink transition-colors hover:bg-lime-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
