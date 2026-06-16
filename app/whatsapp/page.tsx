import Link from "next/link";
import clsx from "clsx";
import { Paperclip } from "lucide-react";
import { DashboardTopNav } from "@/components/dashboard-top-nav";
import { PageShell } from "@/components/page-shell";
import { getChatMessages, getChatThreads } from "@/lib/api";
import { sendMessage, uploadToChat } from "./actions";

export default async function WhatsappPage({
  searchParams
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  const params = await searchParams;
  const threads = (await getChatThreads()) ?? [];
  const activeId = params.t ?? threads[0]?.id ?? "";
  const messages = activeId ? (await getChatMessages(activeId)) ?? [] : [];
  const activeThread = threads.find((t) => t.id === activeId);

  return (
    <PageShell
      title="WhatsApp"
      subtitle="Converse com clientes e fornecedores. Anexos de notas caem direto no leitor de NF."
      topNav={<DashboardTopNav />}
    >
      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <section className="rounded-[28px] border border-border bg-surface p-3 soft-glow">
          <div className="px-2 py-2 text-[11px] uppercase tracking-[0.14em] text-text-faint">Conversas</div>
          <div className="space-y-1">
            {threads.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-text-soft">Nenhuma conversa.</div>
            ) : (
              threads.map((t) => (
                <Link
                  key={t.id}
                  href={`/whatsapp?t=${t.id}`}
                  className={clsx(
                    "block rounded-2xl px-3 py-3 transition-colors",
                    t.id === activeId ? "bg-surface-muted" : "hover:bg-surface-muted"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-icon-green-bg font-semibold text-icon-green">
                      {t.contactName.slice(0, 2).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-text">{t.contactName}</div>
                      <div className="truncate text-xs text-text-faint">{t.contactPhone ?? "—"}</div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        <section className="flex min-h-[60vh] flex-col rounded-[28px] border border-border bg-surface soft-glow">
          <div className="border-b border-border px-5 py-4">
            <div className="font-semibold text-text">{activeThread?.contactName ?? "Selecione uma conversa"}</div>
            {activeThread?.contactPhone ? <div className="text-xs text-text-faint">{activeThread.contactPhone}</div> : null}
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto px-5 py-4">
            {messages.map((m) => (
              <div key={m.id} className={clsx("flex", m.direction === "OUT" ? "justify-end" : "justify-start")}>
                <div
                  className={clsx(
                    "max-w-[78%] rounded-2xl px-3.5 py-2 text-sm",
                    m.direction === "OUT" ? "bg-lime text-ink" : "bg-surface-muted text-text"
                  )}
                >
                  {m.body}
                  {m.noteId ? (
                    <Link href="/notas" className="mt-1 block text-xs font-medium underline">
                      Ver nota recebida
                    </Link>
                  ) : null}
                </div>
              </div>
            ))}
            {messages.length === 0 && activeId ? (
              <div className="py-10 text-center text-sm text-text-soft">Sem mensagens ainda.</div>
            ) : null}
          </div>

          {activeId ? (
            <div className="space-y-2 border-t border-border p-3">
              <form action={sendMessage} className="flex items-center gap-2">
                <input type="hidden" name="threadId" value={activeId} />
                <input
                  name="body"
                  autoComplete="off"
                  placeholder="Escreva uma mensagem…"
                  className="flex-1 rounded-full border border-border bg-surface px-4 py-3 text-sm text-text outline-none focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-ink/20"
                />
                <button
                  type="submit"
                  className="rounded-full bg-lime px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-lime-strong"
                >
                  Enviar
                </button>
              </form>
              <form action={uploadToChat} className="flex items-center gap-2">
                <input type="hidden" name="threadId" value={activeId} />
                <Paperclip className="h-4 w-4 text-text-faint" aria-hidden="true" />
                <input
                  type="file"
                  name="file"
                  accept="image/*,application/pdf"
                  className="block flex-1 text-xs text-text-soft file:mr-3 file:rounded-full file:border-0 file:bg-surface-muted file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-text"
                />
                <button
                  type="submit"
                  className="rounded-full border border-border px-4 py-2 text-xs font-medium text-text transition-colors hover:bg-surface-muted"
                >
                  Anexar nota
                </button>
              </form>
            </div>
          ) : null}
        </section>
      </div>
    </PageShell>
  );
}
