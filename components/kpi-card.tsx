import { ArrowDownRight, ArrowUpRight, MoreHorizontal } from "lucide-react";
import { iconMap } from "@/lib/data";
import type { Kpi } from "@/lib/types";
import { TiltWrapper } from "@/components/tilt-wrapper";

const palettes = [
  { bg: "bg-icon-blue-bg", fg: "text-icon-blue" },
  { bg: "bg-icon-purple-bg", fg: "text-icon-purple" },
  { bg: "bg-icon-green-bg", fg: "text-icon-green" },
  { bg: "bg-icon-orange-bg", fg: "text-icon-orange" },
  { bg: "bg-icon-red-bg", fg: "text-icon-red" }
];

export function KpiCard({ item, index }: { item: Kpi; index: number }) {
  const Icon = iconMap[item.label as keyof typeof iconMap];
  const isUp = item.trend === "up";
  const palette = palettes[index % palettes.length];

  return (
    <TiltWrapper delay={index * 0.04}>
      <article 
        className="h-full rounded-[24px] border border-border bg-surface p-5 soft-glow card-hover"
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="flex items-center justify-between" style={{ transform: "translateZ(20px)" }}>
          <div className="flex items-center gap-2.5">
            <span className={`grid h-9 w-9 place-items-center rounded-full ${palette.bg} ${palette.fg}`}>
              {Icon ? <Icon className="h-4 w-4" aria-hidden="true" /> : null}
            </span>
            <span className="text-sm font-medium text-text-soft">{item.label}</span>
          </div>
          <MoreHorizontal className="h-4 w-4 text-text-faint" aria-hidden="true" />
        </div>
        <div 
          className="mt-4 text-[1.7rem] font-bold leading-none tracking-tight text-text tabular-nums"
          style={{ transform: "translateZ(35px)" }}
        >
          {item.value}
        </div>
        <div 
          className={`mt-2 flex items-center gap-1 text-xs font-medium ${isUp ? "text-success" : "text-danger"}`}
          style={{ transform: "translateZ(25px)" }}
        >
          {isUp ? <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" /> : <ArrowDownRight className="h-3.5 w-3.5" aria-hidden="true" />}
          <span className="tabular-nums">{item.delta}</span>
          <span className="text-text-faint">vs anterior</span>
        </div>
      </article>
    </TiltWrapper>
  );
}
