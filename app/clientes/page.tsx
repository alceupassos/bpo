import { AiInsightCard } from "@/components/ai-insight-card";
import { DashboardTopNav } from "@/components/dashboard-top-nav";
import { inadimplenciaInsight } from "@/lib/ai-insight-messages";
import { ChartCard } from "@/components/chart-card";
import { DataTable } from "@/components/data-table";
import { PageShell } from "@/components/page-shell";
import { getCustomers, apiErrorTracker } from "@/lib/api";
import { formatBRL } from "@/lib/formatters";
import { chargeByQr, createCustomer } from "./actions";

const inputClass =
  "w-full rounded-2xl border border-border bg-surface px-4 py-3 text-text outline-none focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-ink/20";
const labelClass = "mb-1 block text-[11px] uppercase tracking-[0.14em] text-text-faint";

export default async function ClientesPage() {
  const customers = (await getCustomers()) ?? [];
  const rows = customers.map((c) => ({
    cliente: c.name,
    documento: c.document ?? "-",
    qr: c.qrToken ?? "-",
    limite: formatBRL(c.creditLimit),
    saldo: formatBRL(c.balance)
  }));

  return (
    <PageShell
      title="Clientes"
      subtitle="Crediário e identificação no caixa por reconhecimento facial, digital (WebAuthn) ou QR Code — para quem já é cadastrado."
      topNav={<DashboardTopNav />}
      isDemo={apiErrorTracker().hasError}
    >
      <AiInsightCard
        title="Risco de inadimplencia"
        message={inadimplenciaInsight(customers)}
        source="crediario + limites"
        className="mb-6"
      />

      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <ChartCard title="Clientes cadastrados" meta={`${customers.length} clientes`}>
          <DataTable
            columns={[
              { key: "cliente", label: "Cliente" },
              { key: "documento", label: "Documento" },
              { key: "qr", label: "QR" },
              { key: "limite", label: "Limite" },
              { key: "saldo", label: "Saldo devedor" }
            ]}
            rows={rows}
          />
          <p className="mt-3 text-xs text-text-soft">
            A identificação facial usa <strong>face-api.js</strong> (open-source) e a digital usa{" "}
            <strong>WebAuthn</strong> nativo do navegador — capturados no terminal do caixa. Aqui,
            o atalho por <strong>QR</strong> demonstra o fluxo de cobrança no crediário.
          </p>
          <p className="mt-2 text-xs text-text-faint">
            <strong>LGPD:</strong> o descritor facial é dado biométrico sensível (art. 11). Exige consentimento
            explícito na captura, é criptografado em repouso e mantido apenas enquanto o crediário estiver ativo
            (retenção máxima sugerida: 24 meses após última movimentação).
          </p>
        </ChartCard>

        <div className="space-y-6">
          <ChartCard title="Cobrar por QR Code" meta="Cliente identificado → venda no crediário">
            <form action={chargeByQr} className="space-y-3">
              <div>
                <label htmlFor="qrToken" className={labelClass}>
                  Token do QR
                </label>
                <input id="qrToken" name="qrToken" required placeholder="Ex.: QR-JOAO-001" className={inputClass} autoComplete="off" />
              </div>
              <div>
                <label htmlFor="amount" className={labelClass}>
                  Valor da venda
                </label>
                <input id="amount" name="amount" type="number" step="0.01" inputMode="decimal" required placeholder="0,00" className={inputClass} />
              </div>
              <button
                type="submit"
                className="w-full rounded-2xl bg-lime px-4 py-3 font-semibold text-ink transition-colors hover:bg-lime-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
              >
                Lançar na conta do cliente
              </button>
            </form>
          </ChartCard>

          <ChartCard title="Novo cliente" meta="Cadastro rápido">
            <form action={createCustomer} className="space-y-3">
              <div>
                <label htmlFor="name" className={labelClass}>
                  Nome
                </label>
                <input id="name" name="name" required placeholder="Nome do cliente" className={inputClass} autoComplete="off" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="document" className={labelClass}>
                    CPF
                  </label>
                  <input id="document" name="document" placeholder="000.000.000-00" className={inputClass} autoComplete="off" />
                </div>
                <div>
                  <label htmlFor="creditLimit" className={labelClass}>
                    Limite
                  </label>
                  <input id="creditLimit" name="creditLimit" type="number" step="0.01" inputMode="decimal" placeholder="0,00" className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="phone" className={labelClass}>
                    Telefone
                  </label>
                  <input id="phone" name="phone" placeholder="+55 ..." className={inputClass} autoComplete="off" />
                </div>
                <div>
                  <label htmlFor="qrToken" className={labelClass}>
                    Token QR
                  </label>
                  <input id="qrToken" name="qrToken" placeholder="QR-..." className={inputClass} autoComplete="off" />
                </div>
              </div>
              <button
                type="submit"
                className="w-full rounded-2xl border border-border bg-surface-muted px-4 py-3 font-semibold text-text transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
              >
                Cadastrar cliente
              </button>
            </form>
          </ChartCard>
        </div>
      </div>
    </PageShell>
  );
}
