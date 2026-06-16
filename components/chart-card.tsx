"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MoreHorizontal } from "lucide-react";

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
    <motion.section
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.26 }}
      className={`rounded-[28px] border border-border bg-[#111413] p-5 soft-glow ${className}`}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-[1.6rem] leading-tight text-white">{title}</h3>
          {meta ? <p className="mt-1 text-sm text-text-soft">{meta}</p> : null}
        </div>
        <Link
          href={actionHref as never}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-border bg-[#171c1a] text-text-faint transition hover:border-border-strong hover:text-white"
          title="Abrir detalhe"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Link>
      </div>
      {children}
    </motion.section>
  );
}
