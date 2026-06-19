"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, RefreshCw, X } from "lucide-react";

/**
 * Captura a foto de um produto pela câmera do dispositivo. A imagem é reduzida
 * no cliente (canvas, ~480px, JPEG q0.72) e devolvida como data URL — leve o
 * bastante para guardar direto no produto, sem precisar servir arquivos.
 */
export function ProductPhotoCapture({
  productName,
  onCapture,
  onClose
}: {
  productName: string;
  onCapture: (dataUrl: string) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let active = true;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (active && videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setReady(true);
        }
      } catch {
        setError("Não foi possível acessar a câmera. Verifique a permissão do navegador.");
      }
    })();
    return () => {
      active = false;
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function snap() {
    const video = videoRef.current;
    if (!video) return;
    const maxW = 480;
    const scale = Math.min(1, maxW / (video.videoWidth || maxW));
    const w = Math.round((video.videoWidth || maxW) * scale);
    const h = Math.round((video.videoHeight || maxW) * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, w, h);
    onCapture(canvas.toDataURL("image/jpeg", 0.72));
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/70 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.96, y: 8 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.96, y: 8 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md rounded-[24px] border border-border bg-surface p-5 soft-glow"
        >
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-bold text-text">
              <Camera className="h-4 w-4 text-lime" /> Foto de {productName}
            </h3>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="grid h-8 w-8 place-items-center rounded-full bg-surface-muted text-text-faint hover:text-text"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {error ? (
            <p className="py-8 text-center text-sm text-amber-500">{error}</p>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-border bg-black/40">
              <video ref={videoRef} muted playsInline className="h-64 w-full object-cover" />
            </div>
          )}

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={snap}
              disabled={!ready || Boolean(error)}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-lime px-4 py-3 font-semibold text-ink hover:bg-lime-strong disabled:opacity-50"
            >
              <Camera className="h-4 w-4" /> Bater foto
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-surface-muted px-4 py-3 text-sm font-semibold text-text hover:bg-surface"
            >
              <RefreshCw className="h-4 w-4" /> Cancelar
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
