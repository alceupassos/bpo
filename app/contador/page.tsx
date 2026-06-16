"use client";

import React, { useState } from "react";
import { DashboardTopNav } from "@/components/dashboard-top-nav";
import { PageShell } from "@/components/page-shell";
import { ChartCard } from "@/components/chart-card";
import { DataTable } from "@/components/data-table";
import { TiltWrapper } from "@/components/tilt-wrapper";
import { accountantExportLogs } from "@/lib/data";
import { CheckCircle2, AlertCircle, FileZip, Send, Download, RefreshCw, Check } from "lucide-react";

export default function ContadorPage() {
  const [exporting, setExporting] = useState(false);
  const [exportDone, setExportDone] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, sender: "Contador Alfa", time: "15/06 09:15", text: "Ola! Preciso dos XMLs de notas emitidas e do extrato bancario consolidado de Maio para fechamento." },
    { id: 2, sender: "Voce (BPO)", time: "15/06 10:24", text: "Prontinho! Acabei de rodar a exportacao completa de XML e o extrato conciliado. O log de download ja esta registrado abaixo." },
    { id: 3, sender: "Contador Alfa", time: "15/06 10:30", text: "Excelente! Dados recebidos. Vou validar as informacoes e aviso se houver alguma divergencia." }
  ]);
  const [inputText, setInputText] = useState("");

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    setMessages([
      ...messages,
      {
        id: messages.length + 1,
        sender: "Voce (BPO)",
        time: "Hoje " + new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        text: inputText
      }
    ]);
    setInputText("");
  };

  const runExport = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      setExportDone(true);
    }, 2000);
  };

  const checklistItems = [
    { label: "Conciliacao de extratos bancarios", status: "success", detail: "684 movimentos pareados (100%)" },
    { label: "Fechamento de caixas diarios", status: "success", detail: "Saldos conferidos e fechados" },
    { label: "Notas Fiscais de Servico (OCR)", status: "success", detail: "118 XMLs arquivados e validados" },
    { label: "Apuração de DAS e guias fiscais", status: "success", detail: "DAS Maio calculado (R$ 4.250,00)" },
    { label: "Pendencias operacionais do cliente", status: "warning", detail: "1 aprovacao de frete restante" }
  ];

  return (
    <PageShell
      title="Integração Contador"
      subtitle="Exporte documentos fiscais e relatorios conciliados diretamente para a sua contabilidade."
      topNav={<DashboardTopNav />}
    >
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          {/* Closed Period Export Module */}
          <TiltWrapper>
            <section className="rounded-[28px] border border-border bg-surface p-6 soft-glow">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-text">Fechamento Mensal & Exportacao</h3>
                  <p className="text-xs text-text-soft">Mes de referencia: **Maio/2026** — Compilar arquivos fiscais e extrato consolidado</p>
                </div>
                
                {exportDone ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-success/10 border border-success/30 px-3 py-1 text-xs font-semibold text-success">
                    <Check className="h-3.5 w-3.5" /> Arquivo Pronto
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 border border-warning/30 px-3 py-1 text-xs font-semibold text-warning">
                    Fechamento Aberto
                  </span>
                )}
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-border bg-surface-muted p-4 text-center">
                  <div className="text-xl font-bold text-text tabular-nums">118</div>
                  <div className="text-[10px] text-text-faint uppercase tracking-wider mt-1">Notas Fiscais XML</div>
                </div>
                <div className="rounded-2xl border border-border bg-surface-muted p-4 text-center">
                  <div className="text-xl font-bold text-text tabular-nums">684</div>
                  <div className="text-[10px] text-text-faint uppercase tracking-wider mt-1">Lançamentos Conciliados</div>
                </div>
                <div className="rounded-2xl border border-border bg-surface-muted p-4 text-center">
                  <div className="text-xl font-bold text-text tabular-nums">R$ 13.630</div>
                  <div className="text-[10px] text-text-faint uppercase tracking-wider mt-1">Resultado Liquido</div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between rounded-2xl border border-border bg-surface-muted p-5">
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-lime-soft text-lime">
                    <FileZip className="h-6 w-6" />
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-text">Fechamento_Maio_2026.zip</div>
                    <div className="text-xs text-text-soft">XMLs de Notas, Extrato OFX e DRE Mensal</div>
                  </div>
                </div>

                {exporting ? (
                  <button disabled className="inline-flex items-center gap-1.5 rounded-xl bg-lime/50 px-4 py-2.5 text-sm font-semibold text-ink">
                    <RefreshCw className="h-4 w-4 animate-spin" /> Compilando...
                  </button>
                ) : exportDone ? (
                  <a href="#" className="inline-flex items-center gap-1.5 rounded-xl bg-lime px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-lime-strong">
                    <Download className="h-4 w-4" /> Baixar Pacote
                  </a>
                ) : (
                  <button onClick={runExport} className="inline-flex items-center gap-1.5 rounded-xl bg-lime px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-lime-strong">
                    Compilar Fechamento
                  </button>
                )}
              </div>
            </section>
          </TiltWrapper>

          {/* Export Logs */}
          <ChartCard title="Log de Envios Contabilidade" meta="Historico de arquivos recebidos pela contabilidade">
            <DataTable
              columns={[
                { key: "mes", label: "Mes Referencia" },
                { key: "tipo", label: "Arquivos Enviados" },
                { key: "data", label: "Data de Envio" },
                { key: "destinatario", label: "Contabilidade" },
                { key: "status", label: "Status" }
              ]}
              rows={accountantExportLogs}
            />
          </ChartCard>
        </div>

        {/* Right Column: Pre-closing Checklist and Chat */}
        <div className="space-y-6">
          {/* Pre-closing Checklist validation */}
          <TiltWrapper>
            <section className="rounded-[28px] border border-border bg-surface p-5 soft-glow">
              <h3 className="text-base font-semibold text-text">Validação Pré-Fechamento</h3>
              <p className="text-xs text-text-soft">Verificacao dos requisitos antes da exportacao</p>

              <div className="mt-4 space-y-3">
                {checklistItems.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 rounded-xl border border-border bg-surface-muted p-3">
                    {item.status === "success" ? (
                      <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="text-xs font-semibold text-text">{item.label}</div>
                      <div className="text-[10px] text-text-soft mt-0.5">{item.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </TiltWrapper>

          {/* Chat with Accountant */}
          <TiltWrapper>
            <section className="rounded-[28px] border border-border bg-surface p-5 soft-glow flex flex-col h-[320px]">
              <div className="border-b border-border pb-3 shrink-0">
                <h3 className="text-sm font-semibold text-text">Contato Contabilidade</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                  <span className="text-[10px] text-text-soft">Contabilidade Alfa (Online)</span>
                </div>
              </div>

              {/* Message History */}
              <div className="flex-1 overflow-y-auto py-3 space-y-2.5 min-h-0 text-xs scrollbar-thin">
                {messages.map((msg) => {
                  const isYou = msg.sender.includes("Voce");
                  return (
                    <div key={msg.id} className={`flex flex-col ${isYou ? "items-end" : "items-start"}`}>
                      <div className="text-[9px] text-text-faint mb-0.5">{msg.sender} · {msg.time}</div>
                      <div className={`rounded-xl px-3 py-2 max-w-[85%] leading-normal ${isYou ? "bg-lime text-ink font-medium" : "bg-surface-muted text-text"}`}>
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="mt-2 flex gap-2 border-t border-border pt-3 shrink-0">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Falar com o contador..."
                  className="flex-1 rounded-xl border border-border bg-surface-muted px-3 py-2 text-xs text-text outline-none focus:border-lime"
                />
                <button type="submit" className="grid h-9 w-9 place-items-center rounded-xl bg-lime text-ink hover:bg-lime-strong shrink-0">
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </section>
          </TiltWrapper>
        </div>
      </div>
    </PageShell>
  );
}
