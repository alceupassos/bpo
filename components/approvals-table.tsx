"use client";

import type { ApprovalRequest } from "@/lib/api";
import type { TableRow } from "@/lib/types";
import { approvalToRow } from "@/lib/formatters";
import { StatusBadge } from "@/components/status-badge";
import { approveRequest, rejectRequest } from "@/app/aprovacoes/actions";

const toneMap: Record<string, "neutral" | "success" | "warning" | "danger" | "info"> = {
  Pendente: "warning",
  Aprovado: "success",
  Rejeitado: "danger"
};

export function ApprovalsTable({
  approvals,
  fallbackRows
}: {
  approvals: ApprovalRequest[] | null;
  fallbackRows: TableRow[];
}) {
  const items = approvals ?? [];
  const rows = approvals ? items.map(approvalToRow) : fallbackRows;
  const interactive = Boolean(approvals);

  if (!rows.length) {
    return (
      <div className="rounded-[22px] border border-dashed border-border bg-surface-muted px-6 py-10 text-center text-sm text-text-soft">
        Nenhuma aprovacao pendente.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-[22px] border border-border">
      <table className="min-w-full border-collapse">
        <thead className="bg-surface-muted">
          <tr>
            {["Descricao", "Valor", "Solicitante", "Data", "Status", "Acoes"].map((label) => (
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
              <td className="px-4 py-3.5 text-text">{row.descricao}</td>
              <td className="px-4 py-3.5 text-right tabular-nums text-text-soft">{row.valor}</td>
              <td className="px-4 py-3.5 text-text-soft">{row.solicitante}</td>
              <td className="px-4 py-3.5 text-text-soft">{row.data}</td>
              <td className="px-4 py-3.5">
                <StatusBadge label={row.status} tone={toneMap[row.status] ?? "neutral"} />
              </td>
              <td className="px-4 py-3.5">
                {interactive && row.id ? (
                  <div className="flex gap-2">
                    <form action={approveRequest}>
                      <input type="hidden" name="id" value={row.id} />
                      <button
                        type="submit"
                        className="rounded-xl bg-lime px-3 py-1.5 text-[11px] font-semibold text-ink transition-colors hover:bg-lime-strong"
                      >
                        Aprovar
                      </button>
                    </form>
                    <form action={rejectRequest}>
                      <input type="hidden" name="id" value={row.id} />
                      <button
                        type="submit"
                        className="rounded-xl border border-border bg-surface-muted px-3 py-1.5 text-[11px] font-medium text-text transition-colors hover:bg-surface"
                      >
                        Rejeitar
                      </button>
                    </form>
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