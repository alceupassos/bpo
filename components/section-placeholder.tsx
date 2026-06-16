"use client";

import { motion } from "framer-motion";
import { ArrowRight, FolderKanban, Sparkles } from "lucide-react";
import { ChartCard } from "@/components/chart-card";
import { DataTable } from "@/components/data-table";

export function SectionPlaceholder({
  metrics,
  callout,
  rows
}: {
  metrics: { label: string; value: string }[];
  callout: string;
  rows: { bloco: string; foco: string; proximaAcao: string }[];
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

      <div className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
        <ChartCard title="Recorte operacional da superficie" meta="Blocos que seguem o mesmo design system do dashboard">
          <DataTable
            columns={[
              { key: "bloco", label: "Bloco" },
              { key: "foco", label: "Foco" },
              { key: "proximaAcao", label: "Proxima acao" }
            ]}
            rows={rows}
          />
        </ChartCard>
        <motion.section
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          className="panel-grid rounded-[26px] border border-border bg-[#111413] p-6 soft-glow"
        >
          <div className="flex h-full flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-text-faint">
                <Sparkles className="h-4 w-4" />
                Evolucao planejada
              </div>
              <h3 className="mt-4 text-[2rem] leading-tight text-white">
                {callout}
              </h3>
              <p className="mt-3 text-sm leading-6 text-text-soft">
                Esta superficie ja nasce conectada ao mesmo shell, filtros globais e componentes base do painel principal.
              </p>
            </div>
            <div className="mt-8 space-y-3">
              <div className="flex items-center justify-between rounded-2xl border border-border bg-[#171c1a] px-4 py-4">
                <div className="flex items-center gap-3">
                  <FolderKanban className="h-4 w-4 text-text-faint" />
                  <span className="text-sm text-white">Backlog visual e funcional</span>
                </div>
                <ArrowRight className="h-4 w-4 text-text-faint" />
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-border bg-[#171c1a] px-4 py-4">
                <div className="flex items-center gap-3">
                  <FolderKanban className="h-4 w-4 text-text-faint" />
                  <span className="text-sm text-white">Seeds e regras do modulo</span>
                </div>
                <ArrowRight className="h-4 w-4 text-text-faint" />
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
