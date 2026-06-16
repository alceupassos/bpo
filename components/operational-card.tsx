import { TiltWrapper } from "@/components/tilt-wrapper";

export function OperationalCard({ balance }: { balance?: string }) {
  return (
    <TiltWrapper>
      <div className="rounded-[24px] bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#475569] border border-white/10 p-5 text-white shadow-xl relative overflow-hidden">
        {/* Soft background glow */}
        <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-lime/10 blur-2xl" />
        
        <div className="flex items-center justify-between">
          <div className="h-7 w-9 rounded-md bg-white/15" />
          <div className="text-base font-semibold tracking-wide text-lime">VISA</div>
        </div>
        {balance ? (
          <div className="mt-5">
            <div className="text-xs uppercase tracking-[0.14em] text-white/70">Conta operacional</div>
            <div className="mt-1 text-2xl font-bold tabular-nums text-lime">{balance}</div>
          </div>
        ) : null}
        <div className="mt-5 text-[1.35rem] tracking-[0.12em] tabular-nums">3455 4562 7710 3507</div>
        <div className="mt-5 flex items-end justify-between text-sm">
          <div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-white/70">Titular</div>
            <div className="mt-1">Operacao BPO</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-white/70">Validade</div>
            <div className="mt-1 tabular-nums">02/30</div>
          </div>
        </div>
      </div>
    </TiltWrapper>
  );
}
