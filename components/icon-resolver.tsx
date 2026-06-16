"use client";

import {
  BadgeDollarSign,
  ChartColumnBig,
  LayoutDashboard,
  MonitorDot,
  ScanText,
  Scale,
  Settings2,
  Wallet
} from "lucide-react";

const icons = {
  "layout-dashboard": LayoutDashboard,
  wallet: Wallet,
  "badge-dollar-sign": BadgeDollarSign,
  scale: Scale,
  "scan-text": ScanText,
  "chart-column-big": ChartColumnBig,
  "monitor-dot": MonitorDot,
  "settings-2": Settings2
};

export function IconResolver({
  name,
  className
}: {
  name: keyof typeof icons;
  className?: string;
}) {
  const Icon = icons[name];
  return <Icon className={className} />;
}
