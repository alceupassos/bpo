import { loginAction } from "./actions";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const hasError = params?.error === "1";

  return (
    <div className="grid min-h-screen place-items-center bg-bg p-6">
      <div className="w-full max-w-[420px] rounded-[34px] border border-[#1d241f] bg-[radial-gradient(120%_80%_at_50%_-10%,rgba(159,232,112,0.10),transparent_60%),#0a0d0a] p-8 shadow-[0_24px_90px_rgba(0,0,0,0.55)]">
        <div className="mb-1 text-2xl font-semibold text-white">angra</div>
        <p className="mb-6 text-sm text-text-soft">BPO Financeiro — acesse sua operação</p>

        <form action={loginAction} className="space-y-4">
          <div>
            <label className="mb-1 block text-[11px] uppercase tracking-[0.16em] text-text-faint">
              E-mail
            </label>
            <input
              name="email"
              type="email"
              required
              autoComplete="username"
              placeholder="voce@empresa.com.br"
              className="w-full rounded-2xl border border-border bg-[#111413] px-4 py-3 text-white outline-none focus:border-lime"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] uppercase tracking-[0.16em] text-text-faint">
              Senha
            </label>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full rounded-2xl border border-border bg-[#111413] px-4 py-3 text-white outline-none focus:border-lime"
            />
          </div>

          {hasError ? (
            <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-danger">
              Credenciais inválidas. Tente novamente.
            </p>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-2xl bg-lime px-4 py-3 font-semibold text-black transition hover:bg-lime-strong"
          >
            Entrar
          </button>
        </form>

        <div className="mt-6 rounded-2xl border border-border bg-[#111413] p-4 text-xs text-text-soft">
          <div className="mb-1 uppercase tracking-[0.16em] text-text-faint">Acesso demo</div>
          operador@angra.local · gestor@praiaazul.com.br · financeiro@bompreco.com.br
          <br />
          senha: <span className="text-white">angra123</span>
        </div>
      </div>
    </div>
  );
}
