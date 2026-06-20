"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Banknote,
  CreditCard,
  Minus,
  Plus,
  QrCode,
  ScanLine,
  ShoppingCart,
  Sparkles,
  Trash2,
  UserCheck,
  Wallet
} from "lucide-react";
import clsx from "clsx";
import type { Customer, GatewayInfo, Order, PaymentResult, Product } from "@/lib/api";
import { formatBRL } from "@/lib/formatters";
import { BarcodeScanner } from "@/components/pdv/barcode-scanner";
import { ProductGrid } from "@/components/pdv/product-grid";
import { PaymentDrawer } from "@/components/pdv/payment-drawer";
import {
  assistAction,
  createOrderAction,
  createPaymentAction,
  gatewaysAction,
  identifyQrAction,
  payOrderAction,
  type CartLine
} from "@/app/pdv/actions";

type CartItem = { productId?: string; description: string; qty: number; unitPrice: number; imageUrl?: string | null };

type PaymentMethod = "DINHEIRO" | "CARTAO" | "PIX" | "CREDIARIO";

const METHODS: { id: PaymentMethod; label: string; icon: typeof Banknote }[] = [
  { id: "DINHEIRO", label: "Dinheiro", icon: Banknote },
  { id: "PIX", label: "Pix", icon: QrCode },
  { id: "CARTAO", label: "Cartão", icon: CreditCard },
  { id: "CREDIARIO", label: "Crediário", icon: Wallet }
];

const inputClass =
  "w-full rounded-2xl border border-border bg-surface px-4 py-3 text-text outline-none focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-ink/20";

type DrawerState = {
  order: Order;
  provider: string;
  method: string;
  payment: PaymentResult | null;
  paid: boolean;
} | null;

export function PdvTerminal({
  products,
  hasSession
}: {
  products: Product[];
  customers: Customer[];
  hasSession: boolean;
}) {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [method, setMethod] = useState<PaymentMethod>("DINHEIRO");
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [copilot, setCopilot] = useState("");
  const [copilotBusy, setCopilotBusy] = useState(false);
  const [qrToken, setQrToken] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [finalizing, setFinalizing] = useState(false);
  const [drawer, setDrawer] = useState<DrawerState>(null);
  const [gateways, setGateways] = useState<GatewayInfo[]>([]);
  const [provider, setProvider] = useState<string>("");

  useEffect(() => {
    gatewaysAction().then((g) => {
      if (g && g.length) {
        setGateways(g);
        setProvider((g.find((x) => x.configured) ?? g[0]).id);
      }
    });
  }, []);

  const subtotal = cart.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const total = Math.max(0, Math.round((subtotal - discount) * 100) / 100);
  const itemCount = cart.reduce((s, i) => s + i.qty, 0);

  function addProduct(p: Product) {
    setCart((prev) => {
      const idx = prev.findIndex((i) => i.productId === p.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
        return next;
      }
      return [...prev, { productId: p.id, description: p.name, qty: 1, unitPrice: Number(p.price), imageUrl: p.imageUrl }];
    });
  }

  function addByBarcode(code: string) {
    setScannerOpen(false);
    const p = products.find((x) => x.barcode && x.barcode === code);
    if (p) {
      addProduct(p);
      setNotice(null);
    } else {
      setNotice(`Código ${code} não encontrado no catálogo.`);
    }
  }

  function updateQty(idx: number, delta: number) {
    setCart((prev) => {
      const next = [...prev];
      const qty = next[idx].qty + delta;
      if (qty <= 0) return next.filter((_, i) => i !== idx);
      next[idx] = { ...next[idx], qty };
      return next;
    });
  }

  function removeLine(idx: number) {
    setCart((prev) => prev.filter((_, i) => i !== idx));
  }

  async function runCopilot() {
    if (!copilot.trim()) return;
    setCopilotBusy(true);
    const res = await assistAction(copilot);
    setCopilotBusy(false);
    if (res?.items?.length) {
      setCart((prev) => {
        const next = [...prev];
        for (const it of res.items) {
          const idx = next.findIndex((i) => i.productId === it.productId);
          if (idx >= 0) next[idx] = { ...next[idx], qty: next[idx].qty + it.qty };
          else next.push({ productId: it.productId, description: it.description, qty: it.qty, unitPrice: it.unitPrice });
        }
        return next;
      });
      setCopilot("");
      setNotice(null);
    } else {
      setNotice("Copiloto não encontrou itens para esse pedido.");
    }
  }

  async function identify() {
    if (!qrToken.trim()) return;
    const res = await identifyQrAction(qrToken);
    if (res?.matched && res.customer) {
      setCustomer(res.customer);
      setQrToken("");
      setNotice(null);
    } else {
      setNotice("Cliente não identificado pelo QR informado.");
    }
  }

  async function finalize() {
    if (!cart.length) return;
    setFinalizing(true);
    const items: CartLine[] = cart.map((i) => ({
      productId: i.productId,
      description: i.description,
      qty: i.qty,
      unitPrice: i.unitPrice
    }));
    const order = await createOrderAction({ items, discount, customerId: customer?.id });
    if (!order) {
      setFinalizing(false);
      setNotice("Não foi possível criar a venda (API indisponível).");
      return;
    }

    if (method === "PIX" || method === "CARTAO") {
      const payment = await createPaymentAction(order.id, {
        provider,
        method,
        payerEmail: customer?.email ?? undefined
      });
      setDrawer({ order, provider, method, payment, paid: false });
    } else {
      const paid = await payOrderAction(order.id, method);
      setDrawer({ order: paid ?? order, provider, method, payment: null, paid: !paid?.needsApproval });
    }
    setFinalizing(false);
  }

  function resetSale() {
    setCart([]);
    setCustomer(null);
    setDiscount(0);
    setMethod("DINHEIRO");
    setDrawer(null);
    router.refresh();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
      {/* Coluna esquerda — busca + carrinho */}
      <div className="space-y-5">
        {!hasSession && (
          <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-xs font-medium text-amber-500">
            Nenhum caixa aberto. A venda será registrada, mas para lançar no caixa{" "}
            <Link href="/caixa" className="underline">
              abra uma sessão
            </Link>
            .
          </div>
        )}

        {/* Telinha grande do pedido — itens lançados / a lançar */}
        <div className="overflow-hidden rounded-[28px] border border-border bg-ink text-white soft-glow">
          <div className="flex items-center justify-between gap-4 border-b border-white/10 px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-lime text-ink">
                <ShoppingCart className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white/70">Pedido em andamento</p>
                <p className="text-lg font-bold leading-tight">
                  {itemCount} {itemCount === 1 ? "item" : "itens"}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wider text-white/50">Total</p>
              <p className="text-3xl font-extrabold tabular-nums text-lime">{formatBRL(total)}</p>
            </div>
          </div>

          {cart.length === 0 ? (
            <p className="px-6 py-12 text-center text-sm text-white/50">
              Toque num produto, escaneie o código ou use o copiloto para lançar itens.
            </p>
          ) : (
            <ul className="max-h-[42vh] divide-y divide-white/10 overflow-y-auto">
              {cart.map((item, idx) => (
                <li key={`${item.productId ?? item.description}-${idx}`} className="flex items-center gap-3 px-4 py-3">
                  <span className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white/10">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageUrl} alt={item.description} className="h-full w-full object-cover" />
                    ) : (
                      <span className="grid h-full w-full place-items-center text-white/40">
                        <ShoppingCart className="h-5 w-5" />
                      </span>
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-semibold">{item.description}</p>
                    <p className="text-xs text-white/50">{formatBRL(item.unitPrice)} / un</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => updateQty(idx, -1)}
                      aria-label="Diminuir"
                      className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 text-white/80 hover:bg-white/20"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center text-base font-bold tabular-nums">{item.qty}</span>
                    <button
                      type="button"
                      onClick={() => updateQty(idx, 1)}
                      aria-label="Aumentar"
                      className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 text-white/80 hover:bg-white/20"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="w-24 text-right text-base font-bold tabular-nums">
                    {formatBRL(item.qty * item.unitPrice)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeLine(idx)}
                    aria-label="Remover"
                    className="grid h-8 w-8 place-items-center rounded-lg text-white/40 hover:text-danger"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Catálogo com fotos + leitor de código */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setScannerOpen((v) => !v)}
            className="flex items-center gap-2 rounded-2xl border border-border bg-surface-muted px-4 py-2.5 text-sm font-semibold text-text hover:bg-surface"
          >
            <ScanLine className="h-4 w-4 text-lime" /> {scannerOpen ? "Fechar leitor" : "Escanear código"}
          </button>
        </div>
        {scannerOpen && <BarcodeScanner onDetected={addByBarcode} onClose={() => setScannerOpen(false)} />}
        <ProductGrid products={products} onAdd={addProduct} />

        {/* Copiloto de vendas */}
        <div className="rounded-[28px] border border-lime/25 bg-lime/5 p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-text">
            <Sparkles className="h-4 w-4 text-lime" /> Copiloto de vendas (IA)
          </h3>
          <div className="flex gap-2">
            <input
              value={copilot}
              onChange={(e) => setCopilot(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runCopilot()}
              placeholder='Ex.: "2 cafés e um pão de queijo"'
              className={inputClass}
            />
            <button
              type="button"
              onClick={runCopilot}
              disabled={copilotBusy}
              className="rounded-2xl bg-lime px-5 py-3 text-sm font-semibold text-ink hover:bg-lime-strong disabled:opacity-60"
            >
              {copilotBusy ? "…" : "Adicionar"}
            </button>
          </div>
        </div>
      </div>

      {/* Coluna direita — cliente, pagamento, total */}
      <div className="space-y-5">
        {notice && (
          <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-xs font-medium text-amber-500">
            {notice}
          </div>
        )}

        {/* Cliente */}
        <div className="rounded-[28px] border border-border bg-surface p-5 soft-glow">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-text">
            <UserCheck className="h-4 w-4 text-lime" /> Cliente
          </h3>
          {customer ? (
            <div className="flex items-center justify-between rounded-2xl border border-lime/30 bg-lime/10 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-text">{customer.name}</p>
                <p className="text-xs text-text-faint">
                  Limite {formatBRL(customer.creditLimit)} · Saldo {formatBRL(customer.balance)}
                </p>
              </div>
              <button type="button" onClick={() => setCustomer(null)} className="text-xs text-text-soft underline">
                trocar
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                value={qrToken}
                onChange={(e) => setQrToken(e.target.value)}
                placeholder="QR / token do cliente"
                className={inputClass}
              />
              <button
                type="button"
                onClick={identify}
                className="rounded-2xl border border-border bg-surface-muted px-4 py-3 text-sm font-semibold text-text hover:bg-surface"
              >
                Identificar
              </button>
            </div>
          )}
        </div>

        {/* Pagamento */}
        <div className="rounded-[28px] border border-border bg-surface p-5 soft-glow">
          <h3 className="mb-3 text-sm font-bold text-text">Forma de pagamento</h3>
          <div className="grid grid-cols-2 gap-2">
            {METHODS.map((m) => {
              const Icon = m.icon;
              const active = method === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethod(m.id)}
                  className={clsx(
                    "flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors",
                    active
                      ? "border-lime bg-lime text-ink"
                      : "border-border bg-surface-muted text-text-soft hover:text-text"
                  )}
                >
                  <Icon className="h-4 w-4" /> {m.label}
                </button>
              );
            })}
          </div>

          {(method === "PIX" || method === "CARTAO") && gateways.length > 0 && (
            <div className="mt-3">
              <label htmlFor="gateway" className="mb-1 block text-[11px] uppercase tracking-[0.14em] text-text-faint">
                Adquirente
              </label>
              <select
                id="gateway"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className={inputClass}
              >
                {gateways
                  .filter((g) => (method === "PIX" ? g.pix : g.cartao))
                  .map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.label}
                      {g.configured ? "" : " (simulado)"}
                    </option>
                  ))}
              </select>
            </div>
          )}
        </div>

        {/* Totais */}
        <div className="rounded-[28px] border border-border bg-surface p-5 soft-glow">
          <div className="flex items-center justify-between text-sm text-text-soft">
            <span>Subtotal</span>
            <span className="tabular-nums">{formatBRL(subtotal)}</span>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3 text-sm text-text-soft">
            <span>Desconto</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={discount || ""}
              onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
              className="w-28 rounded-xl border border-border bg-surface px-3 py-1.5 text-right text-text outline-none focus-visible:border-ink"
            />
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
            <span className="text-base font-bold text-text">Total</span>
            <span className="text-2xl font-extrabold tabular-nums text-text">{formatBRL(total)}</span>
          </div>
          <button
            type="button"
            onClick={finalize}
            disabled={finalizing || cart.length === 0}
            className="mt-5 w-full rounded-2xl bg-lime px-4 py-4 text-base font-bold text-ink transition-colors hover:bg-lime-strong disabled:opacity-50"
          >
            {finalizing ? "Processando…" : `Finalizar venda · ${formatBRL(total)}`}
          </button>
        </div>
      </div>

      <PaymentDrawer state={drawer} onClose={() => setDrawer(null)} onPaid={resetSale} />
    </div>
  );
}
