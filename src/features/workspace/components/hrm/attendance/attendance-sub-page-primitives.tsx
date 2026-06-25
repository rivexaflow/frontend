"use client";

import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Metric = {
  label: string;
  value: string | number;
  hint?: string;
  icon: ElementType;
};

export function AttendanceMetricStrip({
  metrics,
  actions,
}: {
  metrics: Metric[];
  actions?: ReactNode;
}) {
  return (
    <div className="border-b border-slate-100 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900 md:px-5">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-stretch">
        <div className="grid flex-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/50 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-950/40"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#191970]/12 to-[#2277ff]/10 text-[#191970] dark:text-[#2277FF]">
                <m.icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{m.label}</p>
                <p className="text-lg font-bold tabular-nums text-[#191970] dark:text-[#2277FF]">{m.value}</p>
                {m.hint ? <p className="truncate text-[10px] text-slate-500">{m.hint}</p> : null}
              </div>
            </div>
          ))}
        </div>
        {actions ? <div className="flex shrink-0 items-center justify-end gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}

export function AttendancePanelCard({
  title,
  description,
  children,
  className,
  action,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.04)] dark:border-slate-800 dark:bg-slate-900",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h3>
          {description ? <p className="text-[11px] text-slate-500">{description}</p> : null}
        </div>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}
