"use client";

import { cn } from "@/lib/utils/cn";

export type SegmentTab = {
  id: string;
  label: string;
  count?: number;
};

type Props = {
  tabs: SegmentTab[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
};

export function EnterpriseSegmentTabs({ tabs, activeId, onChange, className }: Props) {
  return (
    <div
      className={cn(
        "flex flex-wrap gap-1 rounded-xl border border-slate-200/80 bg-slate-50/80 p-1 dark:border-slate-800 dark:bg-slate-900/50",
        className,
      )}
      role="tablist"
    >
      {tabs.map((tab) => {
        const active = tab.id === activeId;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition",
              active
                ? "bg-white text-blue-700 shadow-sm dark:bg-slate-800 dark:text-blue-400"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400",
            )}
          >
            {tab.label}
            {tab.count !== undefined ? (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                  active ? "bg-blue-100 text-blue-700" : "bg-slate-200/80 text-slate-600",
                )}
              >
                {tab.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
