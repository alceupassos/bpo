import Link from "next/link";
import { TiltWrapper } from "@/components/tilt-wrapper";

export function CtaCard({
  title = "Importe suas notas",
  copy = "Envie cupons e notas — a IA le e voce lanca em segundos.",
  actionLabel = "Importar nota",
  href = "/notas"
}: {
  title?: string;
  copy?: string;
  actionLabel?: string;
  href?: string;
}) {
  return (
    <TiltWrapper>
      <section className="rounded-[24px] border border-border bg-surface p-5 soft-glow">
        <h3 className="text-xl font-bold tracking-tight text-text">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-text-soft">{copy}</p>
        <Link
          href={href as never}
          className="mt-4 block rounded-2xl bg-lime px-4 py-3 text-center font-semibold text-ink transition-colors hover:bg-lime-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
        >
          {actionLabel}
        </Link>
      </section>
    </TiltWrapper>
  );
}
