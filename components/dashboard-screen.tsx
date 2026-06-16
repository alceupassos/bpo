"use client";

import Link from "next/link";
import type { ApexOptions } from "apexcharts";
import {
  activityRows,
  alertRows,
  dashboardKpis
} from "@/lib/data";
import type { DashboardSummary } from "@/lib/api";
import { formatBRL } from "@/lib/formatters";
import { ApexChart } from "@/components/apex-chart";
import { CalendarCard } from "@/components/calendar-card";
import { ChartCard } from "@/components/chart-card";
import { DataTable } from "@/components/data-table";
import { KpiCard } from "@/components/kpi-card";

export function DashboardScreen({ summary }: { summary?: DashboardSummary | null }) {
  // KPIs vindos da API quando disponíveis; senão, seed de lib/data.
  const kpis = summary
    ? [
        { ...dashboardKpis[0], value: formatBRL(summary.saldoProjetado) },
        { ...dashboardKpis[1], value: formatBRL(summary.aPagar) },
        { ...dashboardKpis[2], value: formatBRL(summary.aReceber) },
        { ...dashboardKpis[3], value: formatBRL(summary.inadimplencia) },
        ...dashboardKpis.slice(4)
      ]
    : dashboardKpis;

  const recebimentoPrevisto = summary ? formatBRL(summary.aReceber) : "R$ 72.760";

  const alerts = summary
    ? [
        { tipo: "Inadimplencia", mensagem: `Em aberto ${formatBRL(summary.inadimplencia)}`, qtd: "!", acao: "Ver" },
        { tipo: "OCR pendente", mensagem: `${summary.ocrPendente} documentos aguardando revisao`, qtd: `${summary.ocrPendente}`, acao: "Ver" },
        { tipo: "Conciliacao pendente", mensagem: `${summary.conciliacaoPendente} transacoes nao conciliadas`, qtd: `${summary.conciliacaoPendente}`, acao: "Ver" }
      ]
    : alertRows.slice(0, 3);
  const incomeData = [96000, 26000, 88000, 91000, 58000, 80000, 41000, 89000, 74000, 57000, 92000, 34000];
  const highlightMonth = 5; // Jun
  const incomeOptions: ApexOptions = {
    chart: { stacked: false },
    colors: incomeData.map((_, i) => (i === highlightMonth ? "#9fe870" : "#26332e")),
    legend: { show: false },
    plotOptions: {
      bar: {
        distributed: true,
        borderRadius: 12,
        columnWidth: "55%"
      }
    },
    annotations: {
      points: [
        {
          x: "Jun",
          y: 80000,
          marker: { size: 0 },
          label: {
            text: "R$ 80.000",
            borderColor: "transparent",
            offsetY: -6,
            style: {
              background: "#9fe870",
              color: "#0a0d0a",
              fontWeight: 600,
              fontSize: "13px",
              padding: { left: 12, right: 12, top: 6, bottom: 6 }
            }
          }
        }
      ]
    },
    xaxis: {
      categories: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
    },
    yaxis: {
      labels: {
        formatter: (value) => `$${Math.round(value / 1000)}K`
      }
    }
  };

  const expenseData = [74, 31, 48, 14, 39];
  const expenseHighlight = 0;
  const expenseWeekOptions: ApexOptions = {
    chart: { stacked: false },
    legend: { show: false },
    colors: expenseData.map((_, i) => (i === expenseHighlight ? "#ffffff" : "#9fe870")),
    plotOptions: {
      bar: {
        distributed: true,
        borderRadius: 16,
        columnWidth: "42%"
      }
    },
    xaxis: {
      categories: ["Seg", "Ter", "Qua", "Qui", "Sex"]
    },
    yaxis: { show: false }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.85fr_420px]">
      <div className="space-y-6">
        <div className="grid gap-5 lg:grid-cols-[1.05fr_1.55fr]">
          <CalendarCard />
          <div className="grid gap-4 sm:grid-cols-2">
            {kpis.slice(0, 4).map((item, index) => (
              <KpiCard key={item.label} item={item} index={index} />
            ))}
          </div>
        </div>

        <ChartCard title="Fluxo de caixa" meta="Entradas e saídas com leitura mensal">
          <div className="mb-5 flex items-center justify-between">
            <div className="inline-flex rounded-full border border-border bg-[#171c1a] p-1">
              <button className="rounded-full bg-lime px-8 py-3 text-sm font-medium text-black">Entradas</button>
              <button className="rounded-full px-8 py-3 text-sm text-text-soft">Saidas</button>
            </div>
            <button className="rounded-full border border-border bg-[#171c1a] px-6 py-3 text-sm text-white">
              Ano
            </button>
          </div>
          <ApexChart
            type="bar"
            height={390}
            series={[{ name: "Fluxo", data: incomeData }]}
            options={incomeOptions}
          />
        </ChartCard>
      </div>

      <div className="space-y-6">
        <ChartCard title="Carteira ativa" meta="Contatos de maior exposicao">
          <div className="flex items-center gap-3">
            {[
              { initials: "VC", color: "#8A3A2B" },
              { initials: "DJ", color: "#17345A" },
              { initials: "MI", color: "#8A6A2F" },
              { initials: "ST", color: "#6a4d90" }
            ].map((person) => (
              <div
                key={person.initials}
                className="grid h-16 w-16 place-items-center rounded-full text-sm font-semibold text-white"
                style={{ backgroundColor: person.color }}
              >
                {person.initials}
              </div>
            ))}
            <div className="grid h-16 w-16 place-items-center rounded-full border border-dashed border-border text-white">
              +
            </div>
          </div>
          <div className="mt-6 rounded-[24px] border border-border bg-[#1b211e] px-5 py-4">
            <div className="flex items-center justify-between text-text-soft">
              <span>Recebimento previsto</span>
              <Link
                href={"/contas-a-receber" as never}
                className="grid h-8 w-8 place-items-center rounded-full bg-lime text-black"
                title="Abrir contas a receber"
              >
                &gt;
              </Link>
            </div>
            <div className="mt-3 text-[2rem] font-semibold text-white">{recebimentoPrevisto}</div>
          </div>
        </ChartCard>

        <ChartCard title="Cartao operacional" meta="Conta dedicada ao ciclo do BPO">
          <div className="rounded-[26px] bg-gradient-to-br from-[#1c2419] via-[#304321] to-[#69833a] px-5 py-6 text-white">
            <div className="flex items-center justify-between">
              <div className="h-5 w-5 rounded-full border border-white/70" />
              <div className="text-lg font-semibold">ANGRA</div>
            </div>
            <div className="mt-16 text-[2.2rem] tracking-[0.08em]">3455 4562 7710 3507</div>
            <div className="mt-10 flex items-end justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.16em] text-white/70">Titular</div>
                <div className="mt-2 text-xl">Operacao BPO</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.16em] text-white/70">Validade</div>
                <div className="mt-2 text-xl">02/30</div>
              </div>
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Despesas" meta="Leitura semanal">
          <div className="mb-4 flex justify-end">
            <button className="rounded-full bg-lime px-5 py-2 text-sm font-medium text-black">Semana</button>
          </div>
          <ApexChart
            type="bar"
            height={250}
            series={[{ name: "Despesas", data: expenseData }]}
            options={expenseWeekOptions}
          />
        </ChartCard>

        <ChartCard title="Alertas e fila" meta="Pendencias que travam a operacao">
          <DataTable
            dense
            columns={[
              { key: "tipo", label: "Tipo" },
              { key: "mensagem", label: "Mensagem" },
              { key: "qtd", label: "Qtd" },
              { key: "acao", label: "Acao" }
            ]}
            rows={alerts}
          />
        </ChartCard>

        <ChartCard title="Ultimas movimentacoes" meta="Trilha recente da equipe">
          <DataTable
            dense
            columns={[
              { key: "data", label: "Data" },
              { key: "descricao", label: "Descricao" },
              { key: "valor", label: "Valor" },
              { key: "origem", label: "Origem" }
            ]}
            rows={activityRows.slice(0, 4)}
          />
        </ChartCard>
      </div>
    </div>
  );
}
