"use client";

export default function Loading() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="flex flex-col items-center gap-3">
        <span className="relative flex h-10 w-10">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime opacity-75"></span>
          <span className="relative inline-flex rounded-full h-10 w-10 bg-lime/20 border border-lime grid place-items-center">
            <span className="h-4 w-4 rounded-full bg-lime animate-pulse" />
          </span>
        </span>
        <div className="text-xs font-semibold text-text-soft tracking-wider uppercase">Carregando dados...</div>
      </div>
    </div>
  );
}
