"use client";

import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Props = {
  module: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export function HrmPageHeader({ module, title, description, actions, className }: Props) {
  return (
    <header className={cn("mb-6", className)}>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{module}</p>
      <div className="mt-1 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h1>
          {description ? (
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}

type StatProps = {
  label: string;
  value: string;
  hint?: string;
  icon: ElementType;
  tone?: "default" | "success" | "warning" | "danger" | "brand";
  trend?: string;
};

const TONE_STYLES = {
  default: "bg-white text-slate-900 ring-slate-200/80 dark:bg-slate-900 dark:text-white dark:ring-slate-800",
  success: "bg-emerald-50/80 text-emerald-900 ring-emerald-200/80 dark:bg-emerald-950/30 dark:text-emerald-200",
  warning: "bg-amber-50/80 text-amber-900 ring-amber-200/80 dark:bg-amber-950/30 dark:text-amber-200",
  danger: "bg-rose-50/80 text-rose-900 ring-rose-200/80 dark:bg-rose-950/30 dark:text-rose-200",
  brand: "bg-[#191970]/[0.06] text-[#191970] ring-[#191970]/15 dark:bg-indigo-950/40 dark:text-indigo-200",
};

const ICON_TONE = {
  default: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  danger: "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300",
  brand: "bg-[#191970]/10 text-[#191970] dark:bg-indigo-900/50 dark:text-indigo-300",
};

export function HrmStatCard({ label, value, hint, icon: Icon, tone = "default", trend }: StatProps) {
  return (
    <div className={cn("rounded-2xl border p-4 shadow-sm ring-1 ring-inset", TONE_STYLES[tone])}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight">{value}</p>
          {hint ? <p className="mt-0.5 text-xs text-slate-500">{hint}</p> : null}
          {trend ? <p className="mt-1 text-xs font-semibold text-emerald-600">{trend}</p> : null}
        </div>
        <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", ICON_TONE[tone])}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
}

export function HrmPanel({ title, description, children, action }: { title: string; description?: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h2>
          {description ? <p className="mt-0.5 text-xs text-slate-500">{description}</p> : null}
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}
