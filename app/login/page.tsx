import { loginAction } from "./actions";
import { TiltWrapper } from "@/components/tilt-wrapper";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; expired?: string }>;
}) {
  const params = await searchParams;
  const hasError = params?.error === "1";
  const sessionExpired = params?.expired === "1";

  return (
    <div className="grid min-h-screen place-items-center bg-bg panel-grid p-6">
      <TiltWrapper className="w-full max-w-[420px]">
        <div className="rounded-[32px] border border-border bg-surface p-8 soft-glow">
        <div className="mb-1 flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-lime text-lg font-black text-ink">a</span>
          <span className="text-2xl font-extrabold tracking-tight text-text">angra</span>
        </div>
        <p className="mb-6 text-sm text-text-soft">BPO Financeiro — acesse sua operacao</p>

        <form action={loginAction} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-[11px] uppercase tracking-[0.14em] text-text-faint">
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="username"
              inputMode="email"
              spellCheck={false}
              placeholder="voce@empresa.com.br"
              className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-text outline-none transition-colors focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-ink/20"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-[11px] uppercase tracking-[0.14em] text-text-faint">
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-text outline-none transition-colors focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-ink/20"
            />
          </div>

          {sessionExpired ? (
            <p className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-700 dark:text-amber-400" aria-live="polite">
              Sessao expirada. Faca login novamente para continuar.
            </p>
          ) : null}

          {hasError ? (
            <p className="rounded-2xl bg-icon-red-bg px-4 py-2 text-sm text-danger" aria-live="polite">
              Credenciais invalidas. Tente novamente.
            </p>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-2xl bg-lime px-4 py-3 font-semibold text-ink transition-colors hover:bg-lime-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
          >
            Entrar
          </button>
        </form>

        <div className="mt-6 rounded-2xl border border-border bg-surface-muted p-4 text-xs text-text-soft">
          <div className="mb-1 uppercase tracking-[0.14em] text-text-faint">Acesso demo</div>
          operador@angra.local · gestor@praiaazul.com.br · financeiro@bompreco.com.br
          <br />
          senha: <span className="font-medium text-text">angra123</span>
        </div>
      </div>
      </TiltWrapper>
    </div>
  );
}
