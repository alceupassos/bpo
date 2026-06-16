"use client";

import type { ApexOptions } from "apexcharts";
import { ApexChart } from "@/components/apex-chart";
import { ChartCard } from "@/components/chart-card";
import { DataTable } from "@/components/data-table";
import { TiltWrapper } from "@/components/tilt-wrapper";

const dotColors = ["bg-icon-blue", "bg-icon-purple", "bg-icon-green", "bg-icon-orange"];

export function ModuleOverview({
  metrics,
  tableTitle,
  tableMeta,
  tableColumns,
  tableRows,
  chartTitle,
  chartMeta,
  chartSeries,
  chartOptions,
  chartType = "bar",
  // sideTitle/sideCopy mantidos por compatibilidade com as páginas (não usados no layout Monetra)
  sideTitle: _sideTitle,
  sideCopy: _sideCopy
}: {
  metrics: { label: string; value: string }[];
  tableTitle: string;
  tableMeta: string;
  tableColumns: { key: string; label: string }[];
  tableRows: Record<string, string>[];
  chartTitle: string;
  chartMeta: string;
  chartSeries: ApexAxisChartSeries | ApexNonAxisChartSeries;
  chartOptions: ApexOptions;
  chartType?: "line" | "area" | "bar" | "donut";
  sideTitle?: string;
  sideCopy?: string;
}) {
  void _sideTitle;
  void _sideCopy;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric, index) => (
          <TiltWrapper key={metric.label} delay={index * 0.05}>
            <article className="h-full rounded-[24px] border border-border bg-surface p-5 soft-glow card-hover">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${dotColors[index % dotColors.length]}`} />
                <div className="text-[12px] font-medium text-text-soft">{metric.label}</div>
              </div>
              <div className="mt-2 text-[1.9rem] font-bold tracking-tight text-text tabular-nums">{metric.value}</div>
            </article>
          </TiltWrapper>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <ChartCard title={tableTitle} meta={tableMeta}>
          <DataTable columns={tableColumns} rows={tableRows} />
        </ChartCard>
        <ChartCard title={chartTitle} meta={chartMeta}>
          <ApexChart type={chartType} height={300} series={chartSeries} options={chartOptions} />
        </ChartCard>
      </div>
    </div>
  );
}
