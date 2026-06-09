"use client";

import {
  ACTIVITY_TYPE_LABELS,
  type WorkspaceActivityRecord,
} from "@/features/workspace/data/workspace-activity-demo";
import { cn } from "@/lib/utils/cn";

type Props = {
  event: WorkspaceActivityRecord;
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 text-sm">
      <span className="shrink-0 text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-900 dark:text-white">{value}</span>
    </div>
  );
}

export function ActivityDetailPanel({ event }: Props) {
  const initials = event.userName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex h-full min-h-[400px] flex-col">
      <div className="shrink-0 border-b border-slate-200/90 bg-gradient-to-br from-[#191970] via-[#1a1d6e] to-[#252d7a] px-5 py-5 text-white dark:border-slate-800">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">Activity detail</p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight">{event.action}</h2>
        <p className="mt-1 text-sm text-white/75">{event.summary}</p>
        <div className="mt-4 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-xs font-bold ring-1 ring-white/20">
            {initials}
          </span>
          <span>
            <p className="text-sm font-semibold">{event.userName}</p>
            <p className="text-xs text-white/65">{event.userEmail}</p>
          </span>
          <span
            className={cn(
              "ml-auto rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
              "bg-white/15 text-white",
            )}
          >
            {ACTIVITY_TYPE_LABELS[event.type]}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        <section className="rounded-xl border border-slate-200/90 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-100 px-4 py-2.5 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-400">Event information</h3>
          </div>
          <div className="divide-y divide-slate-100 px-4 dark:divide-slate-800">
            <DetailRow label="When" value={event.when} />
            <DetailRow label="Module" value={event.module} />
            {event.resource ? <DetailRow label="Resource" value={event.resource} /> : null}
            {event.ip ? <DetailRow label="IP address" value={event.ip} /> : null}
            {event.device ? <DetailRow label="Device" value={event.device} /> : null}
            {event.location ? <DetailRow label="Location" value={event.location} /> : null}
          </div>
        </section>

        {event.details && event.details.length > 0 ? (
          <section className="mt-4 rounded-xl border border-slate-200/90 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-100 px-4 py-2.5 dark:border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-400">What changed</h3>
            </div>
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {event.details.map((line) => (
                <li key={line} className="px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300">
                  {line}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  );
}
