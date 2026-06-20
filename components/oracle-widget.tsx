"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X, Send } from "lucide-react";
import { askOracle } from "@/app/actions/oracle";

interface ChatMsg {
  id: number;
  role: "user" | "assistant";
  text: string;
}

const SUGGESTIONS = [
  "Quanto vendi hoje?",
  "Quais contas vencem essa semana?",
  "O que é a conciliação?"
];

const WELCOME = "Olá! Sou o Oráculo Angra IA. Posso responder sobre vendas, contas a pagar e a receber, conciliação e estoque. Como posso ajudar?";

let msgSeq = 1;

export function OracleWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([
    { id: 0, role: "assistant", text: WELCOME }
  ]);

  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Esc fecha o painel.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Foco no input ao abrir.
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Rola para a última mensagem.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || loading) return;
    const userMsg: ChatMsg = { id: msgSeq++, role: "user", text: q };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await askOracle(q);
      setMessages((m) => [...m, { id: msgSeq++, role: "assistant", text: res.answer }]);
    } catch {
      setMessages((m) => [
        ...m,
        { id: msgSeq++, role: "assistant", text: "Tive um problema ao responder. Pode tentar de novo?" }
      ]);
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    void send(input);
  }

  return (
    <>
      {/* Botão flutuante */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Fechar Oráculo Angra IA" : "Abrir Oráculo Angra IA"}
        aria-expanded={open}
        className="fixed bottom-5 right-5 z-[55] flex items-center gap-2 rounded-full bg-lime px-4 py-3 text-sm font-bold text-ink shadow-[0_8px_30px_rgba(159,232,112,0.35)] transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40"
      >
        <Sparkles className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">Oráculo Angra IA</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-label="Oráculo Angra IA"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ type: "spring", damping: 26, stiffness: 260 }}
            className="fixed bottom-[5.5rem] right-5 z-[55] flex h-[30rem] max-h-[75vh] w-[min(24rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-[24px] border border-border bg-surface shadow-2xl"
          >
            {/* Cabeçalho */}
            <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-lime/20 text-lime">
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="leading-tight">
                  <p className="text-sm font-bold text-text">Oráculo Angra IA</p>
                  <p className="text-[11px] text-text-faint">Assistente do seu sistema</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fechar"
                className="grid h-8 w-8 place-items-center rounded-full text-text-soft transition-colors hover:bg-surface-muted hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime/50"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            {/* Histórico */}
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
                >
                  <p
                    className={
                      m.role === "user"
                        ? "max-w-[85%] rounded-2xl rounded-br-sm bg-lime px-3.5 py-2 text-sm font-medium text-ink"
                        : "max-w-[85%] rounded-2xl rounded-bl-sm border border-border bg-bg px-3.5 py-2 text-sm leading-relaxed text-text"
                    }
                  >
                    {m.text}
                  </p>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <p className="rounded-2xl rounded-bl-sm border border-border bg-bg px-3.5 py-2 text-sm text-text-soft">
                    Angra IA está pensando…
                  </p>
                </div>
              )}

              {/* Sugestões só no início da conversa */}
              {messages.length <= 1 && !loading && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => void send(s)}
                      className="rounded-full border border-border bg-bg px-3 py-1.5 text-xs font-medium text-text-soft transition-colors hover:border-lime/50 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime/50"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Entrada */}
            <form onSubmit={onSubmit} className="flex items-center gap-2 border-t border-border bg-surface px-3 py-3">
              <label htmlFor="oracle-input" className="sr-only">
                Pergunte ao Oráculo Angra IA
              </label>
              <input
                id="oracle-input"
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Pergunte algo…"
                autoComplete="off"
                className="min-w-0 flex-1 rounded-full border border-border bg-bg px-4 py-2 text-sm text-text placeholder:text-text-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime/50"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                aria-label="Enviar pergunta"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-lime text-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
