"use client";

import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { TiltWrapper } from "@/components/tilt-wrapper";

export function ChartCard({
  title,
  meta,
  children,
  className = "",
  actionHref = "/relatorios"
}: {
  title: string;
  meta?: string;
  children: React.ReactNode;
  className?: string;
  actionHref?: string;
}) {
  return (
    <TiltWrapper className={className}>
      <section className="h-full rounded-[28px] border border-border bg-surface p-5 soft-glow">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-pretty text-[1.35rem] font-semibold leading-tight text-text">{title}</h3>
            {meta ? <p className="mt-1 text-sm text-text-soft">{meta}</p> : null}
          </div>
          <Link
            href={actionHref as never}
            aria-label="Abrir detalhe"
            title="Abrir detalhe"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-border bg-surface-muted text-text-faint transition-colors hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
          >
            <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        {children}
      </section>
    </TiltWrapper>
  );
}
