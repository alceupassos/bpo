import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

export const apiErrorTracker = cache(() => ({
  hasError: false,
  sessionExpired: false
}));

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

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: string;
  companyId: string | null;
  createdAt: string;
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

async function setToken(token: string): Promise<void> {
  const store = await cookies();
  store.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8
  });
}

async function clearToken(): Promise<void> {
  const store = await cookies();
  store.delete(AUTH_COOKIE);
}

async function refreshAccessToken(currentToken: string): Promise<string | null> {
  try {
    const res = await fetch(`${BASE}/auth/refresh`, {
      method: "POST",
      headers: { Authorization: `Bearer ${currentToken}` },
      cache: "no-store"
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { accessToken: string };
    await setToken(data.accessToken);
    return data.accessToken;
  } catch {
    return null;
  }
}

async function handleSessionExpired(): Promise<never> {
  apiErrorTracker().hasError = true;
  apiErrorTracker().sessionExpired = true;
  await clearToken();
  redirect("/login?expired=1");
}

type ApiFetchInit = RequestInit & { token?: string };

async function apiFetch(path: string, init: ApiFetchInit = {}, retried = false): Promise<Response | null> {
  try {
    const token = init.token ?? (await getToken());
    const { token: _t, ...fetchInit } = init;
    const res = await fetch(`${BASE}${path}`, {
      ...fetchInit,
      headers: {
        ...(fetchInit.headers as Record<string, string> | undefined),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      cache: "no-store"
    });

    if (res.status === 401 && token && !retried) {
      const newToken = await refreshAccessToken(token);
      if (newToken) {
        return apiFetch(path, { ...init, token: newToken }, true);
      }
      await handleSessionExpired();
    }

    if (res.status === 401) {
      await handleSessionExpired();
    }

    return res;
  } catch {
    apiErrorTracker().hasError = true;
    return null;
  }
}

async function apiGet<T>(path: string): Promise<T | null> {
  const res = await apiFetch(path);
  if (!res || !res.ok) {
    if (res && !res.ok) apiErrorTracker().hasError = true;
    return null;
  }
  return (await res.json()) as T;
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
export const getUsers = () => apiGet<AppUser[]>("/users");
export const createCompany = (body: unknown) => apiPost<any>("/companies", body);
export const getCurrentUser = () => apiGet<SessionUser>("/auth/me");
export const getProducts = () => apiGet<Product[]>("/products");
export const getFiscalNotes = () => apiGet<FiscalNote[]>("/fiscal-notes");
export const getFiscalNote = (id: string) => apiGet<FiscalNote>(`/fiscal-notes/${id}`);
export const getCashCurrent = () => apiGet<CashSession | null>("/cash/current");
export const getCashSessions = () => apiGet<CashSession[]>("/cash/sessions");
export const getChatThreads = () => apiGet<ChatThread[]>("/chat/threads");
export const getChatMessages = (threadId: string) =>
  apiGet<ChatMessage[]>(`/chat/threads/${threadId}/messages`);

// ---- Novos módulos (fornecedores, clientes, fiscal, folha, societário, contador, IA) ----

export interface Supplier {
  id: string;
  companyId: string;
  name: string;
  cnpj: string | null;
  email: string | null;
  phone: string | null;
  category: string | null;
}

export interface Customer {
  id: string;
  companyId: string;
  name: string;
  document: string | null;
  phone: string | null;
  email: string | null;
  qrToken: string | null;
  creditLimit: number;
  balance: number;
}

export interface TaxObligation {
  id: string;
  companyId: string;
  type: string;
  competence: string;
  dueDate: string;
  amount: number;
  baseRevenue: number;
  status: string;
  paidDate: string | null;
}

export interface PayrollRun {
  id: string;
  competence: string;
  baseSalary: number;
  fgts: number;
  inss: number;
  netPay: number;
  vacationDue: number;
  esocialStatus: string;
  status: string;
  employee?: { name: string; role: string | null };
}

export interface Employee {
  id: string;
  name: string;
  cpf: string | null;
  role: string | null;
  salary: number;
  status: string;
}

export interface CorporateDoc {
  id: string;
  type: string;
  title: string;
  issueDate: string | null;
  expiryDate: string | null;
}

export interface AuditLogEntry {
  id: string;
  companyId: string;
  entityType: string;
  entityId: string;
  action: string;
  actor: string;
  createdAt: string;
}

export interface AccountingExport {
  id: string;
  competence: string;
  format: string;
  status: string;
  notesCount: number;
  entriesCount: number;
  payrollCount: number;
  generatedAt: string | null;
}

export interface Faturamento12m {
  categories: string[];
  faturamento: number[];
  total12m: number;
  teto: number;
  percentualTeto: number;
}

export interface ForecastResult {
  history: { categories: string[]; net: number[] };
  forecast: { categories: string[]; net: number[] };
  method: string;
}

export interface AnomalyResult {
  total: number;
  findings: { type: string; severity: string; description: string }[];
}

export interface AlertsResult {
  total: number;
  alerts: { kind: string; title: string; dueDate: string; amount: number; risk: number }[];
}

export interface MonthlySummary {
  summary: string;
  data: { entrou: number; saiu: number; sobra: number };
  source: string;
}

export const getSuppliers = () => apiGet<Supplier[]>("/suppliers");
export const getCustomers = () => apiGet<Customer[]>("/customers");
export const getTaxObligations = () => apiGet<TaxObligation[]>("/tax-obligations");
export const getTaxSummary = () => apiGet<Record<string, unknown>>("/tax-obligations/summary");
export const getPayrollRuns = () => apiGet<PayrollRun[]>("/payroll/runs");
export const getEmployees = () => apiGet<Employee[]>("/payroll/employees");
export const getCorporateDocs = () => apiGet<CorporateDoc[]>("/corporate/docs");
export const getAccountingExports = () => apiGet<AccountingExport[]>("/accounting/exports");
export const getAuditLogs = () => apiGet<AuditLogEntry[]>("/audit-logs");
export const getFaturamento12m = () => apiGet<Faturamento12m>("/dashboard/faturamento-12m");
export const getForecast = () => apiGet<ForecastResult>("/ai/forecast");
export const getAnomalies = () => apiGet<AnomalyResult>("/ai/anomalies");
export const getAlerts = () => apiGet<AlertsResult>("/ai/alerts");
export const getMonthlySummary = () => apiGet<MonthlySummary>("/ai/monthly-summary");

/** POST autenticado (JSON) — usado por server actions. */
export async function apiPost<T>(path: string, body?: unknown): Promise<T | null> {
  const res = await apiFetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined
  });
  if (!res || !res.ok) {
    if (res && !res.ok) apiErrorTracker().hasError = true;
    return null;
  }
  return (await res.json()) as T;
}

/** Upload multipart autenticado — usado por server actions com arquivo. */
export async function apiUpload<T>(path: string, file: File, field = "file"): Promise<T | null> {
  const form = new FormData();
  form.append(field, file);
  const res = await apiFetch(path, { method: "POST", body: form });
  if (!res || !res.ok) {
    if (res && !res.ok) apiErrorTracker().hasError = true;
    return null;
  }
  return (await res.json()) as T;
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
