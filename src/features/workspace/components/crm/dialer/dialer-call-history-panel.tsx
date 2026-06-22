"use client";

import { useMemo, useState } from "react";
import { Clock, PhoneIncoming, PhoneOutgoing, PhoneMissed } from "lucide-react";

import {
  CALL_DISPOSITION_META,
  formatCallDuration,
  type CallLogEntry,
} from "@/features/workspace/data/crm-dialer-demo";
import { cn } from "@/lib/utils/cn";

type Props = {
  entries: CallLogEntry[];
  maxItems?: number;
};

type LogFilter = "all" | "connected" | "missed";

const TONE_CLASS = {
  emerald: "bg-emerald-500/15 text-emerald-700 ring-emerald-500/20",
  amber: "bg-amber-500/15 text-amber-700 ring-amber-500/20",
  slate: "bg-slate-500/10 text-slate-600 ring-slate-500/15",
  rose: "bg-rose-500/15 text-rose-700 ring-rose-500/20",
  blue: "bg-blue-500/15 text-blue-700 ring-blue-500/20",
} as const;

const FILTERS: { id: LogFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "connected", label: "Connected" },
  { id: "missed", label: "Missed" },
];

function matchesFilter(entry: CallLogEntry, filter: LogFilter): boolean {
  if (filter === "all") return true;
  if (filter === "connected") {
    return entry.disposition === "connected" || entry.disposition === "callback";
  }
  return entry.disposition === "no_answer" || entry.disposition === "busy";
}

export function DialerCallHistoryPanel({ entries, maxItems = 14 }: Props) {
  const [filter, setFilter] = useState<LogFilter>("all");

  const visible = useMemo(() => {
    return entries.filter((e) => matchesFilter(e, filter)).slice(0, maxItems);
  }, [entries, filter, maxItems]);

  const connectedCount = entries.filter(
    (e) => e.disposition === "connected" || e.disposition === "callback",
  ).length;
  const totalDuration = entries.reduce((s, e) => s + e.durationSec, 0);

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-950/30">
      <div className="border-b border-slate-100 px-4 py-4 dark:border-slate-800">
        <p className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">Activity</p>
        <p className="text-xs text-slate-500">Synced to lead timelines</p>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-slate-200/70 bg-white px-2.5 py-2 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Connected</p>
            <p className="text-lg font-bold tabular-nums text-slate-900 dark:text-white">{connectedCount}</p>
          </div>
          <div className="rounded-xl border border-slate-200/70 bg-white px-2.5 py-2 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Talk time</p>
            <p className="text-lg font-bold tabular-nums text-slate-900 dark:text-white">
              {formatCallDuration(totalDuration)}
            </p>
          </div>
        </div>

        <div className="mt-3 flex gap-1 rounded-lg bg-slate-100/80 p-0.5 dark:bg-slate-800/80">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={cn(
                "flex-1 rounded-md px-2 py-1.5 text-[10px] font-bold uppercase tracking-wide transition",
                filter === f.id
                  ? "bg-white text-[#191970] shadow-sm dark:bg-slate-900 dark:text-indigo-300"
                  : "text-slate-500 hover:text-slate-700",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <ul className="flex-1 overflow-y-auto px-2 py-2">
        {visible.map((entry, index) => {
          const meta = CALL_DISPOSITION_META[entry.disposition];
          const DirectionIcon =
            entry.direction === "inbound"
              ? PhoneIncoming
              : entry.disposition === "no_answer" || entry.disposition === "busy"
                ? PhoneMissed
                : PhoneOutgoing;
          const isMissed = entry.disposition === "no_answer" || entry.disposition === "busy";

          return (
            <li key={entry.id} className="relative pl-4">
              {index < visible.length - 1 ? (
                <span className="absolute bottom-0 left-[7px] top-8 w-px bg-slate-200 dark:bg-slate-700" />
              ) : null}
              <span
                className={cn(
                  "absolute left-0 top-4 h-3.5 w-3.5 rounded-full ring-2 ring-white dark:ring-slate-900",
                  isMissed ? "bg-rose-400" : "bg-[#191970]",
                )}
              />

              <div className="mb-2 rounded-xl border border-slate-200/70 bg-white p-3 shadow-sm transition hover:border-[#191970]/20 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start gap-2.5">
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
                      entry.direction === "inbound"
                        ? "bg-sky-500/10 text-sky-600"
                        : isMissed
                          ? "bg-rose-500/10 text-rose-600"
                          : "bg-[#191970]/10 text-[#191970]",
                    )}
                  >
                    <DirectionIcon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                        {entry.contactName}
                      </p>
                      <span className="shrink-0 text-[10px] text-slate-400">{entry.startedAt}</span>
                    </div>
                    <p className="truncate text-xs text-slate-500">{entry.company}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase ring-1 ring-inset",
                          TONE_CLASS[meta.tone],
                        )}
                      >
                        {meta.label}
                      </span>
                      {entry.durationSec > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium tabular-nums text-slate-500">
                          <Clock className="h-3 w-3" />
                          {formatCallDuration(entry.durationSec)}
                        </span>
                      ) : null}
                    </div>
                    {entry.notes ? (
                      <p className="mt-2 rounded-lg bg-slate-50 px-2 py-1.5 text-[11px] leading-relaxed text-slate-600 dark:bg-slate-800/60 dark:text-slate-400">
                        {entry.notes}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
        {visible.length === 0 ? (
          <li className="px-2 py-12 text-center text-sm text-slate-500">No calls in this filter.</li>
        ) : null}
      </ul>
    </div>
  );
}
