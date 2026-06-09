"use client";

import {
  ACTIVITY_TYPE_LABELS,
  type WorkspaceActivityRecord,
} from "@/features/workspace/data/workspace-activity-demo";
import { cn } from "@/lib/utils/cn";

type Props = {
  events: WorkspaceActivityRecord[];
  selectedId: string | null;
  onSelect: (event: WorkspaceActivityRecord) => void;
};

const TYPE_STYLES: Record<string, string> = {
  login: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
  update: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  create: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  delete: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
  export: "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
  invite: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300",
  approve: "bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300",
  role_change: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function ActivityFeedList({ events, selectedId, onSelect }: Props) {
  if (events.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No activity matches your filters</p>
        <p className="mt-1 text-xs text-slate-500">Try a different search term or module.</p>
      </div>
    );
  }

  const groups = events.reduce<Record<string, WorkspaceActivityRecord[]>>((acc, event) => {
    if (!acc[event.whenGroup]) acc[event.whenGroup] = [];
    acc[event.whenGroup].push(event);
    return acc;
  }, {});

  const groupOrder = ["Today", "Yesterday", "This week"];

  return (
    <div className="max-h-[min(720px,70vh)] overflow-y-auto">
      {groupOrder
        .filter((g) => groups[g]?.length)
        .map((group) => (
          <section key={group}>
            <p className="sticky top-0 z-10 border-b border-slate-100 bg-slate-50/95 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-950/95">
              {group}
            </p>
            <ul>
              {groups[group]!.map((event) => {
                const selected = selectedId === event.id;
                return (
                  <li key={event.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(event)}
                      className={cn(
                        "flex w-full gap-3 border-b border-slate-100 px-4 py-3.5 text-left transition dark:border-slate-800/80",
                        selected
                          ? "bg-[#191970]/[0.06] dark:bg-blue-950/30"
                          : "hover:bg-slate-50/90 dark:hover:bg-slate-800/40",
                      )}
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#191970] to-indigo-700 text-[10px] font-bold text-white">
                        {initials(event.userName)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">{event.userName}</span>
                          <span
                            className={cn(
                              "rounded px-1.5 py-0.5 text-[10px] font-semibold",
                              TYPE_STYLES[event.type] ?? TYPE_STYLES.update,
                            )}
                          >
                            {ACTIVITY_TYPE_LABELS[event.type]}
                          </span>
                        </span>
                        <span className="mt-0.5 block truncate text-sm text-slate-700 dark:text-slate-300">
                          {event.action}
                        </span>
                        <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-400">
                          <span>{event.module}</span>
                          <span aria-hidden>·</span>
                          <span>{event.when}</span>
                        </span>
                      </span>
                      {selected ? (
                        <span className="mt-2 h-8 w-1 shrink-0 rounded-full bg-[#191970]" aria-hidden />
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
    </div>
  );
}
