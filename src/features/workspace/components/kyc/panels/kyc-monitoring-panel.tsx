"use client";

import { AlertTriangle, Bell, Info } from "lucide-react";

import { StatusBadge } from "@/features/workspace/components/enterprise/enterprise-data-table";
import type { MonitoringEvent } from "@/features/workspace/data/kyc-demo";
import { cn } from "@/lib/utils/cn";

const severityStyles = {
  info: "border-slate-200 bg-white",
  warning: "border-amber-200 bg-amber-50/50",
  critical: "border-rose-200 bg-rose-50/50",
} as const;

const severityIcon = {
  info: Info,
  warning: AlertTriangle,
  critical: AlertTriangle,
};

type Props = {
  events: MonitoringEvent[];
  onAcknowledge: (id: string) => void;
};

export function KycMonitoringPanel({ events, onAcknowledge }: Props) {
  const open = events.filter((e) => e.severity !== "info");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-blue-200/80 bg-blue-50/30 px-4 py-3 dark:border-blue-900 dark:bg-blue-950/20">
        <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          <Bell className="h-4 w-4 text-blue-600" />
          <span>
            <strong>Daily rescreening</strong> across PEP, sanctions, adverse media, and document expiry — alerts route to case owners automatically.
          </span>
        </div>
        <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white">
          {open.length} active alerts
        </span>
      </div>

      <div className="space-y-3">
        {events.map((event) => {
          const Icon = severityIcon[event.severity];
          return (
            <div
              key={event.id}
              className={cn(
                "flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between",
                severityStyles[event.severity],
                "dark:border-slate-800 dark:bg-slate-900",
              )}
            >
              <div className="flex gap-3">
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                    event.severity === "critical" && "bg-rose-100 text-rose-600",
                    event.severity === "warning" && "bg-amber-100 text-amber-600",
                    event.severity === "info" && "bg-slate-100 text-slate-600",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-900 dark:text-white">{event.subject}</p>
                    <StatusBadge label={event.eventType.replace("_", " ")} tone="slate" />
                  </div>
                  <p className="mt-0.5 text-sm text-slate-600">{event.message}</p>
                  <p className="mt-1 font-mono text-[10px] text-blue-600">{event.caseRef}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                <span className="text-xs text-slate-500">{event.occurredAt}</span>
                {event.severity !== "info" ? (
                  <button
                    type="button"
                    onClick={() => onAcknowledge(event.id)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Acknowledge
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
