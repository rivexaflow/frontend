"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils/cn";

export type OrgChartStat = {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  tone?: "blue" | "emerald" | "amber";
};

const TONE_ICON: Record<NonNullable<OrgChartStat["tone"]>, string> = {
  blue: "bg-[#191970]/10 text-[#191970]",
  emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  amber: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
};

export function OrgChartStatStrip({ stats }: { stats: OrgChartStat[] }) {
  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.04 }}
          className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white px-3.5 py-2.5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <span
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
              TONE_ICON[stat.tone ?? "blue"],
            )}
          >
            <stat.icon className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">{stat.label}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-lg font-bold tabular-nums leading-none text-slate-900 dark:text-white">{stat.value}</p>
              {stat.hint ? (
                <p className="truncate text-[11px] font-medium text-slate-400">{stat.hint}</p>
              ) : null}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
