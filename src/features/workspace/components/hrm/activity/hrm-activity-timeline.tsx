"use client";

import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Info,
  Shield,
  UserPlus,
  Wallet,
} from "lucide-react";

import type { HrmActivityEvent, HrmActivitySeverity } from "@/features/workspace/data/hrm-activity-ui";
import { cn } from "@/lib/utils/cn";

const SEVERITY_STYLE: Record<
  HrmActivitySeverity,
  { dot: string; badge: string; icon: typeof Info }
> = {
  info: { dot: "bg-[#2277ff]", badge: "bg-[#2277ff]/10 text-[#0056ff]", icon: Info },
  success: { dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700", icon: CheckCircle2 },
  warning: { dot: "bg-amber-500", badge: "bg-amber-50 text-amber-800", icon: AlertTriangle },
  critical: { dot: "bg-rose-500", badge: "bg-rose-50 text-rose-700", icon: Shield },
};

const MODULE_ICON: Record<string, typeof Info> = {
  Employees: UserPlus,
  Payroll: Wallet,
  Documents: FileText,
  default: Info,
};

function moduleIcon(module: string) {
  return MODULE_ICON[module] ?? MODULE_ICON.default!;
}

type Props = {
  groups: { label: string; events: HrmActivityEvent[] }[];
  onSelect?: (event: HrmActivityEvent) => void;
  selectedId?: string | null;
};

export function HrmActivityTimeline({ groups, onSelect, selectedId }: Props) {
  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Info className="h-10 w-10 text-slate-300" />
        <p className="mt-3 text-sm font-semibold text-slate-700">No activity matches filters</p>
        <p className="mt-1 text-xs text-slate-500">Try a broader search or clear module filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <section key={group.label}>
          <h3 className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            {group.label}
          </h3>
          <ol className="relative space-y-0 border-l-2 border-slate-100 pl-6 dark:border-slate-800">
            {group.events.map((event, idx) => {
              const style = SEVERITY_STYLE[event.severity];
              const Icon = moduleIcon(event.module);
              const selected = selectedId === event.id;
              return (
                <li key={event.id} className="relative pb-6 last:pb-0">
                  <span
                    className={cn(
                      "absolute -left-[calc(0.75rem+1px)] top-1.5 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-white dark:ring-slate-900",
                      style.dot,
                    )}
                  >
                    <Icon className="h-3 w-3 text-white" strokeWidth={2.5} />
                  </span>
                  <button
                    type="button"
                    onClick={() => onSelect?.(event)}
                    className={cn(
                      "w-full rounded-xl border px-4 py-3.5 text-left transition",
                      selected
                        ? "border-[#191970]/30 bg-[#191970]/[0.04] shadow-sm ring-1 ring-[#191970]/10"
                        : "border-slate-200/80 bg-white hover:border-[#2277ff]/25 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900",
                    )}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{event.action}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{event.detail}</p>
                      </div>
                      <span className="shrink-0 text-[11px] font-medium tabular-nums text-slate-400">
                        {event.occurredAt}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {event.module}
                      </span>
                      <span className={cn("rounded-md px-2 py-0.5 text-[10px] font-bold uppercase", style.badge)}>
                        {event.severity}
                      </span>
                      <span className="text-xs text-slate-500">
                        {event.actor}
                        {event.actorRole ? ` · ${event.actorRole}` : ""}
                      </span>
                    </div>
                  </button>
                  {idx < group.events.length - 1 ? null : null}
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
