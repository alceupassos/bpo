"use client";

import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { iconMap } from "@/lib/data";
import type { Kpi } from "@/lib/types";

export function KpiCard({ item, index }: { item: Kpi; index: number }) {
  const Icon = iconMap[item.label as keyof typeof iconMap];
  const isUp = item.trend === "up";
  const points = item.sparkline
    .map((value, sparkIndex) => `${sparkIndex * 16},${38 - value / 4}`)
    .join(" ");

  return (
    <motion.article
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.24 }}
      className="rounded-[24px] border border-border bg-[#111413] px-5 py-5 soft-glow"
    >
      <div className="flex items-center justify-between">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#171c1a] text-white">
          {Icon ? <Icon className="h-5 w-5" /> : null}
        </div>
        <span className="text-[11px] uppercase tracking-[0.18em] text-text-faint">KPI</span>
      </div>
      <div className="mt-4 text-[11px] uppercase tracking-[0.18em] text-text-faint">{item.label}</div>
      <div className="mt-2 text-[2rem] font-semibold leading-none text-white">{item.value}</div>
      <div className={`mt-3 flex items-center gap-1 text-sm ${isUp ? "text-success" : "text-danger"}`}>
        {isUp ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
        <span>{item.delta}</span>
        <span className="text-text-faint">vs periodo anterior</span>
      </div>
      <svg viewBox="0 0 144 44" className="mt-4 h-11 w-full">
        <polyline
          fill="none"
          stroke={isUp ? "#9fe870" : "#ef6a5a"}
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    </motion.article>
  );
}
