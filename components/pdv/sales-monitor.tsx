"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Activity, Banknote, CreditCard, QrCode, Receipt, Wallet } from "lucide-react";
import type { CashSession, Order, PdvSummary } from "@/lib/api";
import { formatBRL } from "@/lib/formatters";
import { monitorDataAction } from "@/app/pdv/actions";

const methodIcon: Record<string, typeof Banknote> = {
  DINHEIRO: Banknote,
  PIX: QrCode,
  CARTAO: CreditCard,
  CREDIARIO: Wallet
};

function hora(iso: string | null): string {
  if (!iso) return "--:--";
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

/**
 * Monitor de lançamentos ao vivo: feed das últimas vendas + KPIs do dia e saldo
 * do caixa, com auto-refresh por polling (5s). Reusa /sales, /dashboard/pdv e
 * /cash/current. Pensado tanto para um painel no PDV quanto para a TV da loja.
 */
export function SalesMonitor({ compact = false }: { compact?: boolean }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pdv, setPdv] = useState<PdvSummary | null>(null);
  const [cash, setCash] = useState<CashSession | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      const data = await monitorDataAction();
      if (!active) return;
      setOrders(data.orders.filter((o) => o.status === "PAID"));
      setPdv(data.pdv);
      setCash(data.cash);
    }
    load();
    const id = setInterval(load, 5000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  const kpis = [
    { label: "Vendas hoje", value: formatBRL(pdv?.vendasHoje ?? 0) },
    { label: "Pedidos", value: String(pdv?.pedidos ?? 0) },
    { label: "Ticket médio", value: formatBRL(pdv?.ticketMedio ?? 0) },
    { label: "Saldo do caixa", value: formatBRL(cash?.balance ?? 0) }
  ];

  return (
    <div className="overflow-hidden rounded-[28px] border border-border bg-ink text-white soft-glow">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <h3 className="flex items-center gap-2 text-sm font-bold">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-lime" />
          </span>
          <Activity className="h-4 w-4 text-lime" /> Monitor de lançamentos
        </h3>
        <span className="text-xs text-white/50">ao vivo · atualiza a cada 5s</span>
      </div>

      <div className={`grid gap-3 px-5 py-4 ${compact ? "grid-cols-2" : "grid-cols-2 md:grid-cols-4"}`}>
        {kpis.map((k) => (
          <div key={k.label} className="rounded-2xl bg-white/5 px-3 py-2.5">
            <div className="text-[10px] uppercase tracking-wider text-white/50">{k.label}</div>
            <div className="mt-0.5 text-lg font-bold tabular-nums text-lime">{k.value}</div>
          </div>
        ))}
      </div>

      <div className="max-h-[46vh] divide-y divide-white/10 overflow-y-auto">
        {orders.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-white/50">Aguardando lançamentos…</p>
        ) : (
          <AnimatePresence initial={false}>
            {orders.slice(0, 20).map((o) => {
              const Icon = methodIcon[o.paymentMethod ?? ""] ?? Receipt;
              return (
                <motion.div
                  key={o.id}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 px-5 py-3"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10 text-lime">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      Venda #{o.number} · {o.items.length} {o.items.length === 1 ? "item" : "itens"}
                    </p>
                    <p className="text-xs text-white/50">
                      {hora(o.paidAt)} · {o.paymentMethod ?? "-"}
                      {o.nfceStatus && o.nfceStatus !== "NONE" ? " · NFC-e" : ""}
                    </p>
                  </div>
                  <span className="text-base font-bold tabular-nums text-lime">{formatBRL(o.total)}</span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
