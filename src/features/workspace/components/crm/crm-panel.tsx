"use client";

import type { ReactNode } from "react";
import { Filter, Search } from "lucide-react";

import { crm } from "@/features/workspace/components/crm/crm-styles";
import { cn } from "@/lib/utils/cn";

export function CrmPanel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn(crm.panel, className)}>{children}</div>;
}

export function CrmShell({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn(crm.shell, className)}>{children}</div>;
}

export function CrmPanelHead({
  title,
  subtitle,
  actions,
  accent,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800",
        accent && "bg-gradient-to-r from-[#191970]/[0.03] to-transparent",
      )}
    >
      <div className="min-w-0">
        <h2 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">{title}</h2>
        {subtitle ? <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function CrmPanelToolbar({
  search,
  onSearchChange,
  searchPlaceholder = "Search…",
  filters,
  actions,
}: {
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2.5 border-b border-slate-100 bg-slate-50/40 px-4 py-3 sm:flex-row sm:items-center dark:border-slate-800 dark:bg-slate-950/20">
      {onSearchChange ? (
        <div className="relative min-w-0 flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search ?? ""}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className={cn(crm.inputSm, "w-full pl-9")}
          />
        </div>
      ) : null}
      {filters ? <div className="flex flex-wrap items-center gap-2">{filters}</div> : null}
      {actions ? <div className="flex flex-wrap items-center gap-2 sm:ml-auto">{actions}</div> : null}
    </div>
  );
}

export function CrmFilterButton({ active, onClick }: { active?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-lg border shadow-sm transition",
        active
          ? "border-[#191970]/30 bg-[#191970]/10 text-[#191970]"
          : "border-slate-200/90 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:border-slate-700 dark:bg-slate-900",
      )}
      aria-label="Filters"
    >
      <Filter className="h-3.5 w-3.5" />
    </button>
  );
}

export function CrmPanelBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("p-4 md:p-5", className)}>{children}</div>;
}

export function CrmPanelFooter({ children }: { children: ReactNode }) {
  return (
    <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-3 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-950/30">
      {children}
    </div>
  );
}

export function CrmNotice({
  children,
  tone = "info",
}: {
  children: ReactNode;
  tone?: "info" | "warning";
}) {
  return (
    <div
      className={cn(
        "mx-4 mt-4 rounded-xl border px-4 py-3 text-xs leading-relaxed md:mx-5",
        tone === "info" &&
          "border-sky-200/80 bg-gradient-to-r from-sky-50 to-white text-sky-950 dark:border-sky-900/40 dark:from-sky-950/30 dark:to-slate-900 dark:text-sky-100",
        tone === "warning" &&
          "border-amber-200/80 bg-gradient-to-r from-amber-50 to-white text-amber-950 dark:border-amber-900/40 dark:from-amber-950/30 dark:to-slate-900",
      )}
    >
      {children}
    </div>
  );
}

export function CrmSettingsRow({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-100 py-5 last:border-0 sm:flex-row sm:items-start sm:justify-between dark:border-slate-800">
      <div className="sm:max-w-sm">
        <p className="text-sm font-medium text-slate-900 dark:text-white">{label}</p>
        {hint ? <p className="mt-1 text-xs leading-relaxed text-slate-500">{hint}</p> : null}
      </div>
      <div className="w-full shrink-0 sm:max-w-xs">{children}</div>
    </div>
  );
}

export function CrmSettingsToggleRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked?: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <CrmSettingsRow label={label} hint={hint}>
      <div className="flex justify-end">
        <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange?.(!checked)}
        className={cn(
          "relative ml-auto flex h-6 w-11 shrink-0 rounded-full transition",
          checked ? "bg-[#191970]" : "bg-slate-200 dark:bg-slate-700",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition",
            checked ? "left-[22px]" : "left-0.5",
          )}
        />
      </button>
      </div>
    </CrmSettingsRow>
  );
}
