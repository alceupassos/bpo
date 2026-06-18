"use client";

import type { BankAccount, BankTransaction } from "@/lib/api";
import type { TableRow } from "@/lib/types";
import { reconciliationToRow } from "@/lib/formatters";
import { StatusBadge } from "@/components/status-badge";
import { confirmMatch, markDivergent } from "@/app/conciliacao/actions";

const toneMap: Record<string, "neutral" | "success" | "warning" | "danger" | "info"> = {
  Conciliado: "success",
  Sugerido: "info",
  Divergente: "danger",
  Importado: "neutral"
};

export function ReconciliationTable({
  txs,
  accounts,
  fallbackRows
}: {
  txs: BankTransaction[] | null;
  accounts: BankAccount[] | null;
  fallbackRows: TableRow[];
}) {
  const rows = txs ? txs.map((tx) => reconciliationToRow(tx, accounts ?? [])) : fallbackRows;
  const interactive = Boolean(txs);

  if (!rows.length) {
    return (
      <div className="rounded-[22px] border border-dashed border-border bg-surface-muted px-6 py-10 text-center text-sm text-text-soft">
        Nenhum movimento para conciliar.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-[22px] border border-border">
      <table className="min-w-full border-collapse">
        <thead className="bg-surface-muted">
          <tr>
            {["Conta", "Extrato", "Sugestao", "Divergencia", "Status", "Acoes"].map((label) => (
              <th
                key={label}
                scope="col"
                className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-[0.1em] text-text-faint"
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={row.id ?? idx} className="border-t border-border bg-surface text-sm transition-colors hover:bg-surface-muted">
              <td className="px-4 py-3.5 text-text-soft">{row.conta}</td>
              <td className="px-4 py-3.5 text-text">{row.extrato}</td>
              <td className="px-4 py-3.5 text-text-soft">{row.sugestao}</td>
              <td className="px-4 py-3.5 text-right tabular-nums text-text-soft">{row.divergencia}</td>
              <td className="px-4 py-3.5">
                <StatusBadge label={row.status} tone={toneMap[row.status] ?? "neutral"} />
              </td>
              <td className="px-4 py-3.5">
                {interactive && row.id && row.rawStatus !== "RECONCILED" ? (
                  <div className="flex gap-2">
                    {(row.rawStatus === "SUGGESTED_MATCH" || row.rawStatus === "IMPORTED") && (
                      <form action={confirmMatch}>
                        <input type="hidden" name="id" value={row.id} />
                        <button
                          type="submit"
                          className="rounded-xl bg-lime px-3 py-1.5 text-[11px] font-semibold text-ink transition-colors hover:bg-lime-strong"
                        >
                          Conciliar
                        </button>
                      </form>
                    )}
                    {row.rawStatus !== "DIVERGENT" && (
                      <form action={markDivergent}>
                        <input type="hidden" name="id" value={row.id} />
                        <button
                          type="submit"
                          className="rounded-xl border border-border bg-surface-muted px-3 py-1.5 text-[11px] font-medium text-text transition-colors hover:bg-surface"
                        >
                          Divergente
                        </button>
                      </form>
                    )}
                  </div>
                ) : (
                  <span className="text-text-faint">-</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}