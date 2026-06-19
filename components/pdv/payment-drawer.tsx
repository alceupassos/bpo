"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Copy, Loader2, QrCode, X } from "lucide-react";
import type { Order, PixResult } from "@/lib/api";
import { formatBRL } from "@/lib/formatters";
import { payOrderAction, paymentStatusAction } from "@/app/pdv/actions";

type DrawerState = {
  order: Order;
  method: string;
  pix: PixResult | null;
  paid: boolean;
};

export function PaymentDrawer({
  state,
  onClose,
  onPaid
}: {
  state: DrawerState | null;
  onClose: () => void;
  onPaid: () => void;
}) {
  const [paid, setPaid] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [copied, setCopied] = useState(false);

  const isPix = state?.method === "PIX";
  const mpId = state?.pix?.mpPaymentId ?? null;

  useEffect(() => {
    setPaid(state?.paid ?? false);
    setCopied(false);
  }, [state]);

  // Polling do status do Pix no Mercado Pago (o webhook fecha a venda no servidor).
  useEffect(() => {
    if (!isPix || !mpId || paid) return;
    let active = true;
    const timer = setInterval(async () => {
      const res = await paymentStatusAction(mpId);
      if (active && res?.status === "approved") {
        setPaid(true);
        clearInterval(timer);
      }
    }, 4000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [isPix, mpId, paid]);

  async function confirmManual() {
    if (!state) return;
    setConfirming(true);
    await payOrderAction(state.order.id, state.method, mpId ?? undefined);
    setConfirming(false);
    setPaid(true);
  }

  function copyCode() {
    if (state?.pix?.qrCode) {
      navigator.clipboard?.writeText(state.pix.qrCode);
      setCopied(true);
    }
  }

  return (
    <AnimatePresence>
      {state && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 220 }}
            className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-md flex-col gap-5 overflow-y-auto border-l border-border bg-slate-950/95 p-6 shadow-2xl backdrop-blur-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-text">
                Venda #{state.order.number} — {formatBRL(state.order.total)}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar"
                className="grid h-9 w-9 place-items-center rounded-full bg-white/5 text-text-soft hover:bg-white/10 hover:text-text"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {paid ? (
              <div className="flex flex-col items-center gap-3 rounded-[24px] border border-lime/30 bg-lime/10 px-6 py-10 text-center">
                <CheckCircle2 className="h-14 w-14 text-lime" />
                <p className="text-lg font-bold text-text">Pagamento confirmado</p>
                <p className="text-sm text-text-soft">
                  Lançamento financeiro, caixa e estoque atualizados automaticamente.
                </p>
                <button
                  type="button"
                  onClick={onPaid}
                  className="mt-2 w-full rounded-2xl bg-lime px-4 py-3 font-semibold text-ink hover:bg-lime-strong"
                >
                  Nova venda
                </button>
              </div>
            ) : (
              <>
                {state.order.needsApproval && (
                  <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-500">
                    Venda no crediário acima do limite — enviada para aprovação.
                  </div>
                )}

                {isPix && state.pix?.qrCodeBase64 ? (
                  <div className="flex flex-col items-center gap-4 rounded-[24px] border border-border bg-surface p-5">
                    <p className="flex items-center gap-2 text-sm font-semibold text-text">
                      <QrCode className="h-4 w-4 text-lime" /> Pague com Pix
                    </p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`data:image/png;base64,${state.pix.qrCodeBase64}`}
                      alt="QR Code Pix"
                      className="h-52 w-52 rounded-2xl bg-white p-2"
                    />
                    <button
                      type="button"
                      onClick={copyCode}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-surface-muted px-4 py-3 text-sm font-semibold text-text hover:bg-surface"
                    >
                      <Copy className="h-4 w-4" /> {copied ? "Código copiado!" : "Copiar código copia-e-cola"}
                    </button>
                    <p className="flex items-center gap-2 text-xs text-text-faint">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Aguardando confirmação do Mercado Pago…
                    </p>
                  </div>
                ) : (
                  <div className="rounded-[24px] border border-border bg-surface p-5 text-sm text-text-soft">
                    {state.pix?.message ??
                      `Receba o pagamento em ${state.method.toLowerCase()} e confirme abaixo para fechar a venda.`}
                  </div>
                )}

                <button
                  type="button"
                  onClick={confirmManual}
                  disabled={confirming}
                  className="w-full rounded-2xl bg-lime px-4 py-3 font-semibold text-ink hover:bg-lime-strong disabled:opacity-60"
                >
                  {confirming ? "Confirmando…" : "Confirmar recebimento e fechar venda"}
                </button>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
