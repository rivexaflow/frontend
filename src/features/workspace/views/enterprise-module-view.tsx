"use client";

import { EnterprisePageShell } from "@/features/workspace/components/enterprise/enterprise-page-shell";
import { EnterpriseToolbar } from "@/features/workspace/components/enterprise/enterprise-toolbar";
import type { EnterpriseMetric } from "@/features/workspace/components/enterprise/enterprise-metric-strip";
import { cn } from "@/lib/utils/cn";

type ChecklistItem = {
  id: string;
  title: string;
  status: "done" | "active" | "pending";
  meta?: string;
};

type Props = {
  eyebrow: string;
  title: string;
  description: string;
  metrics: EnterpriseMetric[];
  checklist: ChecklistItem[];
  primaryLabel: string;
  searchPlaceholder?: string;
};

export function EnterpriseModuleView({
  eyebrow,
  title,
  description,
  metrics,
  checklist,
  primaryLabel,
  searchPlaceholder,
}: Props) {
  return (
    <EnterprisePageShell
      eyebrow={eyebrow}
      title={title}
      description={description}
      metrics={metrics}
      toolbar={
        <EnterpriseToolbar searchPlaceholder={searchPlaceholder} primaryLabel={primaryLabel} />
      }
    >
      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">Operational checklist</h2>
        <p className="mt-1 text-xs text-slate-500">
          Governed workflows with audit trail — connect your backend to replace demo signals.
        </p>
        <ul className="mt-5 space-y-3">
          {checklist.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/40"
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    item.status === "done" && "bg-emerald-500",
                    item.status === "active" && "bg-blue-500 animate-pulse",
                    item.status === "pending" && "bg-slate-300",
                  )}
                />
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {item.title}
                </span>
              </div>
              {item.meta ? (
                <span className="text-xs font-medium text-slate-500">{item.meta}</span>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
    </EnterprisePageShell>
  );
}

