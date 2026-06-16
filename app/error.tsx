"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="grid min-h-screen place-items-center bg-bg p-6">
      <div className="w-full max-w-[420px] rounded-[28px] border border-[#1d241f] bg-[#0a0d0a] p-8 text-center shadow-[0_24px_90px_rgba(0,0,0,0.55)]">
        <div className="text-lg font-semibold text-white">Algo deu errado</div>
        <p className="mt-2 text-sm text-text-soft">
          Não foi possível carregar esta área. Tente novamente em instantes.
        </p>
        <button
          onClick={reset}
          className="mt-6 rounded-2xl bg-lime px-5 py-3 font-semibold text-black transition hover:bg-lime-strong"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
