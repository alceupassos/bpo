/**
 * Seed in-memory coerente para o MVP demo do BPO Angra.
 *
 * Tudo é gerado de forma determinística (PRNG com semente fixa), ancorado em
 * ANCHOR_DATE = 2026-06-16, para que dashboard, tabelas e gráficos contem a
 * mesma história. Não há banco de dados nesta fase — os services leem destes
 * arrays e mutam cópias em memória.
 */

export type Role = "ADMIN_PLATAFORMA" | "OPERADOR_BPO" | "GESTOR_EMPRESA" | "FINANCEIRO_EMPRESA";

export type EntryType = "PAYABLE" | "RECEIVABLE" | "EXPENSE" | "REVENUE";
export type EntryStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "PAID"
  | "RECEIVED"
  | "CANCELLED";

export type DocumentStatus = "UPLOADED" | "NEEDS_REVIEW" | "APPROVED" | "REJECTED";
export type ReconciliationStatus = "IMPORTED" | "SUGGESTED_MATCH" | "RECONCILED" | "DIVERGENT";
export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface Company {
  id: string;
  legalName: string;
  tradeName: string;
  cnpj: string;
  taxRegime: "SIMPLES_NACIONAL";
}

export interface User {
  id: string;
  name: string;
  email: string;
  /** Senha demo em texto plano; convertida em hash bcrypt no AuthModule. */
  password: string;
  role: Role;
  /** Empresa do usuário cliente; null para papéis internos (veem tudo). */
  companyId: string | null;
}

export interface FinancialEntry {
  id: string;
  companyId: string;
  type: EntryType;
  status: EntryStatus;
  description: string;
  counterpartyName: string;
  category: string;
  documentNumber: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  paidDate: string | null;
}

export interface DocumentRecord {
  id: string;
  companyId: string;
  type: string;
  status: DocumentStatus;
  supplier: string;
  amount: number;
  category: string;
  confidence: number;
  source: "MANUAL" | "HF";
  storagePath: string | null;
  uploadedAt: string;
}

export interface BankAccount {
  id: string;
  companyId: string;
  bank: string;
  branch: string;
  number: string;
  balance: number;
}

export interface BankTransaction {
  id: string;
  companyId: string;
  bankAccountId: string;
  date: string;
  description: string;
  amount: number;
  status: ReconciliationStatus;
  matchedEntryId: string | null;
  divergence: number;
}

export interface ApprovalRequest {
  id: string;
  companyId: string;
  targetType: "PAYABLE" | "RECEIVABLE" | "DOCUMENT";
  targetId: string;
  description: string;
  amount: number;
  requestedBy: string;
  status: ApprovalStatus;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  companyId: string;
  entityType: string;
  entityId: string;
  action: string;
  actor: string;
  createdAt: string;
}

export const ANCHOR_DATE = new Date("2026-06-16T12:00:00.000Z");

/** PRNG determinístico (LCG) — mesma saída a cada boot. */
function makeRng(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rng = makeRng(20260616);

function pick<T>(arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function between(min: number, max: number): number {
  return Math.round(min + rng() * (max - min));
}

function dateOffset(days: number): string {
  const d = new Date(ANCHOR_DATE.getTime());
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export const companies: Company[] = [
  {
    id: "company-1",
    legalName: "Comercial Praia Azul LTDA",
    tradeName: "Praia Azul",
    cnpj: "12.345.678/0001-90",
    taxRegime: "SIMPLES_NACIONAL"
  },
  {
    id: "company-2",
    legalName: "Mercado Bom Preco LTDA",
    tradeName: "Bom Preco",
    cnpj: "98.765.432/0001-10",
    taxRegime: "SIMPLES_NACIONAL"
  },
  {
    id: "company-3",
    legalName: "Rede Vida Farma LTDA",
    tradeName: "Vida Farma",
    cnpj: "45.678.912/0001-55",
    taxRegime: "SIMPLES_NACIONAL"
  }
];

export const users: User[] = [
  {
    id: "user-1",
    name: "Alceu Passos",
    email: "operador@angra.local",
    password: "angra123",
    role: "OPERADOR_BPO",
    companyId: null
  },
  {
    id: "user-2",
    name: "Diretoria Angra",
    email: "admin@angra.local",
    password: "angra123",
    role: "ADMIN_PLATAFORMA",
    companyId: null
  },
  {
    id: "user-3",
    name: "Carla Mota",
    email: "gestor@praiaazul.com.br",
    password: "angra123",
    role: "GESTOR_EMPRESA",
    companyId: "company-1"
  },
  {
    id: "user-4",
    name: "Diego Luz",
    email: "financeiro@bompreco.com.br",
    password: "angra123",
    role: "FINANCEIRO_EMPRESA",
    companyId: "company-2"
  }
];

export const bankAccounts: BankAccount[] = [
  { id: "acc-1", companyId: "company-1", bank: "Banco Inter", branch: "0001", number: "112233-4", balance: 84210 },
  { id: "acc-2", companyId: "company-1", bank: "Stone", branch: "0001", number: "556677-8", balance: 31980 },
  { id: "acc-3", companyId: "company-2", bank: "Banco do Brasil", branch: "1422", number: "99887-1", balance: 52640 },
  { id: "acc-4", companyId: "company-3", bank: "Caixa", branch: "0356", number: "44556-2", balance: 41020 }
];

const payableSuppliers = [
  "Imobiliaria Horizonte",
  "Contabilidade Alfa",
  "Energia Sul",
  "OfficeNet Telecom",
  "Martins Distribuicao",
  "Transportes Vale",
  "Aguas do Litoral",
  "Seguros Litoral",
  "Limpeza Maxima",
  "Software Cloud BR"
];

const payableCategories = [
  "Aluguel",
  "Servicos de Terceiros",
  "Material de Consumo",
  "Marketing",
  "Utilidades e Energia",
  "Infraestrutura",
  "Impostos",
  "Folha"
];

const receivableClients = [
  "Mercado Bom Preco LTDA",
  "Rede Vida Farma",
  "Construtora Atlantico",
  "Colegio Horizonte",
  "Clinica Santa Elena",
  "Auto Pecas Litoral",
  "Restaurante Maresia",
  "Padaria Trigo Dourado",
  "Hotel Costa Azul",
  "Loja Mar Aberto"
];

const companyIds = companies.map((c) => c.id);

function buildEntries(): FinancialEntry[] {
  const entries: FinancialEntry[] = [];

  // 60 contas a pagar
  for (let i = 0; i < 60; i++) {
    const offset = between(-40, 45);
    const dueDate = dateOffset(offset);
    let status: EntryStatus;
    const roll = rng();
    if (offset < -5) status = roll < 0.7 ? "PAID" : "APPROVED";
    else if (roll < 0.18) status = "PENDING_APPROVAL";
    else if (roll < 0.3) status = "DRAFT";
    else if (roll < 0.4) status = "PAID";
    else if (roll < 0.46) status = "CANCELLED";
    else status = "APPROVED";

    const amount = between(450, 14800);
    entries.push({
      id: `pay-${i + 1}`,
      companyId: pick(companyIds),
      type: "PAYABLE",
      status,
      description: `${pick(payableCategories)} - ${dueDate.slice(5)}`,
      counterpartyName: pick(payableSuppliers),
      category: pick(payableCategories),
      documentNumber: `BOL-${between(1000, 9999)}`,
      amount,
      issueDate: dateOffset(offset - between(5, 25)),
      dueDate,
      paidDate: status === "PAID" ? dateOffset(offset) : null
    });
  }

  // 40 contas a receber
  for (let i = 0; i < 40; i++) {
    const offset = between(-40, 45);
    const dueDate = dateOffset(offset);
    let status: EntryStatus;
    const roll = rng();
    if (offset < -5) status = roll < 0.65 ? "RECEIVED" : "APPROVED";
    else if (roll < 0.2) status = "PENDING_APPROVAL";
    else if (roll < 0.35) status = "RECEIVED";
    else if (roll < 0.4) status = "CANCELLED";
    else status = "APPROVED";

    const amount = between(800, 18900);
    entries.push({
      id: `rec-${i + 1}`,
      companyId: pick(companyIds),
      type: "RECEIVABLE",
      status,
      description: `NF-e ${between(4000, 4999)}`,
      counterpartyName: pick(receivableClients),
      category: "Vendas",
      documentNumber: `NFE-${between(4000, 4999)}`,
      amount,
      issueDate: dateOffset(offset - between(5, 20)),
      dueDate,
      paidDate: status === "RECEIVED" ? dateOffset(offset) : null
    });
  }

  return entries;
}

export const financialEntries: FinancialEntry[] = buildEntries();

function buildDocuments(): DocumentRecord[] {
  const docTypes = ["Boleto", "Nota Fiscal", "Recibo", "Fatura", "Contrato"];
  const docs: DocumentRecord[] = [];
  for (let i = 0; i < 30; i++) {
    // 10 primeiros ficam em revisão manual (fila NEEDS_REVIEW)
    let status: DocumentStatus;
    if (i < 10) status = "NEEDS_REVIEW";
    else {
      const roll = rng();
      status = roll < 0.7 ? "APPROVED" : roll < 0.85 ? "UPLOADED" : "REJECTED";
    }
    docs.push({
      id: `doc-${i + 1}`,
      companyId: pick(companyIds),
      type: pick(docTypes),
      status,
      supplier: pick(payableSuppliers),
      amount: between(320, 9800),
      category: pick(payableCategories),
      confidence: status === "NEEDS_REVIEW" ? between(55, 78) : between(82, 99),
      source: status === "NEEDS_REVIEW" ? "MANUAL" : "HF",
      storagePath: null,
      uploadedAt: dateOffset(-between(0, 12))
    });
  }
  return docs;
}

export const documents: DocumentRecord[] = buildDocuments();

function buildTransactions(): BankTransaction[] {
  const txs: BankTransaction[] = [];
  const descriptions = [
    "PIX Recebido",
    "Pagamento fornecedor",
    "TED Recebida",
    "Tarifa bancaria",
    "Liquidacao boleto",
    "Antecipacao cartao",
    "Suprimento caixa"
  ];
  for (let i = 0; i < 26; i++) {
    let status: ReconciliationStatus;
    const roll = rng();
    if (i < 20) status = "RECONCILED";
    else if (roll < 0.5) status = "SUGGESTED_MATCH";
    else if (roll < 0.8) status = "IMPORTED";
    else status = "DIVERGENT";

    const account = pick(bankAccounts);
    const incoming = rng() < 0.55;
    const value = between(500, 12000) * (incoming ? 1 : -1);
    txs.push({
      id: `tx-${i + 1}`,
      companyId: account.companyId,
      bankAccountId: account.id,
      date: dateOffset(-between(0, 20)),
      description: pick(descriptions),
      amount: value,
      status,
      matchedEntryId: status === "RECONCILED" || status === "SUGGESTED_MATCH" ? pick(financialEntries).id : null,
      divergence: status === "DIVERGENT" ? between(10, 350) : 0
    });
  }
  return txs;
}

export const bankTransactions: BankTransaction[] = buildTransactions();

function buildApprovals(): ApprovalRequest[] {
  const pendingEntries = financialEntries.filter((e) => e.status === "PENDING_APPROVAL").slice(0, 8);
  return pendingEntries.map((e, i) => ({
    id: `approval-${i + 1}`,
    companyId: e.companyId,
    targetType: e.type === "PAYABLE" ? "PAYABLE" : "RECEIVABLE",
    targetId: e.id,
    description: `${e.counterpartyName} - ${e.description}`,
    amount: e.amount,
    requestedBy: "operador@angra.local",
    status: "PENDING" as ApprovalStatus,
    createdAt: dateOffset(-between(0, 5))
  }));
}

export const approvals: ApprovalRequest[] = buildApprovals();

export const auditLogs: AuditLog[] = financialEntries.slice(0, 12).map((e, i) => ({
  id: `audit-${i + 1}`,
  companyId: e.companyId,
  entityType: "FINANCIAL_ENTRY",
  entityId: e.id,
  action: e.status === "PAID" ? "ENTRY_PAID" : e.status === "PENDING_APPROVAL" ? "APPROVAL_REQUESTED" : "ENTRY_UPDATED",
  actor: "operador@angra.local",
  createdAt: dateOffset(-i)
}));

/** Filtra por escopo do usuário: papéis internos veem tudo; cliente vê só sua empresa. */
export function scopeByCompany<T extends { companyId: string }>(items: T[], companyId: string | null | undefined): T[] {
  if (!companyId) return items;
  return items.filter((item) => item.companyId === companyId);
}
