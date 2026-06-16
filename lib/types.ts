export type NavItem = {
  href: string;
  label: string;
  icon: string;
};

export type Kpi = {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down";
  sparkline: number[];
};

export type QuickAction = {
  label: string;
  description: string;
  href: string;
};

export type StatusTone = "neutral" | "success" | "warning" | "danger" | "info";

export type TableRow = Record<string, string>;
