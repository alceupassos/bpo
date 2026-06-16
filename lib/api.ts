import { cookies } from "next/headers";

/**
 * Camada de acesso à API NestJS. Lê a base de NEXT_PUBLIC_API_URL e injeta o
 * token JWT guardado no cookie httpOnly (gravado pela server action de login).
 *
 * Cada função é resiliente: em falha de rede / 401 / API offline retorna `null`,
 * e as telas caem no seed fixo de `lib/data.ts`. Nenhuma tela quebra.
 */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:3002/api";
export const AUTH_COOKIE = "bpo_token";

export type EntryType = "PAYABLE" | "RECEIVABLE" | "EXPENSE" | "REVENUE";

export interface FinancialEntry {
  id: string;
  companyId: string;
  type: EntryType;
  status: string;
  description: string;
  counterpartyName: string;
  category: string;
  documentNumber: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  paidDate: string | null;
}

export interface DashboardSummary {
  saldoProjetado: number;
  aPagar: number;
  aReceber: number;
  inadimplencia: number;
  recebido: number;
  pago: number;
  ocrPendente: number;
  conciliacaoPendente: number;
  taxaConciliacao: number;
  slaMedio: number;
  automacao: number;
}

export interface Cashflow {
  categories: string[];
  projected: number[];
  realized: number[];
}

export interface DocumentRecord {
  id: string;
  companyId: string;
  type: string;
  status: string;
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
  status: string;
  matchedEntryId: string | null;
  divergence: number;
}

export interface ApprovalRequest {
  id: string;
  companyId: string;
  targetType: string;
  targetId: string;
  description: string;
  amount: number;
  requestedBy: string;
  status: string;
  createdAt: string;
}

export interface Company {
  id: string;
  legalName: string;
  tradeName: string;
  cnpj: string;
  taxRegime: string;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
  companyId: string | null;
}

async function getToken(): Promise<string | undefined> {
  try {
    const store = await cookies();
    return store.get(AUTH_COOKIE)?.value;
  } catch {
    return undefined;
  }
}

async function apiGet<T>(path: string): Promise<T | null> {
  try {
    const token = await getToken();
    const res = await fetch(`${BASE}${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: "no-store"
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export const getDashboardSummary = () => apiGet<DashboardSummary>("/dashboard/summary");
export const getCashflow = () => apiGet<Cashflow>("/dashboard/cashflow");
export const getFinancialEntries = (type: EntryType) =>
  apiGet<FinancialEntry[]>(`/financial-entries?type=${type}`);
export const getDocuments = () => apiGet<DocumentRecord[]>("/documents");
export const getBankTransactions = () => apiGet<BankTransaction[]>("/bank-transactions");
export const getBankAccounts = () => apiGet<BankAccount[]>("/bank-accounts");
export const getApprovals = () => apiGet<ApprovalRequest[]>("/approvals");
export const getCompanies = () => apiGet<Company[]>("/companies");
export const getCurrentUser = () => apiGet<SessionUser>("/auth/me");

/** Login direto (usado pela server action). Lança em credenciais inválidas. */
export async function login(email: string, password: string): Promise<{ accessToken: string; user: SessionUser }> {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store"
  });
  if (!res.ok) {
    throw new Error("Credenciais invalidas");
  }
  return res.json();
}
