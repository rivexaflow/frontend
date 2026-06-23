"use client";

import type { ReactNode } from "react";

import { crm } from "@/features/workspace/components/crm/crm-styles";
import { cn } from "@/lib/utils/cn";

type Metric = {
  label: string;
  value: string | number;
};

type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  metrics?: Metric[];
  actions?: ReactNode;
  className?: string;
};

export function CrmPageHeader({ eyebrow = "CRM", title, description, metrics, actions, className }: Props) {
  return (
    <header className={cn("mb-5", className)}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 max-w-2xl">
          <p className={crm.sectionLabel}>{eyebrow}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h1>
          {description ? (
            <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {metrics?.map((m) => (
            <div key={m.label} className={crm.metricPill}>
              <span className="font-bold tabular-nums text-slate-900 dark:text-white">{m.value}</span>
              <span className="text-slate-500">{m.label}</span>
            </div>
          ))}
          {actions}
        </div>
      </div>
    </header>
  );
}

/** @deprecated Use CrmPageHeader — kept for gradual migration */
export function CrmWorkspaceHeader(props: Props) {
  return <CrmPageHeader {...props} />;
}
