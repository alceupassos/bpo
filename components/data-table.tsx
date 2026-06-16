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
  return (
    <div className="overflow-hidden rounded-[22px] border border-border">
      <table className="min-w-full border-collapse">
        <thead className="bg-[#171c1a]">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.14em] text-text-faint"
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
                "border-t border-border bg-[#111413] transition hover:bg-[#171c1a]",
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
                    className={clsx("px-4 py-3.5 text-text-soft", alignRight && "text-right")}
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
