import { DashboardTopNav } from "@/components/dashboard-top-nav";
import { ChartCard } from "@/components/chart-card";
import { PageShell } from "@/components/page-shell";
import { StatusBadge } from "@/components/status-badge";
import { getFiscalNotes } from "@/lib/api";
import { docStatusLabel, formatBRL, formatDateBR } from "@/lib/formatters";
import { approveNote, postNote, registerProducts, uploadNote } from "./actions";

const toneByStatus: Record<string, "neutral" | "success" | "warning" | "danger" | "info"> = {
  NEEDS_REVIEW: "warning",
  APPROVED: "success",
  REJECTED: "danger",
  UPLOADED: "info"
};

export default async function NotasPage() {
  const notes = (await getFiscalNotes()) ?? [];

  return (
    <PageShell
      title="Notas (OCR)"
      subtitle="Envie a foto/PDF da nota (padaria, posto, boleto). A IA le os itens; voce revisa, lanca no financeiro e cadastra produtos."
      topNav={<DashboardTopNav />}
    >
      <div className="space-y-6">
        <ChartCard title="Enviar nota" meta="A IA extrai fornecedor, valor e itens (cai em revisao manual se a IA nao estiver disponivel)">
          <form action={uploadNote} className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="file"
              name="file"
              accept="image/*,application/pdf"
              required
              className="block w-full text-sm text-text-soft file:mr-4 file:rounded-full file:border-0 file:bg-ink file:px-5 file:py-2.5 file:text-sm file:font-medium file:text-white hover:file:bg-ink/90"
            />
            <button
              type="submit"
              className="shrink-0 rounded-2xl bg-lime px-6 py-3 font-semibold text-ink transition-colors hover:bg-lime-strong"
            >
              Enviar e ler
            </button>
          </form>
        </ChartCard>

        {notes.length === 0 ? (
          <ChartCard title="Fila de notas" meta="Nenhuma nota ainda">
            <div className="rounded-[22px] border border-dashed border-border bg-surface-muted px-6 py-10 text-center text-sm text-text-soft">
              Envie a primeira nota acima.
            </div>
          </ChartCard>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {notes.map((note) => (
              <section key={note.id} className="rounded-[28px] border border-border bg-surface p-5 soft-glow">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-lg font-semibold text-text">
                      {note.supplierName ?? "Fornecedor a revisar"}
                    </div>
                    <div className="mt-0.5 text-xs text-text-faint">
                      {note.type} · {formatDateBR(note.issueDate)} · fonte: {note.source === "AI" ? "IA" : "manual"}
                    </div>
                  </div>
                  <StatusBadge label={docStatusLabel(note.status)} tone={toneByStatus[note.status] ?? "neutral"} />
                </div>

                <div className="mt-3 text-[1.7rem] font-bold tracking-tight text-text tabular-nums">
                  {formatBRL(note.total)}
                </div>

                <div className="mt-3 rounded-2xl border border-border bg-surface-muted p-3">
                  <div className="mb-2 text-[11px] uppercase tracking-[0.14em] text-text-faint">
                    Itens ({note.items.length})
                  </div>
                  <ul className="space-y-1 text-sm text-text-soft">
                    {note.items.slice(0, 5).map((it) => (
                      <li key={it.id} className="flex justify-between gap-3">
                        <span className="truncate">{it.description}</span>
                        <span className="tabular-nums">{formatBRL(it.total)}</span>
                      </li>
                    ))}
                    {note.items.length === 0 ? <li className="text-text-faint">Sem itens lidos — revisar manualmente.</li> : null}
                  </ul>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <form action={postNote}>
                    <input type="hidden" name="id" value={note.id} />
                    <button className="rounded-xl bg-lime px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-lime-strong">
                      Lancar financeiro
                    </button>
                  </form>
                  <form action={registerProducts}>
                    <input type="hidden" name="id" value={note.id} />
                    <button className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-surface-muted">
                      Cadastrar produtos
                    </button>
                  </form>
                  <form action={approveNote}>
                    <input type="hidden" name="id" value={note.id} />
                    <button className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-surface-muted">
                      Aprovar
                    </button>
                  </form>
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
