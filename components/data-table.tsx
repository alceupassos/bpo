import clsx from "clsx";
import type { TableRow } from "@/lib/types";
import { StatusBadge } from "@/components/status-badge";

const toneMap: Record<string, "neutral" | "success" | "warning" | "danger" | "info"> = {
  "A vencer": "info",
  "A receber": "success",
  Vencido: "danger",
  Pago: "success",
  Recebido: "success",
  Cancelado: "neutral",
  Rascunho: "neutral",
  Aguardando: "warning",
  Pendente: "warning",
  Revisao: "warning",
  Novo: "info",
  Aprovado: "success",
  Rejeitado: "danger",
  Conciliado: "success",
  Sugerido: "info",
  Importado: "neutral",
  Divergente: "danger",
  Aberto: "success",
  Fechado: "neutral",
  Ver: "neutral"
};

export function DataTable({
  columns,
  rows,
  dense = false
}: {
  columns: { key: string; label: string }[];
  rows: TableRow[];
  dense?: boolean;
}) {
  if (!rows.length) {
    return (
      <div className="rounded-[22px] border border-dashed border-border bg-surface-muted px-6 py-10 text-center text-sm text-text-soft">
        Nenhum registro para exibir.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-[22px] border border-border">
      <table className="min-w-full border-collapse">
        <thead className="bg-surface-muted">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-[0.1em] text-text-faint"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={clsx(
                "border-t border-border bg-surface transition-colors hover:bg-surface-muted",
                dense ? "text-xs" : "text-sm"
              )}
            >
              {columns.map((column) => {
                const value = row[column.key];
                const alignRight = value?.includes("R$");
                const isStatus = column.key === "status" || column.key === "acao";
                return (
                  <td
                    key={column.key}
                    className={clsx(
                      "px-4 py-3.5 text-text-soft",
                      alignRight && "text-right tabular-nums"
                    )}
                  >
                    {isStatus ? (
                      <StatusBadge label={value} tone={toneMap[value] ?? "neutral"} />
                    ) : (
                      <span className={column.key === "descricao" || column.key === "mensagem" ? "text-text" : ""}>
                        {value}
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
