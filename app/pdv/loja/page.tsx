import Link from "next/link";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { PdvTerminal } from "@/components/pdv/pdv-terminal";
import { getCashCurrent, getCustomers, getProducts } from "@/lib/api";

/**
 * PDV em modo tela-cheia (sem sidebar) — pensado para o cliente operar como
 * frente de caixa dedicada. Reaproveita o mesmo terminal interativo do /pdv.
 */
export default async function PdvLojaPage() {
  const [products, customers, session] = await Promise.all([
    getProducts(),
    getCustomers(),
    getCashCurrent()
  ]);

  return (
    <div className="min-h-screen bg-bg panel-grid text-text">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-surface/80 px-5 py-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-lime text-ink">
            <ShoppingCart className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-lg font-extrabold leading-tight text-text">PDV — Frente de caixa</h1>
            <p className="text-xs text-text-soft">Modo tela cheia</p>
          </div>
        </div>
        <Link
          href="/painel-cliente"
          className="flex items-center gap-2 rounded-2xl border border-border bg-surface-muted px-4 py-2.5 text-sm font-semibold text-text hover:bg-surface"
        >
          <ArrowLeft className="h-4 w-4" /> Sair
        </Link>
      </header>

      <main className="mx-auto w-full max-w-[1500px] px-4 py-6 md:px-6">
        <PdvTerminal products={products ?? []} customers={customers ?? []} hasSession={Boolean(session)} />
      </main>
    </div>
  );
}
