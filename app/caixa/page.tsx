import { DashboardTopNav } from "@/components/dashboard-top-nav";
import { ChartCard } from "@/components/chart-card";
import { DataTable } from "@/components/data-table";
import { PageShell } from "@/components/page-shell";
import { getCashCurrent } from "@/lib/api";
import { formatBRL } from "@/lib/formatters";
import { addCashEntry, closeCash, openCash, uploadReceipt } from "./actions";

const typeLabel: Record<string, string> = {
  SALE: "Venda",
  IN: "Entrada",
  OUT: "Saida",
  SANGRIA: "Sangria",
  SUPRIMENTO: "Suprimento"
};

const inputClass =
  "w-full rounded-2xl border border-border bg-surface px-4 py-3 text-text outline-none focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-ink/20";

export default async function CaixaPage() {
  const session = await getCashCurrent();

  return (
    <PageShell
      title="Caixa"
      subtitle="Frente de caixa: abra a sessao, registre vendas e movimentos, e feche com o saldo apurado."
      topNav={<DashboardTopNav />}
    >
      {!session ? (
        <ChartCard title="Abrir caixa" meta="Nenhuma sessao aberta no momento">
          <form action={openCash} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label htmlFor="openingAmount" className="mb-1 block text-[11px] uppercase tracking-[0.14em] text-text-faint">
                Fundo de troco (abertura)
              </label>
              <input id="openingAmount" name="openingAmount" type="number" step="0.01" inputMode="decimal" defaultValue="0" className={inputClass} />
            </div>
            <button
              type="submit"
              className="rounded-2xl bg-lime px-6 py-3 font-semibold text-ink transition-colors hover:bg-lime-strong"
            >
              Abrir caixa
            </button>
          </form>
        </ChartCard>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <article className="rounded-[24px] border border-border bg-surface p-5 soft-glow">
              <div className="text-[12px] font-medium text-text-soft">Saldo atual</div>
              <div className="mt-2 text-[1.9rem] font-bold tracking-tight text-text tabular-nums">
                {formatBRL(session.balance ?? 0)}
              </div>
            </article>
            <article className="rounded-[24px] border border-border bg-surface p-5 soft-glow">
              <div className="text-[12px] font-medium text-text-soft">Abertura</div>
              <div className="mt-2 text-[1.9rem] font-bold tracking-tight text-text tabular-nums">
                {formatBRL(session.openingAmount)}
              </div>
            </article>
            <article className="rounded-[24px] border border-border bg-surface p-5 soft-glow">
              <div className="text-[12px] font-medium text-text-soft">Movimentos</div>
              <div className="mt-2 text-[1.9rem] font-bold tracking-tight text-text tabular-nums">
                {session.entries.length}
              </div>
            </article>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
            <ChartCard title="Movimentos do caixa" meta="Sessao aberta">
              <DataTable
                columns={[
                  { key: "tipo", label: "Tipo" },
                  { key: "descricao", label: "Descricao" },
                  { key: "forma", label: "Forma" },
                  { key: "valor", label: "Valor" }
                ]}
                rows={session.entries.map((e) => ({
                  tipo: typeLabel[e.type] ?? e.type,
                  descricao: e.description ?? "-",
                  forma: e.paymentMethod ?? "-",
                  valor: formatBRL(e.amount)
                }))}
              />
            </ChartCard>

            <div className="space-y-6">
              <ChartCard title="Novo movimento" meta="Registrar venda ou ajuste">
                <form action={addCashEntry} className="space-y-3">
                  <input type="hidden" name="sessionId" value={session.id} />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="type" className="mb-1 block text-[11px] uppercase tracking-[0.14em] text-text-faint">Tipo</label>
                      <select id="type" name="type" className={inputClass}>
                        <option value="SALE">Venda</option>
                        <option value="IN">Entrada</option>
                        <option value="OUT">Saida</option>
                        <option value="SANGRIA">Sangria</option>
                        <option value="SUPRIMENTO">Suprimento</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="amount" className="mb-1 block text-[11px] uppercase tracking-[0.14em] text-text-faint">Valor</label>
                      <input id="amount" name="amount" type="number" step="0.01" inputMode="decimal" required className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="paymentMethod" className="mb-1 block text-[11px] uppercase tracking-[0.14em] text-text-faint">Forma</label>
                    <input id="paymentMethod" name="paymentMethod" autoComplete="off" placeholder="PIX, Dinheiro, Cartao…" className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor="description" className="mb-1 block text-[11px] uppercase tracking-[0.14em] text-text-faint">Descricao</label>
                    <input id="description" name="description" autoComplete="off" className={inputClass} />
                  </div>
                  <button type="submit" className="w-full rounded-2xl bg-lime px-4 py-3 font-semibold text-ink transition-colors hover:bg-lime-strong">
                    Lancar movimento
                  </button>
                </form>
              </ChartCard>

              <ChartCard title="Recibo automático" meta="Foto de café, gasolina, etc. → saída no caixa (IA)">
                <form action={uploadReceipt} className="space-y-3">
                  <input type="hidden" name="sessionId" value={session.id} />
                  <input
                    id="file"
                    name="file"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    required
                    className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-text-soft file:mr-3 file:rounded-xl file:border-0 file:bg-lime file:px-3 file:py-1.5 file:font-semibold file:text-ink"
                  />
                  <button type="submit" className="w-full rounded-2xl bg-lime px-4 py-3 font-semibold text-ink transition-colors hover:bg-lime-strong">
                    Ler recibo e lançar saída
                  </button>
                  <p className="text-[11px] text-text-faint">
                    Sem IA configurada, o lançamento entra como “conferir” para revisão manual — nunca trava.
                  </p>
                </form>
              </ChartCard>

              <form action={closeCash}>
                <input type="hidden" name="sessionId" value={session.id} />
                <button type="submit" className="w-full rounded-2xl border border-border bg-surface px-4 py-3 font-semibold text-text transition-colors hover:bg-surface-muted">
                  Fechar caixa
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
