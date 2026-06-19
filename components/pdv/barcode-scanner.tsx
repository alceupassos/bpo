"use client";

import { useEffect, useRef, useState } from "react";
import { ScanLine, X } from "lucide-react";

/**
 * Leitor de código de barras / QR por câmera usando a API nativa BarcodeDetector
 * (Chrome/Edge/Android). Quando indisponível (ex.: Firefox/Safari), degrada para
 * um campo de digitação manual — o caixa nunca trava. Para ampliar o suporte 1D
 * pode-se trocar por html5-qrcode/@zxing futuramente.
 */
export function BarcodeScanner({
  onDetected,
  onClose
}: {
  onDetected: (code: string) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [manual, setManual] = useState("");

  useEffect(() => {
    let stream: MediaStream | null = null;
    let raf = 0;
    let active = true;

    async function start() {
      if (typeof window === "undefined" || !("BarcodeDetector" in window)) {
        setError("Leitor nativo indisponível neste navegador — digite o código abaixo.");
        return;
      }
      try {
        const detector = new (window as unknown as { BarcodeDetector: new (opts: unknown) => { detect: (v: unknown) => Promise<{ rawValue?: string }[]> } }).BarcodeDetector({
          formats: ["ean_13", "ean_8", "code_128", "code_39", "upc_a", "upc_e", "qr_code"]
        });
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        const tick = async () => {
          if (!active || !videoRef.current) return;
          try {
            const codes = await detector.detect(videoRef.current);
            if (codes?.length && codes[0].rawValue) {
              onDetected(String(codes[0].rawValue));
              return;
            }
          } catch {
            /* frame sem leitura — segue tentando */
          }
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      } catch {
        setError("Não foi possível acessar a câmera — digite o código abaixo.");
      }
    }

    start();
    return () => {
      active = false;
      if (raf) cancelAnimationFrame(raf);
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [onDetected]);

  return (
    <div className="rounded-[24px] border border-border bg-surface p-4 soft-glow">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-bold text-text">
          <ScanLine className="h-4 w-4 text-lime" /> Leitor de código
        </h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar leitor"
          className="grid h-8 w-8 place-items-center rounded-full bg-surface-muted text-text-faint hover:text-text"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {error ? (
        <p className="mb-3 text-xs text-amber-500">{error}</p>
      ) : (
        <div className="relative mb-3 overflow-hidden rounded-2xl border border-border bg-black/40">
          <video ref={videoRef} muted playsInline className="h-44 w-full object-cover" />
          <div className="pointer-events-none absolute inset-x-6 top-1/2 h-0.5 -translate-y-1/2 bg-lime/80 shadow-[0_0_12px_rgba(159,232,112,0.8)]" />
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (manual.trim()) onDetected(manual.trim());
        }}
        className="flex gap-2"
      >
        <input
          value={manual}
          onChange={(e) => setManual(e.target.value)}
          inputMode="numeric"
          placeholder="Digite o código de barras"
          className="w-full rounded-2xl border border-border bg-surface px-4 py-2.5 text-sm text-text outline-none focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-ink/20"
        />
        <button type="submit" className="rounded-2xl bg-lime px-4 py-2.5 text-sm font-semibold text-ink hover:bg-lime-strong">
          Buscar
        </button>
      </form>
    </div>
  );
}
