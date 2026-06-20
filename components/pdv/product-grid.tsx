"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Camera, Globe, ImageOff, Loader2, Plus, Search } from "lucide-react";
import type { Product } from "@/lib/api";
import { formatBRL } from "@/lib/formatters";
import { ProductPhotoCapture } from "@/components/pdv/product-photo-capture";
import { autoPhotosAction, fetchProductPhotoAction, setProductPhotoAction } from "@/app/pdv/actions";

const inputClass =
  "w-full rounded-2xl border border-border bg-surface px-4 py-3 text-text outline-none focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-ink/20";

export function ProductGrid({
  products,
  onAdd
}: {
  products: Product[];
  onAdd: (p: Product) => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("__all__");
  const [capturing, setCapturing] = useState<Product | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) {
      if (p.category) set.add(p.category);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const matchesCategory = category === "__all__" || p.category === category;
      if (!matchesCategory) return false;
      if (!q) return true;
      return p.name.toLowerCase().includes(q) || (p.barcode ?? "").includes(q);
    });
  }, [products, query, category]);

  async function saveCapture(dataUrl: string) {
    const product = capturing;
    setCapturing(null);
    if (!product) return;
    setBusyId(product.id);
    await setProductPhotoAction(product.id, dataUrl);
    setBusyId(null);
    startTransition(() => router.refresh());
  }

  async function fromInternet(product: Product) {
    setBusyId(product.id);
    await fetchProductPhotoAction(product.id);
    setBusyId(null);
    startTransition(() => router.refresh());
  }

  async function autoAll() {
    setBusyId("__all__");
    await autoPhotosAction();
    setBusyId(null);
    startTransition(() => router.refresh());
  }

  const missing = products.filter((p) => !p.imageUrl).length;

  return (
    <div className="rounded-[28px] border border-border bg-surface p-5 soft-glow">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar produto…"
            className={`${inputClass} pl-10`}
          />
        </div>
        {missing > 0 && (
          <button
            type="button"
            onClick={autoAll}
            disabled={busyId === "__all__"}
            className="flex items-center gap-2 rounded-2xl border border-border bg-surface-muted px-4 py-3 text-sm font-semibold text-text hover:bg-surface disabled:opacity-60"
            title="Buscar fotos da internet para os produtos sem imagem"
          >
            {busyId === "__all__" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4 text-lime" />}
            Fotos da internet ({missing})
          </button>
        )}
      </div>

      {categories.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {[{ key: "__all__", label: "Todas" }, ...categories.map((c) => ({ key: c, label: c }))].map((chip) => {
            const active = category === chip.key;
            return (
              <button
                key={chip.key}
                type="button"
                onClick={() => setCategory(chip.key)}
                aria-pressed={active}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  active
                    ? "bg-lime text-ink"
                    : "border border-border bg-surface-muted text-text-soft hover:text-text"
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="py-10 text-center text-sm text-text-faint">Nenhum produto encontrado.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((p) => {
            const busy = busyId === p.id;
            return (
              <div
                key={p.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface-muted transition-colors hover:border-lime/40"
              >
                <button
                  type="button"
                  onClick={() => onAdd(p)}
                  aria-label={`Adicionar ${p.name}`}
                  className="flex flex-1 flex-col text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
                >
                  <span className="relative block aspect-square w-full overflow-hidden bg-black/20">
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <span className="grid h-full w-full place-items-center text-text-faint">
                        <ImageOff className="h-7 w-7" aria-hidden="true" />
                      </span>
                    )}
                    {busy && (
                      <span className="absolute inset-0 grid place-items-center bg-black/40">
                        <Loader2 className="h-6 w-6 animate-spin text-lime" />
                      </span>
                    )}
                    <span className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-lime text-ink opacity-0 transition-opacity group-hover:opacity-100">
                      <Plus className="h-4 w-4" />
                    </span>
                  </span>
                  <span className="flex flex-1 flex-col gap-0.5 p-2.5">
                    <span className="line-clamp-2 text-xs font-medium leading-tight text-text">{p.name}</span>
                    <span className="text-sm font-bold tabular-nums text-text">{formatBRL(Number(p.price))}</span>
                  </span>
                </button>
                <div className="flex border-t border-border">
                  <button
                    type="button"
                    onClick={() => setCapturing(p)}
                    className="flex flex-1 items-center justify-center gap-1 py-2 text-[11px] font-semibold text-text-soft transition-colors hover:bg-surface hover:text-text"
                    title="Bater foto do produto"
                  >
                    <Camera className="h-3.5 w-3.5" /> Foto
                  </button>
                  <button
                    type="button"
                    onClick={() => fromInternet(p)}
                    disabled={busy}
                    className="flex flex-1 items-center justify-center gap-1 border-l border-border py-2 text-[11px] font-semibold text-text-soft transition-colors hover:bg-surface hover:text-text disabled:opacity-50"
                    title="Buscar foto na internet"
                  >
                    <Globe className="h-3.5 w-3.5" /> Internet
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {capturing && (
        <ProductPhotoCapture
          productName={capturing.name}
          onCapture={saveCapture}
          onClose={() => setCapturing(null)}
        />
      )}
    </div>
  );
}
