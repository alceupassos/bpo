"use client";

import type { SVGProps } from "react";
import {
  BadgeDollarSign,
  Calculator,
  ChartColumnBig,
  LayoutDashboard,
  MessageCircle,
  MonitorDot,
  Package,
  ReceiptText,
  ScanText,
  Scale,
  Settings2,
  Wallet,
  Percent,
  Briefcase,
  UsersRound,
  Sparkles,
  Building2,
  ShieldCheck
} from "lucide-react";

const icons = {
  "building-2": Building2,
  "layout-dashboard": LayoutDashboard,
  wallet: Wallet,
  "badge-dollar-sign": BadgeDollarSign,
  scale: Scale,
  "scan-text": ScanText,
  "chart-column-big": ChartColumnBig,
  "monitor-dot": MonitorDot,
  "settings-2": Settings2,
  package: Package,
  calculator: Calculator,
  "receipt-text": ReceiptText,
  "message-circle": MessageCircle,
  percent: Percent,
  briefcase: Briefcase,
  "users-round": UsersRound,
  sparkles: Sparkles,
  "shield-check": ShieldCheck
};

export function IconResolver({
  name,
  ...props
}: { name: keyof typeof icons } & SVGProps<SVGSVGElement>) {
  const Icon = icons[name];
  return <Icon {...props} />;
}
