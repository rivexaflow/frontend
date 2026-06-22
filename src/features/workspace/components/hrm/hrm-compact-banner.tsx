"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Stat = { label: string; value: string | number; tone?: "default" | "success" | "warning" | "danger" };

type Props = {
  title: string;
  subtitle?: string;
  stats?: Stat[];
  actions?: ReactNode;
  className?: string;
};

const STAT_TONE: Record<NonNullable<Stat["tone"]>, string> = {
  default: "text-white",
  success: "text-emerald-200",
  warning: "text-amber-200",
  danger: "text-rose-200",
};

export function HrmCompactBanner({ title, subtitle, stats, actions, className }: Props) {
  return (
    <div
      className={cn(
        "relative overflow-hidden border-b border-[#12124a]/20 bg-gradient-to-r from-[#191970] via-[#1e1e7a] to-[#252580] px-4 py-3.5 sm:px-5",
        className,
      )}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/[0.04]" />
      <div className="pointer-events-none absolute -bottom-6 left-1/3 h-24 w-24 rounded-full bg-white/[0.03]" />
      <div className="relative flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-base font-bold tracking-tight text-white sm:text-lg">{title}</h1>
          {subtitle ? <p className="mt-0.5 text-[11px] text-indigo-200/80 sm:text-xs">{subtitle}</p> : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {stats?.map((s) => (
            <div
              key={s.label}
              className="flex items-baseline gap-1.5 rounded-lg bg-white/10 px-2.5 py-1 ring-1 ring-white/10 backdrop-blur-sm"
            >
              <span className={cn("text-sm font-bold tabular-nums", STAT_TONE[s.tone ?? "default"])}>{s.value}</span>
              <span className="text-[10px] font-medium uppercase tracking-wide text-indigo-200/70">{s.label}</span>
            </div>
          ))}
          {actions}
        </div>
      </div>
    </div>
  );
}

export function HrmPanelTabs<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: T; label: string; count?: number }[];
  active: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="flex gap-0 overflow-x-auto border-b border-slate-100 bg-white px-1 dark:border-slate-800 dark:bg-slate-900">
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative shrink-0 px-3 py-2.5 text-xs font-semibold transition",
              isActive
                ? "text-[#191970] dark:text-indigo-300"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white",
            )}
          >
            {tab.label}
            {tab.count != null ? (
              <span
                className={cn(
                  "ml-1.5 rounded-md px-1.5 py-0.5 text-[10px] tabular-nums",
                  isActive ? "bg-[#191970]/10 text-[#191970]" : "bg-slate-100 text-slate-500",
                )}
              >
                {tab.count}
              </span>
            ) : null}
            {isActive ? (
              <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-[#191970] dark:bg-indigo-400" />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
