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

export interface Product {
  id: string;
  companyId: string;
  name: string;
  barcode: string | null;
  unit: string;
  price: number;
  category: string | null;
  createdAt: string;
}

export interface NoteItem {
  id: string;
  description: string;
  qty: number;
  unitPrice: number;
  total: number;
  productId: string | null;
}

export interface FiscalNote {
  id: string;
  companyId: string;
  type: string;
  supplierName: string | null;
  supplierCnpj: string | null;
  total: number;
  issueDate: string | null;
  status: string;
  source: string;
  storagePath: string | null;
  createdAt: string;
  items: NoteItem[];
}

export interface CashEntry {
  id: string;
  sessionId: string;
  type: string;
  amount: number;
  description: string | null;
  paymentMethod: string | null;
  createdAt: string;
}

export interface CashSession {
  id: string;
  companyId: string;
  openedBy: string;
  openedAt: string;
  closedAt: string | null;
  openingAmount: number;
  closingAmount: number | null;
  status: string;
  entries: CashEntry[];
  balance?: number;
}

export interface ChatThread {
  id: string;
  companyId: string;
  contactName: string;
  contactPhone: string | null;
  lastMessageAt: string;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  direction: string;
  body: string | null;
  mediaPath: string | null;
  noteId: string | null;
  createdAt: string;
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
export const getProducts = () => apiGet<Product[]>("/products");
export const getFiscalNotes = () => apiGet<FiscalNote[]>("/fiscal-notes");
export const getFiscalNote = (id: string) => apiGet<FiscalNote>(`/fiscal-notes/${id}`);
export const getCashCurrent = () => apiGet<CashSession | null>("/cash/current");
export const getCashSessions = () => apiGet<CashSession[]>("/cash/sessions");
export const getChatThreads = () => apiGet<ChatThread[]>("/chat/threads");
export const getChatMessages = (threadId: string) =>
  apiGet<ChatMessage[]>(`/chat/threads/${threadId}/messages`);

/** POST autenticado (JSON) — usado por server actions. */
export async function apiPost<T>(path: string, body?: unknown): Promise<T | null> {
  try {
    const token = await getToken();
    const res = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store"
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** Upload multipart autenticado — usado por server actions com arquivo. */
export async function apiUpload<T>(path: string, file: File, field = "file"): Promise<T | null> {
  try {
    const token = await getToken();
    const form = new FormData();
    form.append(field, file);
    const res = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
      cache: "no-store"
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

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
