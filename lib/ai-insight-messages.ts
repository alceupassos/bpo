import type { AlertsResult, AnomalyResult, ForecastResult } from "@/lib/api";

export function forecastInsight(data: ForecastResult | null): string | null {
  if (!data?.forecast?.net?.length) return null;
  const negative = data.forecast.net.findIndex((v) => v < 0);
  if (negative === -1) return null;
  const month = data.forecast.categories[negative] ?? "proximo periodo";
  return `Previsao de fluxo indica saldo negativo em ${month} (R$ ${Math.abs(data.forecast.net[negative]).toLocaleString("pt-BR")}). Revise contas a pagar.`;
}

export function alertsInsight(data: AlertsResult | null): string | null {
  const top = data?.alerts?.[0];
  if (!top) return null;
  return `${top.title}: vencimento ${new Date(top.dueDate).toLocaleDateString("pt-BR")} — R$ ${top.amount.toLocaleString("pt-BR")} (risco ${top.risk}%).`;
}

export function anomaliesInsight(data: AnomalyResult | null): string | null {
  const top = data?.findings?.[0];
  if (!top) return null;
  return top.description;
}

export function inadimplenciaInsight(
  customers: { name: string; balance: number; creditLimit: number }[] | null
): string | null {
  if (!customers?.length) return null;
  const risky = customers
    .filter((c) => c.creditLimit > 0 && c.balance / c.creditLimit >= 0.7)
    .sort((a, b) => b.balance / b.creditLimit - a.balance / a.creditLimit)[0];
  if (!risky) return null;
  const pct = Math.round((risky.balance / risky.creditLimit) * 100);
  return `Cliente ${risky.name} usa ${pct}% do limite de crediario (R$ ${risky.balance.toLocaleString("pt-BR")}). Risco de inadimplencia.`;
}