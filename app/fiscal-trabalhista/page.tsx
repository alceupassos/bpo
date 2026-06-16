"use client";

import React from "react";
import type { ApexOptions } from "apexcharts";
import { DashboardTopNav } from "@/components/dashboard-top-nav";
import { PageShell } from "@/components/page-shell";
import { ChartCard } from "@/components/chart-card";
import { DataTable } from "@/components/data-table";
import { ApexChart } from "@/components/apex-chart";
import { TiltWrapper } from "@/components/tilt-wrapper";
import { dasTaxRows, employeePayrollRows, billingHistory12m } from "@/lib/data";
import { formatBRL } from "@/lib/formatters";
import { Download, UploadCloud, Users, ShieldAlert, BadgePercent, Landmark } from "lucide-react";

export default function FiscalTrabalhistaPage() {
  // RBT12 total billing calculation
  const totalRBT12 = billingHistory12m.values.reduce((acc, v) => acc + v, 0);
  const limitSimples = 4800000;
  const percentageOfLimit = (totalRBT12 / limitSimples) * 100;

  // Chart configuration for last 12 months revenue
  const chartOptions: ApexOptions = {
    colors: ["#9fe870"],
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 0.5,
        opacityFrom: 0.7,
        opacityTo: 0.15,
      }
    },
    xaxis: {
      categories: billingHistory12m.categories
    },
    yaxis: {
      labels: {
        formatter: (v) => `R$ ${Math.round(v / 1000)}k`
      }
    },
    tooltip: {
      y: {
        formatter: (v) => formatBRL(v)
      }
    }
  };

  const chartSeries = [
    {
      name: "Faturamento Mensal",
      data: billingHistory12m.values
    }
  ];

  const metrics = [
    { label: "DAS do Mes (05/2026)", value: "R$ 4.250,00", icon: BadgePercent, color: "text-lime bg-lime-soft" },
    { label: "Faturamento RBT12", value: formatBRL(totalRBT12), icon: Landmark, color: "text-icon-blue bg-icon-blue-bg" },
    { label: "Funcionarios Ativos", value: "4 colaboradores", icon: Users, color: "text-icon-purple bg-icon-purple-bg" }
  ];

  return (
    <PageShell
      title="Fiscal & Trabalhista"
      subtitle="Obrigacoes do Simples Nacional, guias de DAS, folha de pagamento e monitoramento do limite RBT12."
      topNav={<DashboardTopNav />}
    >
      {/* Metrics Header */}
      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <TiltWrapper key={m.label} delay={idx * 0.05}>
              <article className="h-full rounded-[24px] border border-border bg-surface p-5 soft-glow card-hover">
                <div className="flex items-center gap-3">
                  <span className={`grid h-9 w-9 place-items-center rounded-xl ${m.color}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="text-[12px] font-medium text-text-soft">{m.label}</div>
                </div>
                <div className="mt-3 text-[1.9rem] font-bold tracking-tight text-text tabular-nums">{m.value}</div>
              </article>
            </TiltWrapper>
          );
        })}
      </div>

      {/* Main Grid: RBT12 Limit Tracker & DAS Guides */}
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          {/* Faturamento Acumulado RBT12 Tracker */}
          <TiltWrapper>
            <section className="rounded-[28px] border border-border bg-surface p-6 soft-glow">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-text">Faturamento Acumulado (RBT12)</h3>
                  <p className="text-xs text-text-soft">Soma dos ultimos 12 meses para enquadramento do Simples Nacional</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-text tabular-nums">{percentageOfLimit.toFixed(1)}% do teto</div>
                  <div className="text-[10px] text-text-faint">Limite: {formatBRL(limitSimples)} / ano</div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4 h-3.5 w-full rounded-full bg-surface-muted overflow-hidden border border-white/5 p-[2px]">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-lime to-lime-strong shadow-[0_0_10px_rgba(159,232,112,0.5)] transition-all duration-500"
                  style={{ width: `${percentageOfLimit}%` }}
                />
              </div>

              {/* Chart of billing history */}
              <div className="mt-6">
                <ApexChart type="area" height={240} series={chartSeries} options={chartOptions} />
              </div>
            </section>
          </TiltWrapper>

          {/* DAS Tax Table */}
          <ChartCard title="Imposto DAS - Simples Nacional" meta="Guias de recolhimento mensal unificado">
            <div className="space-y-4">
              <DataTable
                columns={[
                  { key: "periodo", label: "Periodo" },
                  { key: "imposto", label: "Imposto" },
                  { key: "vencimento", label: "Vencimento" },
                  { key: "valor", label: "Valor" },
                  { key: "status", label: "Status" }
                ]}
                rows={dasTaxRows}
              />
              <div className="flex gap-2 justify-end">
                <button className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface-muted px-4 py-2.5 text-xs text-text transition-colors hover:bg-surface">
                  <Download className="h-3.5 w-3.5" /> Emitir Guia DAS
                </button>
                <button className="inline-flex items-center gap-1.5 rounded-xl bg-lime px-4 py-2.5 text-xs font-semibold text-ink transition-colors hover:bg-lime-strong">
                  <UploadCloud className="h-3.5 w-3.5" /> Anexar Comprovante
                </button>
              </div>
            </div>
          </ChartCard>
        </div>

        {/* Right Column: Workers, eSocial and Obligatory Declarations */}
        <div className="space-y-6">
          {/* Employee & Payroll Tracker */}
          <ChartCard title="Trabalhista & eSocial" meta="Controle de funcionarios e encargos">
            <div className="space-y-5">
              <DataTable
                columns={[
                  { key: "funcionario", label: "Funcionario" },
                  { key: "salario", label: "Salario" },
                  { key: "fgts", label: "FGTS" },
                  { key: "status", label: "Status" }
                ]}
                rows={employeePayrollRows}
              />
              
              <div className="rounded-2xl border border-border bg-surface-muted p-4">
                <div className="flex items-center gap-2">
                  <span className="grid h-2 w-2 rounded-full bg-success animate-pulse" />
                  <div className="text-xs font-semibold text-text">Folha de Pagamento - Maio/2026</div>
                </div>
                <div className="mt-2 text-xs text-text-soft">
                  Folha processada pelo operador de BPO. Guia de FGTS gerada via eSocial e agendada para pagamento.
                </div>
              </div>
            </div>
          </ChartCard>

          {/* Declarations and DEFIS Status */}
          <TiltWrapper>
            <section className="rounded-[28px] border border-border bg-surface p-5 soft-glow">
              <h3 className="text-base font-semibold text-text">Declaracoes Obrigatorias</h3>
              <p className="text-xs text-text-soft">Status das entregas exigidas pela Receita Federal</p>
              
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between rounded-xl border border-border bg-surface-muted p-3">
                  <div>
                    <div className="text-xs font-semibold text-text">DEFIS (Ano-calendario 2025)</div>
                    <div className="text-[10px] text-text-faint">Declaracao de Informacoes Socioeconomicas</div>
                  </div>
                  <span className="rounded-full bg-success/15 border border-success/30 px-2 py-0.5 text-[10px] font-medium text-success">
                    Transmitida
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-border bg-surface-muted p-3">
                  <div>
                    <div className="text-xs font-semibold text-text">DIRF 2026 (Fechamento)</div>
                    <div className="text-[10px] text-text-faint">Declaracao do Imposto sobre a Renda Retido</div>
                  </div>
                  <span className="rounded-full bg-success/15 border border-success/30 px-2 py-0.5 text-[10px] font-medium text-success">
                    Entregue
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-border bg-surface-muted p-3">
                  <div>
                    <div className="text-xs font-semibold text-text">Guarda de Arquivos Fiscais</div>
                    <div className="text-[10px] text-text-faint">Periodo obrigatorio (5 anos)</div>
                  </div>
                  <span className="rounded-full bg-lime/20 border border-lime/40 px-2 py-0.5 text-[10px] font-medium text-lime">
                    Organizado
                  </span>
                </div>
              </div>
            </section>
          </TiltWrapper>
        </div>
      </div>
    </PageShell>
  );
}
