import { Sparkles } from "lucide-react";

export interface AiInsightCardProps {
  title: string;
  message?: string | null;
  source?: string;
  className?: string;
}

/** Insight IA seletivo — visivel apenas quando ha dado util e confiavel. */
export function AiInsightCard({ title, message, source, className = "" }: AiInsightCardProps) {
  if (!message?.trim()) return null;

  return (
    <section
      className={`rounded-[22px] border border-lime/25 bg-lime/5 px-5 py-4 backdrop-blur-sm ${className}`}
      aria-label="Insight de inteligencia artificial"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-lime/20 text-lime">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-text">{title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-text-soft">{message}</p>
          {source ? (
            <p className="mt-2 text-[10px] uppercase tracking-wider text-text-faint">Fonte: {source}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}