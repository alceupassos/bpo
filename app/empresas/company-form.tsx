"use client";

import { useState } from "react";
import { createNewCompany } from "./actions";

export function CompanyForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await createNewCompany(formData);

    setLoading(false);
    if (res?.error) {
      setError(res.error);
    } else {
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    }
  };

  const inputClass =
    "w-full rounded-2xl border border-border bg-surface px-4 py-3 text-text outline-none focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-ink/20 text-xs";
  const labelClass = "mb-1.5 block text-[10px] uppercase tracking-[0.14em] text-text-faint font-semibold";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl bg-danger/10 border border-danger/20 p-3.5 text-xs text-danger">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl bg-success/10 border border-success/20 p-3.5 text-xs text-success">
          Empresa e administrador cadastrados com sucesso!
        </div>
      )}

      <div>
        <label className={labelClass}>Razão Social</label>
        <input name="legalName" required placeholder="Ex.: Praia Azul Ltda" className={inputClass} autoComplete="off" />
      </div>

      <div>
        <label className={labelClass}>Nome Fantasia</label>
        <input name="tradeName" required placeholder="Ex.: Praia Azul" className={inputClass} autoComplete="off" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>CNPJ</label>
          <input name="cnpj" required placeholder="00.000.000/0000-00" className={inputClass} autoComplete="off" />
        </div>
        <div>
          <label className={labelClass}>Regime Tributário</label>
          <select name="taxRegime" defaultValue="SIMPLES_NACIONAL" className={inputClass}>
            <option value="SIMPLES_NACIONAL">Simples Nacional</option>
            <option value="LUCRO_PRESUMIDO">Lucro Presumido</option>
            <option value="LUCRO_REAL">Lucro Real</option>
          </select>
        </div>
      </div>

      <div className="border-t border-border pt-4 mt-2">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-text mb-3">Dados do Administrador (Gestor)</h4>
        
        <div>
          <label className={labelClass}>Nome Completo</label>
          <input name="adminName" required placeholder="Ex.: Carla Mota" className={inputClass} autoComplete="off" />
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <div>
            <label className={labelClass}>E-mail</label>
            <input name="adminEmail" type="email" required placeholder="gestor@empresa.com" className={inputClass} autoComplete="off" />
          </div>
          <div>
            <label className={labelClass}>Senha Temporária</label>
            <input name="adminPassword" type="password" required placeholder="Mín. 6 caracteres" className={inputClass} autoComplete="off" />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-lime px-4 py-3 font-semibold text-ink transition-colors hover:bg-lime-strong text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
      >
        {loading ? "Processando Onboarding..." : "Concluir Onboarding"}
      </button>
    </form>
  );
}
