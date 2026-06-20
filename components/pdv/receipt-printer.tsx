"use client";

import { useState } from "react";
import { DoorOpen, Loader2, Printer } from "lucide-react";
import type { Order } from "@/lib/api";
import { formatBRL } from "@/lib/formatters";

// ---- ESC/POS helpers (impressora térmica via WebUSB) ----
const ESC = 0x1b;
const GS = 0x1d;

function enc(s: string): number[] {
  return Array.from(new TextEncoder().encode(s));
}

function buildEscPos(order: Order): Uint8Array {
  const bytes: number[] = [];
  bytes.push(ESC, 0x40); // init
  bytes.push(ESC, 0x61, 0x01); // center
  bytes.push(...enc(`PDV - Venda #${order.number}\n`));
  bytes.push(ESC, 0x61, 0x00); // left
  bytes.push(...enc("--------------------------------\n"));
  for (const it of order.items) {
    bytes.push(...enc(`${it.description}\n`));
    bytes.push(...enc(`  ${Number(it.qty)} x ${formatBRL(it.unitPrice)}   ${formatBRL(it.total)}\n`));
  }
  bytes.push(...enc("--------------------------------\n"));
  bytes.push(ESC, 0x45, 0x01); // bold on
  bytes.push(...enc(`TOTAL  ${formatBRL(order.total)}\n`));
  bytes.push(ESC, 0x45, 0x00); // bold off
  bytes.push(...enc(`Pagamento: ${order.paymentMethod ?? "-"}\n`));
  if (order.nfceAccessKey) bytes.push(...enc(`Chave: ${order.nfceAccessKey}\n`));
  bytes.push(...enc("\nObrigado pela preferencia!\n"));
  bytes.push(0x0a, 0x0a, 0x0a);
  bytes.push(GS, 0x56, 0x00); // cut
  bytes.push(ESC, 0x70, 0x00, 0x19, 0xfa); // abre a gaveta (drawer kick)
  return new Uint8Array(bytes);
}

const DRAWER_KICK = new Uint8Array([ESC, 0x70, 0x00, 0x19, 0xfa]);

type WebUsbDevice = {
  open: () => Promise<void>;
  selectConfiguration: (n: number) => Promise<void>;
  claimInterface: (n: number) => Promise<void>;
  configuration?: { interfaces: { interfaceNumber: number; alternate: { endpoints: { direction: string; endpointNumber: number }[] } }[] };
  transferOut: (ep: number, data: Uint8Array) => Promise<unknown>;
};

async function sendToPrinter(data: Uint8Array): Promise<string | null> {
  const usb = (navigator as unknown as { usb?: { requestDevice: (o: unknown) => Promise<WebUsbDevice> } }).usb;
  if (!usb) return "Este navegador não suporta WebUSB. Use o cupom em PDF/HTML.";
  try {
    const device: WebUsbDevice = await usb.requestDevice({ filters: [{ classCode: 7 }] });
    await device.open();
    await device.selectConfiguration(1);
    const iface = device.configuration?.interfaces.find((i) =>
      i.alternate.endpoints.some((e) => e.direction === "out")
    );
    if (!iface) return "Impressora sem endpoint de saída.";
    await device.claimInterface(iface.interfaceNumber);
    const ep = iface.alternate.endpoints.find((e) => e.direction === "out");
    if (!ep) return "Endpoint de saída não encontrado.";
    await device.transferOut(ep.endpointNumber, data);
    return null;
  } catch (e) {
    return `Não foi possível imprimir: ${String(e)}`;
  }
}

/**
 * Integração do PDV com a caixa registradora: imprime o cupom na impressora
 * térmica (ESC/POS via WebUSB) e abre a gaveta de dinheiro. Sem impressora
 * compatível, o operador usa o botão de cupom HTML/PDF — nunca trava.
 */
export function ReceiptPrinter({ order }: { order: Order }) {
  const [busy, setBusy] = useState<"print" | "drawer" | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function printThermal() {
    setBusy("print");
    const err = await sendToPrinter(buildEscPos(order));
    setBusy(null);
    setMsg(err);
  }

  async function openDrawer() {
    setBusy("drawer");
    const err = await sendToPrinter(DRAWER_KICK);
    setBusy(null);
    setMsg(err);
  }

  return (
    <div className="w-full space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={printThermal}
          disabled={busy !== null}
          className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3 text-sm font-semibold text-text hover:bg-surface-muted disabled:opacity-60"
        >
          {busy === "print" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />} Térmica
        </button>
        <button
          type="button"
          onClick={openDrawer}
          disabled={busy !== null}
          className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3 text-sm font-semibold text-text hover:bg-surface-muted disabled:opacity-60"
        >
          {busy === "drawer" ? <Loader2 className="h-4 w-4 animate-spin" /> : <DoorOpen className="h-4 w-4" />} Gaveta
        </button>
      </div>
      {msg && <p className="text-[11px] text-text-faint">{msg}</p>}
    </div>
  );
}
