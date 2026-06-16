"use client";

import type { ApexOptions } from "apexcharts";
import { motion } from "framer-motion";
import { ApexChart } from "@/components/apex-chart";
import { ChartCard } from "@/components/chart-card";
import { DataTable } from "@/components/data-table";

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
  sideTitle,
  sideCopy
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
  sideTitle: string;
  sideCopy: string;
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric, index) => (
          <motion.article
            key={metric.label}
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.2 }}
            className="rounded-[24px] border border-border bg-[#111413] p-5 soft-glow"
          >
            <div className="text-[11px] uppercase tracking-[0.18em] text-text-faint">{metric.label}</div>
            <div className="mt-3 text-[2rem] font-semibold text-white">{metric.value}</div>
          </motion.article>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <ChartCard title={tableTitle} meta={tableMeta}>
          <DataTable columns={tableColumns} rows={tableRows} />
        </ChartCard>
        <ChartCard title={sideTitle} meta={sideCopy}>
          <div className="space-y-4">
            <div className="rounded-[24px] border border-border bg-[#171c1a] p-4">
              <div className="text-[11px] uppercase tracking-[0.16em] text-text-faint">Leitura rapida</div>
              <p className="mt-3 text-sm leading-6 text-text-soft">
                {sideCopy}
              </p>
            </div>
            <div className="rounded-[24px] border border-border bg-[#171c1a] p-4">
              <div className="text-[11px] uppercase tracking-[0.16em] text-text-faint">Checklist do modulo</div>
              <ul className="mt-3 space-y-3 text-sm text-white">
                <li>Filtros por periodo, empresa e status</li>
                <li>Acoes por linha sem tirar o operador da rotina</li>
                <li>Visual alinhado ao shell dark do dashboard</li>
              </ul>
            </div>
          </div>
        </ChartCard>
      </div>

      <ChartCard title={chartTitle} meta={chartMeta}>
        <ApexChart type={chartType} height={280} series={chartSeries} options={chartOptions} />
      </ChartCard>
    </div>
  );
}
