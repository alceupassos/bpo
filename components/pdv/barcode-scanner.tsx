"use client";

import { useEffect, useRef, useState } from "react";
import { ScanLine, X } from "lucide-react";

/**
 * Leitor de código de barras / QR por câmera, funcionando em qualquer navegador:
 * usa a API nativa BarcodeDetector quando disponível (Chrome/Edge/Android) e cai
 * para o ZXing (@zxing/browser) no Firefox/Safari/iOS. Sem câmera, há entrada
 * manual — o caixa nunca trava. Emite um bipe curto ao ler.
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
    let zxingControls: { stop?: () => void } | null = null;
    let done = false;

    function beepAndEmit(code: string) {
      if (done) return;
      done = true;
      try {
        const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const osc = ctx.createOscillator();
        osc.frequency.value = 880;
        osc.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } catch {
        /* sem áudio, segue */
      }
      onDetected(code);
    }

    async function startNative(): Promise<boolean> {
      if (typeof window === "undefined" || !("BarcodeDetector" in window)) return false;
      try {
        const Detector = (window as unknown as { BarcodeDetector: new (o: unknown) => { detect: (v: unknown) => Promise<{ rawValue?: string }[]> } }).BarcodeDetector;
        const detector = new Detector({
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
              beepAndEmit(String(codes[0].rawValue));
              return;
            }
          } catch {
            /* frame sem leitura */
          }
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return true;
      } catch {
        return false;
      }
    }

    async function startZxing() {
      try {
        const { BrowserMultiFormatReader } = await import("@zxing/browser");
        const reader = new BrowserMultiFormatReader();
        zxingControls = await reader.decodeFromVideoDevice(undefined, videoRef.current ?? undefined, (result) => {
          if (result) beepAndEmit(result.getText());
        });
      } catch {
        setError("Não foi possível acessar a câmera — digite o código abaixo.");
      }
    }

    (async () => {
      const ok = await startNative();
      if (!ok && active) await startZxing();
    })();

    return () => {
      active = false;
      if (raf) cancelAnimationFrame(raf);
      if (stream) stream.getTracks().forEach((t) => t.stop());
      try {
        zxingControls?.stop?.();
      } catch {
        /* ok */
      }
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
