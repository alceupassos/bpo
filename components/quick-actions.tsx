"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Banknote,
  ChartNoAxesCombined,
  Download,
  FileUp,
  HandCoins,
  PlusCircle,
  Scale,
  Send
} from "lucide-react";
import { quickActions } from "@/lib/data";

const icons = [FileUp, PlusCircle, Scale, Send, HandCoins, Download, Banknote, ChartNoAxesCombined];
const MotionLink = motion(Link);

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {quickActions.map((action, index) => {
        const Icon = icons[index % icons.length];
        return (
          <MotionLink
            key={action.label}
            href={action.href as never}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.99 }}
            className="block rounded-[24px] border border-border bg-surface px-4 py-5 text-left soft-glow transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
          >
            <div className="mb-4 grid h-11 w-11 place-items-center rounded-2xl bg-lime-soft text-icon-green">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="text-sm font-medium text-text">{action.label}</div>
            <div className="mt-1 text-xs leading-5 text-text-faint">{action.description}</div>
          </MotionLink>
        );
      })}
    </div>
  );
}
