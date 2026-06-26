"use client";

import type { ReactNode } from "react";

import { crm } from "@/features/workspace/components/crm/crm-styles";
import { cn } from "@/lib/utils/cn";

type Metric = {
  label: string;
  value: string | number;
};

type Props = {
  /** @deprecated Shown in workspace topbar — not rendered */
  eyebrow?: string;
  /** @deprecated Shown in workspace topbar — not rendered */
  title?: string;
  /** @deprecated Not rendered */
  description?: string;
  metrics?: Metric[];
  actions?: ReactNode;
  className?: string;
};

/** Compact KPI / action strip below the workspace topbar (no duplicate page title). */
export function CrmPageHeader({ metrics, actions, className }: Props) {
  if (!metrics?.length && !actions) return null;

  return (
    <header
      className={cn(
        "mb-2.5 flex flex-wrap items-center gap-2",
        metrics?.length ? "justify-between" : "justify-end",
        className,
      )}
    >
      {metrics?.length ? (
        <div className="flex flex-wrap items-center gap-2">
          {metrics.map((m) => (
            <div key={m.label} className={crm.metricPill}>
              <span className="font-bold tabular-nums text-slate-900 dark:text-white">{m.value}</span>
              <span className="text-slate-500">{m.label}</span>
            </div>
          ))}
        </div>
      ) : null}
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

/** @deprecated Use CrmPageHeader */
export function CrmWorkspaceHeader(props: Props) {
  return <CrmPageHeader {...props} />;
}
