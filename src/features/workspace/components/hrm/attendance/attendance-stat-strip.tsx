"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils/cn";

export type AttendanceStat = {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  tone?: "blue" | "emerald" | "amber" | "rose" | "sky";
};

const TONE: Record<NonNullable<AttendanceStat["tone"]>, string> = {
  blue: "bg-[#191970]/10 text-[#191970]",
  emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
  amber: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  rose: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400",
  sky: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400",
};

export function AttendanceStatStrip({ stats }: { stats: AttendanceStat[] }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-8">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.03 }}
          className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white px-3 py-2.5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", TONE[stat.tone ?? "blue"])}>
            <stat.icon className="h-3.5 w-3.5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">{stat.label}</p>
            <p className="text-base font-bold tabular-nums leading-tight text-slate-900 dark:text-white">{stat.value}</p>
            {stat.hint ? <p className="truncate text-[10px] text-slate-400">{stat.hint}</p> : null}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
