"use client";

import Link from "next/link";
import type { ApexOptions } from "apexcharts";
import { ArrowDownLeft, ArrowUpRight, Plus } from "lucide-react";
import { dashboardKpis } from "@/lib/data";
import type { DashboardSummary } from "@/lib/api";
import { formatBRL } from "@/lib/formatters";
import { ApexChart } from "@/components/apex-chart";
import { ContactsRow } from "@/components/contacts-row";
import { CtaCard } from "@/components/cta-card";
import { KpiCard } from "@/components/kpi-card";
import { OperationalCard } from "@/components/operational-card";
import { QuickTiles } from "@/components/quick-tiles";

import { TiltWrapper } from "@/components/tilt-wrapper";

export function DashboardScreen({ summary }: { summary?: DashboardSummary | null }) {
  const kpis = summary
    ? [
        { ...dashboardKpis[0], value: formatBRL(summary.saldoProjetado) },
        { ...dashboardKpis[1], value: formatBRL(summary.aPagar) },
        { ...dashboardKpis[2], value: formatBRL(summary.aReceber) },
        { label: "Impostos a vencer (DAS)", value: "R$ 4.250,00", delta: "Vence em 20/06", trend: "down", sparkline: [40, 42, 38, 35, 41] }
      ]
    : [
        dashboardKpis[0],
        dashboardKpis[1],
        dashboardKpis[2],
        { label: "Impostos a vencer (DAS)", value: "R$ 4.250,00", delta: "Vence em 20/06", trend: "down", sparkline: [40, 42, 38, 35, 41] }
      ];

  const saldoTotal = summary ? formatBRL(summary.saldoProjetado) : "R$ 146.980";
  const chips = [
    { label: "A pagar", value: summary ? formatBRL(summary.aPagar) : "R$ 96.320", fg: "text-icon-red", bg: "bg-icon-red-bg" },
    { label: "A receber", value: summary ? formatBRL(summary.aReceber) : "R$ 141.870", fg: "text-icon-green", bg: "bg-icon-green-bg" },
    { label: "Inadimplencia", value: summary ? formatBRL(summary.inadimplencia) : "R$ 31.642", fg: "text-icon-orange", bg: "bg-icon-orange-bg" }
  ];

  const fluxoTotal = summary ? formatBRL(summary.aReceber - summary.aPagar + summary.recebido) : "R$ 342.323";
  const incomeData = [96, 26, 88, 91, 58, 80, 41, 89, 74, 57, 92, 34].map((v) => v * 1000);
  const highlight = 5;
  const incomeOptions: ApexOptions = {
    colors: incomeData.map((_, i) => (i === highlight ? "#9fe870" : "rgba(255, 255, 255, 0.15)")),
    plotOptions: { bar: { distributed: true, borderRadius: 10, columnWidth: "55%" } },
    legend: { show: false },
    xaxis: { categories: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"] },
    yaxis: { labels: { formatter: (v) => `${Math.round(v / 1000)}k` } },
    tooltip: { theme: "dark", y: { formatter: (v) => formatBRL(v) } }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.85fr_360px]">
      <div className="space-y-6">
        <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
          {/* Carteira (Smart Wallet) */}
          <TiltWrapper>
            <section className="h-full rounded-[28px] border border-border bg-surface p-6 soft-glow">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-text">Carteira</h3>
                  <p className="mt-0.5 text-xs text-text-faint">Saldo consolidado D+30</p>
                </div>
                <Link
                  href={"/contas-a-pagar" as never}
                  className="inline-flex items-center gap-1 rounded-full bg-lime px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-lime-strong"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" /> Novo
                </Link>
              </div>
              <div className="mt-5 text-[2.5rem] font-bold leading-none tracking-tight text-text tabular-nums">
                {saldoTotal}
              </div>
              <div className="mt-1 text-xs text-text-faint">Projecao consolidada</div>
              
              {/* RBT12 Progression tracker */}
              <div className="mt-4 border-t border-border pt-4">
                <div className="flex justify-between text-[11px] text-text-soft font-medium">
                  <span>Faturamento RBT12</span>
                  <span>R$ 1.842.300 / R$ 4,8M</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full rounded-full bg-surface-muted overflow-hidden">
                  <div className="h-full rounded-full bg-lime" style={{ width: "38.3%" }} />
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2">
                {chips.map((c) => (
                  <div key={c.label} className="rounded-2xl border border-border bg-surface-muted p-3">
                    <div className={`mb-2 grid h-7 w-7 place-items-center rounded-full ${c.bg} ${c.fg} text-[10px] font-bold`}>
                      {c.label[0]}
                    </div>
                    <div className="text-[10px] uppercase tracking-[0.1em] text-text-faint">{c.label}</div>
                    <div className="mt-0.5 text-sm font-semibold text-text tabular-nums">{c.value}</div>
                  </div>
                ))}
              </div>
            </section>
          </TiltWrapper>

          {/* 2x2 KPIs */}
          <div className="grid gap-4 sm:grid-cols-2">
            {kpis.map((item, index) => (
              <KpiCard key={item.label} item={item} index={index} />
            ))}
          </div>
        </div>

        {/* Fluxo de caixa */}
        <section className="rounded-[28px] border border-border bg-surface p-6 soft-glow">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-text">Fluxo de caixa</h3>
              <div className="mt-1 text-[2rem] font-bold tracking-tight text-text tabular-nums">{fluxoTotal}</div>
            </div>
            <button className="rounded-full border border-border px-5 py-2.5 text-sm text-text">Ano</button>
          </div>
          <div className="mt-4 mb-5 inline-flex rounded-full bg-surface-muted p-1">
            <button className="rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-white">Entradas</button>
            <button className="rounded-full px-6 py-2.5 text-sm text-text-soft transition-colors hover:text-text">Saidas</button>
            <button className="rounded-full px-6 py-2.5 text-sm text-text-soft transition-colors hover:text-text">Saldo</button>
          </div>
          <ApexChart type="bar" height={340} series={[{ name: "Fluxo", data: incomeData }]} options={incomeOptions} />
        </section>
      </div>

      {/* Coluna direita */}
      <div className="space-y-5">
        <ContactsRow />
        <OperationalCard balance={summary ? formatBRL(summary.aReceber) : undefined} />
        <div className="grid grid-cols-2 gap-3">
          <Link
            href={"/contas-a-pagar" as never}
            className="flex items-center justify-center gap-2 rounded-2xl bg-lime px-4 py-3 text-sm font-semibold text-ink transition-colors hover:bg-lime-strong"
          >
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" /> Pagar
          </Link>
          <Link
            href={"/contas-a-receber" as never}
            className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3 text-sm font-semibold text-text transition-colors hover:bg-surface-muted"
          >
            <ArrowDownLeft className="h-4 w-4" aria-hidden="true" /> Receber
          </Link>
        </div>
        <QuickTiles />
        <CtaCard />
      </div>
    </div>
  );
}
