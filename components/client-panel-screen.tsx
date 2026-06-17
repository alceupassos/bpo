"use client";

import { clientHistoryRows, clientPendingRows } from "@/lib/data";
import type { TableRow } from "@/lib/types";
import { RechartsChart } from "@/components/recharts-chart";
import { ChartCard } from "@/components/chart-card";
import { DataTable } from "@/components/data-table";

export function ClientPanelScreen({
  metrics,
  pending,
  history
}: {
  metrics?: { label: string; value: string }[];
  pending?: TableRow[];
  history?: TableRow[];
}) {
  const metricCards =
    metrics ?? [
      { label: "Saldo atual", value: "R$ 182.450" },
      { label: "A pagar (7 dias)", value: "R$ 28.900" },
      { label: "A receber (7 dias)", value: "R$ 39.700" }
    ];
  const pendingRows = pending ?? clientPendingRows;
  const historyRows = history ?? clientHistoryRows;

  const lineOptions: any = {
    colors: ["#9fe870"],
    xaxis: { categories: ["18/05", "19/05", "20/05", "21/05", "22/05", "23/05", "24/05"] },
    legend: { show: false }
  };

  const donutOptions: any = {
    labels: ["A vencer", "Vencido", "Pago"],
    colors: ["#9fe870", "#ef4444", "#c7d2cf"],
    legend: { position: "right" }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {metricCards.map((metric) => (
          <article key={metric.label} className="rounded-[24px] border border-border bg-surface p-5 soft-glow">
            <div className="text-[12px] font-medium text-text-soft">{metric.label}</div>
            <div className="mt-2 text-[1.9rem] font-bold tracking-tight text-text tabular-nums">{metric.value}</div>
          </article>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <ChartCard title="Resumo do mes" meta="Entradas e saidas dos ultimos 7 dias">
          <RechartsChart
            type="area"
            height={260}
            series={[{ name: "Saldo", data: [142000, 153400, 161200, 155900, 176300, 171800, 182450] }]}
            options={lineOptions}
          />
        </ChartCard>
        <ChartCard title="Composicao do pagar" meta="Leitura simplificada para o cliente">
          <RechartsChart type="donut" height={260} series={[64, 18, 18]} options={donutOptions} />
        </ChartCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Pendencias do cliente" meta="Itens que pedem resposta ou aprovacao">
          <DataTable
            columns={[
              { key: "item", label: "Item" },
              { key: "responsavel", label: "Responsavel" },
              { key: "prazo", label: "Prazo" },
              { key: "status", label: "Acao" }
            ]}
            rows={pendingRows}
          />
        </ChartCard>
        <ChartCard title="Historico recente" meta="Ultimos eventos financeiros relevantes">
          <DataTable
            columns={[
              { key: "data", label: "Data" },
              { key: "evento", label: "Evento" },
              { key: "valor", label: "Valor" },
              { key: "origem", label: "Origem" }
            ]}
            rows={historyRows}
          />
        </ChartCard>
      </div>
    </div>
  );
}
