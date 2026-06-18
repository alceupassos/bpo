import { DashboardTopNav } from "@/components/dashboard-top-nav";
import { PageShell } from "@/components/page-shell";
import { getCurrentUser } from "@/lib/api";
import { changePasswordAction } from "./actions";

const roleLabels: Record<string, string> = {
  ADMIN_PLATAFORMA: "Admin da plataforma",
  OPERADOR_BPO: "Operador BPO",
  GESTOR_EMPRESA: "Gestor da empresa",
  FINANCEIRO_EMPRESA: "Financeiro da empresa"
};

export default async function PerfilPage({
  searchParams
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const params = await searchParams;
  const user = await getCurrentUser();

  const feedback =
    params?.ok === "1"
      ? { type: "ok" as const, message: "Senha alterada com sucesso." }
      : params?.error === "wrong"
        ? { type: "error" as const, message: "Senha atual incorreta." }
        : params?.error === "mismatch"
          ? { type: "error" as const, message: "A nova senha e a confirmacao nao coincidem." }
          : params?.error === "invalid"
            ? { type: "error" as const, message: "Preencha todos os campos (minimo 6 caracteres)." }
            : null;

  return (
    <PageShell
      title="Meu perfil"
      subtitle="Dados da sua conta e troca de senha."
      topNav={<DashboardTopNav />}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-[28px] border border-border bg-surface p-6 soft-glow">
          <h2 className="text-lg font-bold text-text">Dados da conta</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-text-faint">Nome</dt>
              <dd className="font-medium text-text">{user?.name ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-text-faint">E-mail</dt>
              <dd className="font-medium text-text">{user?.email ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-text-faint">Papel</dt>
              <dd className="font-medium text-text">
                {user?.role ? (roleLabels[user.role] ?? user.role) : "—"}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-[28px] border border-border bg-surface p-6 soft-glow">
          <h2 className="text-lg font-bold text-text">Trocar senha</h2>
          <p className="mt-1 text-sm text-text-soft">
            Use uma senha forte com pelo menos 6 caracteres.
          </p>

          <form action={changePasswordAction} className="mt-5 space-y-4">
            <div>
              <label htmlFor="currentPassword" className="mb-1 block text-[11px] uppercase tracking-[0.14em] text-text-faint">
                Senha atual
              </label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                required
                autoComplete="current-password"
                className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-text outline-none focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-ink/20"
              />
            </div>
            <div>
              <label htmlFor="newPassword" className="mb-1 block text-[11px] uppercase tracking-[0.14em] text-text-faint">
                Nova senha
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-text outline-none focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-ink/20"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="mb-1 block text-[11px] uppercase tracking-[0.14em] text-text-faint">
                Confirmar nova senha
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-text outline-none focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-ink/20"
              />
            </div>

            {feedback ? (
              <p
                className={
                  feedback.type === "ok"
                    ? "rounded-2xl border border-lime/30 bg-lime/10 px-4 py-2 text-sm text-lime-strong"
                    : "rounded-2xl bg-icon-red-bg px-4 py-2 text-sm text-danger"
                }
                aria-live="polite"
              >
                {feedback.message}
              </p>
            ) : null}

            <button
              type="submit"
              className="rounded-2xl bg-lime px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-lime-strong"
            >
              Salvar nova senha
            </button>
          </form>
        </section>
      </div>
    </PageShell>
  );
}