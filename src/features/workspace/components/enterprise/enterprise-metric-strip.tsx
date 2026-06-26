"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils/cn";

export type EnterpriseMetric = {
  label: string;
  value: string;
  hint?: string;
  trend?: string;
  trendUp?: boolean;
  icon: LucideIcon;
  tone?: "blue" | "emerald" | "amber" | "purple" | "rose" | "slate";
  onClick?: () => void;
};

const toneStyles: Record<NonNullable<EnterpriseMetric["tone"]>, string> = {
  blue: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
  emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
  amber: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
  purple: "bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400",
  rose: "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400",
  slate: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

export function EnterpriseMetricStrip({ metrics }: { metrics: EnterpriseMetric[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric, i) => (
        <motion.div
          key={metric.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          whileHover={metric.onClick ? { y: -4, transition: { duration: 0.2 } } : undefined}
          whileTap={metric.onClick ? { scale: 0.98 } : undefined}
          onClick={metric.onClick}
          className={cn(
            "relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 text-left",
            metric.onClick && "cursor-pointer hover:border-slate-350 dark:hover:border-slate-750 hover:shadow-md transition-shadow duration-300",
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                toneStyles[metric.tone ?? "blue"],
              )}
            >
              <metric.icon className="h-5 w-5" />
            </div>
            {metric.trend ? (
              <span
                className={cn(
                  "text-xs font-bold",
                  metric.trendUp === false ? "text-rose-600" : "text-emerald-600",
                )}
              >
                {metric.trend}
              </span>
            ) : null}
          </div>
          <p className="mt-4 text-sm font-semibold text-slate-500">{metric.label}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {metric.value}
          </p>
          {metric.hint ? (
            <p className="mt-1 text-xs text-slate-400">{metric.hint}</p>
          ) : null}
        </motion.div>
      ))}
    </div>
  );
}
