import type {
  AccountingExport,
  ApprovalRequest,
  BankAccount,
  BankTransaction,
  Company,
  DocumentRecord,
  Employee,
  FinancialEntry,
  PayrollRun,
  TaxObligation
} from "@/lib/api";
import type { TableRow } from "@/lib/types";

export function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0
  }).format(value);
}

export function formatBRLCompact(value: number): string {
  return `R$ ${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(value)}`;
}

export function formatDateBR(iso: string | null | undefined): string {
  if (!iso) return "-";
  const d = new Date(iso.length <= 10 ? `${iso}T00:00:00` : iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("pt-BR").format(d);
}

export function formatPercent(value: number): string {
  return `${value.toString().replace(".", ",")}%`;
}

function isOverdue(dueDate: string): boolean {
  const d = new Date(`${dueDate.slice(0, 10)}T00:00:00`);
  return d.getTime() < Date.now();
}

/** Rótulo de status legível (PT) a partir do enum canônico do lançamento. */
export function entryStatusLabel(entry: FinancialEntry): string {
  switch (entry.status) {
    case "PAID":
      return "Pago";
    case "RECEIVED":
      return "Recebido";
    case "CANCELLED":
      return "Cancelado";
    case "PENDING_APPROVAL":
      return "Aguardando";
    case "DRAFT":
      return "Rascunho";
    default:
      return isOverdue(entry.dueDate) ? "Vencido" : "A vencer";
  }
}

export function docStatusLabel(status: string): string {
  switch (status) {
    case "NEEDS_REVIEW":
      return "Revisao";
    case "APPROVED":
      return "Aprovado";
    case "REJECTED":
      return "Rejeitado";
    default:
      return "Novo";
  }
}

export function reconStatusLabel(status: string): string {
  switch (status) {
    case "RECONCILED":
      return "Conciliado";
    case "SUGGESTED_MATCH":
      return "Sugerido";
    case "DIVERGENT":
      return "Divergente";
    default:
      return "Importado";
  }
}

export function approvalStatusLabel(status: string): string {
  switch (status) {
    case "APPROVED":
      return "Aprovado";
    case "REJECTED":
      return "Rejeitado";
    default:
      return "Pendente";
  }
}

// ---- Adapters entidade → TableRow (a "cola" com os componentes existentes) ----

export function payableToRow(entry: FinancialEntry): TableRow {
  return {
    fornecedor: entry.counterpartyName,
    documento: entry.documentNumber,
    categoria: entry.category,
    vencimento: formatDateBR(entry.dueDate),
    valor: formatBRL(entry.amount),
    status: entryStatusLabel(entry)
  };
}

export function receivableToRow(entry: FinancialEntry): TableRow {
  return {
    cliente: entry.counterpartyName,
    fatura: entry.documentNumber,
    emissao: formatDateBR(entry.issueDate),
    vencimento: formatDateBR(entry.dueDate),
    valor: formatBRL(entry.amount),
    status: entryStatusLabel(entry)
  };
}

export function documentToRow(doc: DocumentRecord): TableRow {
  return {
    documento: `${doc.type} ${doc.supplier}`.slice(0, 32),
    tipo: doc.type,
    fornecedor: doc.supplier,
    valor: formatBRL(doc.amount),
    confianca: doc.confidence ? `${doc.confidence}%` : "-",
    status: docStatusLabel(doc.status)
  };
}

export function reconciliationToRow(
  tx: BankTransaction,
  accounts: BankAccount[]
): TableRow {
  const account = accounts.find((a) => a.id === tx.bankAccountId);
  return {
    id: tx.id,
    conta: account ? `${account.bank}` : "Conta",
    extrato: tx.description,
    sugestao: tx.matchedEntryId ? "Match sugerido" : "Sem lancamento",
    divergencia: formatBRL(tx.divergence),
    status: reconStatusLabel(tx.status),
    rawStatus: tx.status
  };
}

export function taxObligationToRow(o: TaxObligation): TableRow {
  return {
    id: o.id,
    periodo: o.competence,
    imposto: o.type,
    vencimento: formatDateBR(o.dueDate),
    valor: formatBRL(o.amount),
    status: o.status === "PAGO" ? "Pago" : o.status === "VENCIDO" ? "Vencido" : "Pendente"
  };
}

export function payrollRunToRow(r: PayrollRun): TableRow {
  return {
    id: r.id,
    funcionario: r.employee?.name ?? "Colaborador",
    salario: formatBRL(r.baseSalary),
    fgts: formatBRL(r.fgts),
    status: r.status === "PAGO" ? "Pago" : r.esocialStatus === "TRANSMITIDO" ? "Transmitido" : "Pendente"
  };
}

export function employeeToRow(e: Employee): TableRow {
  return {
    funcionario: e.name,
    cargo: e.role ?? "-",
    salario: formatBRL(e.salary),
    status: e.status === "ATIVO" ? "Ativo" : "Inativo"
  };
}

export function accountingExportToRow(e: AccountingExport): TableRow {
  return {
    mes: e.competence,
    tipo: `${e.format} (${e.notesCount} NFs, ${e.entriesCount} lanc., ${e.payrollCount} folhas)`,
    data: formatDateBR(e.generatedAt),
    destinatario: "Contabilidade",
    status: e.status === "GERADO" ? "Enviado" : e.status
  };
}

/** Fila operacional de aprovações (visão do BPO). */
export function approvalToRow(a: ApprovalRequest): TableRow {
  return {
    id: a.id,
    descricao: a.description,
    valor: formatBRL(a.amount),
    solicitante: a.requestedBy,
    data: formatDateBR(a.createdAt),
    status: approvalStatusLabel(a.status)
  };
}

/** Pendências do cliente a partir das aprovações em aberto. */
export function approvalToClientRow(a: ApprovalRequest): TableRow {
  return {
    item: a.description,
    responsavel: "Aprovador da empresa",
    prazo: formatDateBR(a.createdAt),
    status: "Ver"
  };
}

/** Histórico recente do cliente a partir de lançamentos baixados. */
export function entryToHistoryRow(entry: FinancialEntry): TableRow {
  const signed = entry.type === "RECEIVABLE" ? entry.amount : -entry.amount;
  return {
    data: formatDateBR(entry.paidDate ?? entry.dueDate),
    evento: `${entry.counterpartyName} - ${entry.description}`,
    valor: `${signed < 0 ? "-" : ""}${formatBRL(Math.abs(signed))}`,
    origem: entry.type === "RECEIVABLE" ? "Recebimento" : "Pagamento"
  };
}

const STATUS_COLORS: Record<string, string> = {
  "A vencer": "#2f6df6",
  Vencido: "#ef4444",
  Pago: "#16a34a",
  Recebido: "#16a34a",
  Aguardando: "#f59e0b",
  Rascunho: "#9aa3ad",
  Cancelado: "#c7d2cf"
};

/** Distribuição por status (para donut "por status"), somando valores. */
export function statusDonut(entries: FinancialEntry[]): {
  labels: string[];
  series: number[];
  colors: string[];
} {
  const map = new Map<string, number>();
  for (const e of entries) {
    const k = entryStatusLabel(e);
    map.set(k, (map.get(k) ?? 0) + e.amount);
  }
  const labels = [...map.keys()];
  return {
    labels,
    series: labels.map((l) => Math.round(map.get(l) ?? 0)),
    colors: labels.map((l) => STATUS_COLORS[l] ?? "#cbd5e1")
  };
}

/** Relatório semanal (4 semanas terminando hoje) derivado dos lançamentos. */
export function buildReportRows(entries: FinancialEntry[]): TableRow[] {
  const dayMs = 24 * 60 * 60 * 1000;
  const now = Date.now();
  const rows: TableRow[] = [];
  for (let w = 3; w >= 0; w--) {
    const end = now - w * 7 * dayMs;
    const start = end - 7 * dayMs;
    let entradas = 0;
    let saidas = 0;
    for (const e of entries) {
      const t = new Date(`${e.dueDate.slice(0, 10)}T00:00:00`).getTime();
      if (t >= start && t < end) {
        if (e.type === "RECEIVABLE") entradas += e.amount;
        else saidas += e.amount;
      }
    }
    rows.push({
      periodo: `Semana ${4 - w}`,
      entradas: formatBRL(entradas),
      saidas: formatBRL(saidas),
      saldo: formatBRL(entradas - saidas)
    });
  }
  return rows;
}

/** Linhas de configuração a partir de empresas, contas e dados base. */
export function buildSettingsRows(companies: Company[], accounts: BankAccount[]): TableRow[] {
  const rows: TableRow[] = [];
  for (const c of companies) {
    rows.push({ grupo: "Empresas", item: c.tradeName, detalhe: c.cnpj, status: "Ativo" });
  }
  for (const a of accounts) {
    rows.push({
      grupo: "Bancos",
      item: a.bank,
      detalhe: `Ag ${a.branch} / Cc ${a.number}`,
      status: "Ativo"
    });
  }
  rows.push({
    grupo: "Aprovacao",
    item: "Faixa acima de R$ 5 mil",
    detalhe: "Aprovador da empresa",
    status: "Ativo"
  });
  rows.push({
    grupo: "Categorias",
    item: "Despesas operacionais",
    detalhe: "Base de categorias do BPO",
    status: "Ativo"
  });
  return rows;
}
