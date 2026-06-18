"use client";

import { useState } from "react";
import { DashboardTopNav } from "@/components/dashboard-top-nav";
import { PageShell } from "@/components/page-shell";
import { ChartCard } from "@/components/chart-card";
import { DataTable } from "@/components/data-table";
import { TiltWrapper } from "@/components/tilt-wrapper";
import type { AccountingExport } from "@/lib/api";
import { accountantExportLogs } from "@/lib/data";
import { accountingExportToRow } from "@/lib/formatters";
import { generateExport } from "@/app/contador/actions";
import { AlertCircle, Check, CheckCircle2, Download, FileArchive, RefreshCw } from "lucide-react";

export function ContadorScreen({
  exports,
  isDemo
}: {
  exports: AccountingExport[] | null;
  isDemo: boolean;
}) {
  const [exporting, setExporting] = useState(false);
  const latest = exports?.[0];
  const exportDone = latest?.status === "GERADO";

  const rows = exports ? exports.map(accountingExportToRow) : accountantExportLogs;

  const checklistItems = [
    { label: "Conciliacao de extratos bancarios", status: "success", detail: "Movimentos pareados" },
    { label: "Fechamento de caixas diarios", status: "success", detail: "Saldos conferidos e fechados" },
    { label: "Notas Fiscais de Servico (OCR)", status: "success", detail: "XMLs arquivados e validados" },
    { label: "Apuracao de DAS e guias fiscais", status: "success", detail: "DAS calculado" },
    { label: "Pendencias operacionais do cliente", status: exportDone ? "success" : "warning", detail: exportDone ? "Fechamento pronto" : "Exportacao pendente" }
  ];

  return (
    <PageShell
      title="Integracao Contador"
      subtitle="Exporte documentos fiscais e relatorios conciliados diretamente para a sua contabilidade."
      topNav={<DashboardTopNav />}
      isDemo={isDemo}
    >
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <TiltWrapper>
            <section className="rounded-[28px] border border-border bg-surface p-6 soft-glow">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-text">Fechamento Mensal & Exportacao</h3>
                  <p className="text-xs text-text-soft">
                    Mes de referencia: {latest?.competence ?? "2026-05"} — Compilar arquivos fiscais e extrato consolidado
                  </p>
                </div>
                {exportDone ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-semibold text-success">
                    <Check className="h-3.5 w-3.5" /> Arquivo Pronto
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full border border-warning/30 bg-warning/10 px-3 py-1 text-xs font-semibold text-warning">
                    Fechamento Aberto
                  </span>
                )}
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-border bg-surface-muted p-4 text-center">
                  <div className="text-xl font-bold text-text tabular-nums">{latest?.notesCount ?? 118}</div>
                  <div className="mt-1 text-[10px] uppercase tracking-wider text-text-faint">Notas Fiscais XML</div>
                </div>
                <div className="rounded-2xl border border-border bg-surface-muted p-4 text-center">
                  <div className="text-xl font-bold text-text tabular-nums">{latest?.entriesCount ?? 684}</div>
                  <div className="mt-1 text-[10px] uppercase tracking-wider text-text-faint">Lancamentos Conciliados</div>
                </div>
                <div className="rounded-2xl border border-border bg-surface-muted p-4 text-center">
                  <div className="text-xl font-bold text-text tabular-nums">{latest?.payrollCount ?? 3}</div>
                  <div className="mt-1 text-[10px] uppercase tracking-wider text-text-faint">Folhas processadas</div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between rounded-2xl border border-border bg-surface-muted p-5">
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-lime-soft text-lime">
                    <FileArchive className="h-6 w-6" />
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-text">
                      Fechamento_{latest?.competence ?? "2026-05"}.zip
                    </div>
                    <div className="text-xs text-text-soft">XMLs de Notas, Extrato OFX e DRE Mensal</div>
                  </div>
                </div>

                {exporting ? (
                  <button disabled className="inline-flex items-center gap-1.5 rounded-xl bg-lime/50 px-4 py-2.5 text-sm font-semibold text-ink">
                    <RefreshCw className="h-4 w-4 animate-spin" /> Compilando...
                  </button>
                ) : exportDone ? (
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-lime px-4 py-2.5 text-sm font-semibold text-ink">
                    <Download className="h-4 w-4" /> Gerado
                  </span>
                ) : (
                  <form action={generateExport}>
                    <input type="hidden" name="competence" value={latest?.competence ?? "2026-05"} />
                    <button
                      type="submit"
                      onClick={() => setExporting(true)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-lime px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-lime-strong"
                    >
                      Compilar Fechamento
                    </button>
                  </form>
                )}
              </div>
            </section>
          </TiltWrapper>

          <ChartCard title="Log de Envios Contabilidade" meta="Historico de arquivos recebidos pela contabilidade">
            <DataTable
              columns={[
                { key: "mes", label: "Mes Referencia" },
                { key: "tipo", label: "Arquivos Enviados" },
                { key: "data", label: "Data de Envio" },
                { key: "destinatario", label: "Contabilidade" },
                { key: "status", label: "Status" }
              ]}
              rows={rows}
            />
          </ChartCard>
        </div>

        <TiltWrapper>
          <section className="rounded-[28px] border border-border bg-surface p-5 soft-glow">
            <h3 className="text-base font-semibold text-text">Validacao Pre-Fechamento</h3>
            <p className="text-xs text-text-soft">Verificacao dos requisitos antes da exportacao</p>
            <div className="mt-4 space-y-3">
              {checklistItems.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 rounded-xl border border-border bg-surface-muted p-3">
                  {item.status === "success" ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  ) : (
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                  )}
                  <div>
                    <div className="text-xs font-semibold text-text">{item.label}</div>
                    <div className="mt-0.5 text-[10px] text-text-soft">{item.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </TiltWrapper>
      </div>
    </PageShell>
  );
}