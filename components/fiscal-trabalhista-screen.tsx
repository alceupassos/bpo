"use client";

import { PageShell } from "@/components/page-shell";
import { ChartCard } from "@/components/chart-card";
import { DataTable } from "@/components/data-table";
import { RechartsChart } from "@/components/recharts-chart";
import { TiltWrapper } from "@/components/tilt-wrapper";
import type { Employee, Faturamento12m, PayrollRun, TaxObligation } from "@/lib/api";
import { dasTaxRows, employeePayrollRows, billingHistory12m } from "@/lib/data";
import { formatBRL, payrollRunToRow, taxObligationToRow } from "@/lib/formatters";
import { payTaxObligation, generatePayroll } from "@/app/fiscal-trabalhista/actions";
import { BadgePercent, Download, Landmark, UploadCloud, Users } from "lucide-react";

export function FiscalTrabalhistaScreen({
  obligations,
  runs,
  employees,
  faturamento,
  isDemo
}: {
  obligations: TaxObligation[] | null;
  runs: PayrollRun[] | null;
  employees: Employee[] | null;
  faturamento: Faturamento12m | null;
  isDemo: boolean;
}) {
  const totalRBT12 = faturamento?.total12m ?? billingHistory12m.values.reduce((a, v) => a + v, 0);
  const limitSimples = faturamento?.teto ?? 4_800_000;
  const percentageOfLimit = faturamento?.percentualTeto ?? (totalRBT12 / limitSimples) * 100;

  const chartOptions: Record<string, unknown> = {
    colors: ["#9fe870"],
    fill: { type: "gradient", gradient: { shadeIntensity: 0.5, opacityFrom: 0.7, opacityTo: 0.15 } },
    xaxis: { categories: faturamento?.categories ?? billingHistory12m.categories },
    yaxis: { labels: { formatter: (v: number) => `R$ ${Math.round(v / 1000)}k` } },
    tooltip: { y: { formatter: (v: number) => formatBRL(v) } }
  };

  const chartSeries = [{ name: "Faturamento Mensal", data: faturamento?.faturamento ?? billingHistory12m.values }];

  const dasRows = obligations ? obligations.map(taxObligationToRow) : dasTaxRows;
  const payrollRows = runs ? runs.map(payrollRunToRow) : employeePayrollRows;
  const activeEmployees = employees?.filter((e) => e.status === "ATIVO").length ?? 4;
  const dasMes = obligations?.find((o) => o.type === "DAS");

  const metrics = [
    { label: "DAS do Mes", value: formatBRL(dasMes?.amount ?? 4250), icon: BadgePercent, color: "text-lime bg-lime-soft" },
    { label: "Faturamento RBT12", value: formatBRL(totalRBT12), icon: Landmark, color: "text-icon-blue bg-icon-blue-bg" },
    { label: "Funcionarios Ativos", value: `${activeEmployees} colaboradores`, icon: Users, color: "text-icon-purple bg-icon-purple-bg" }
  ];

  return (
    <PageShell
      title="Fiscal & Trabalhista"
      subtitle="Obrigacoes do Simples Nacional, guias de DAS, folha de pagamento e monitoramento do limite RBT12."
      isDemo={isDemo}
    >
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

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
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
              <div className="mt-4 h-3.5 w-full overflow-hidden rounded-full border border-white/5 bg-surface-muted p-[2px]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-lime to-lime-strong shadow-[0_0_10px_rgba(159,232,112,0.5)] transition-all duration-500"
                  style={{ width: `${Math.min(percentageOfLimit, 100)}%` }}
                />
              </div>
              <div className="mt-6">
                <RechartsChart type="area" height={240} series={chartSeries} options={chartOptions} />
              </div>
            </section>
          </TiltWrapper>

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
                rows={dasRows}
              />
              <div className="flex flex-wrap gap-2 justify-end">
                {obligations?.map((o) =>
                  o.status !== "PAGO" ? (
                    <form key={o.id} action={payTaxObligation}>
                      <input type="hidden" name="id" value={o.id} />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface-muted px-4 py-2.5 text-xs text-text transition-colors hover:bg-surface"
                      >
                        <Download className="h-3.5 w-3.5" /> Pagar {o.type} {o.competence}
                      </button>
                    </form>
                  ) : null
                )}
                <form action={generatePayroll}>
                  <input type="hidden" name="competence" value="2026-06" />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-lime px-4 py-2.5 text-xs font-semibold text-ink transition-colors hover:bg-lime-strong"
                  >
                    <UploadCloud className="h-3.5 w-3.5" /> Gerar folha 06/2026
                  </button>
                </form>
              </div>
            </div>
          </ChartCard>
        </div>

        <div className="space-y-6">
          <ChartCard title="Trabalhista & eSocial" meta="Controle de funcionarios e encargos">
            <DataTable
              columns={[
                { key: "funcionario", label: "Funcionario" },
                { key: "salario", label: "Salario" },
                { key: "fgts", label: "FGTS" },
                { key: "status", label: "Status" }
              ]}
              rows={payrollRows}
            />
          </ChartCard>
        </div>
      </div>
    </PageShell>
  );
}