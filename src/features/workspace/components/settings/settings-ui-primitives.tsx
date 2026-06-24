"use client";

import type { LucideIcon } from "lucide-react";

import { crm } from "@/features/workspace/components/crm/crm-styles";
import { cn } from "@/lib/utils/cn";

export function SettingsLoading() {
  return (
    <div className="flex h-56 items-center justify-center rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900">
      <svg className="h-8 w-8 animate-spin text-[#191970]" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.4" strokeOpacity="0.3" />
        <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export function SettingsErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-rose-100 bg-rose-50 p-3.5 text-xs font-semibold text-rose-700 dark:border-rose-950/30 dark:bg-rose-950/20">
      {message}
    </div>
  );
}

export function SettingsSection({
  title,
  description,
  icon: Icon,
  children,
  className,
  footer,
  tone = "default",
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
  tone?: "default" | "danger";
}) {
  return (
    <section
      className={cn(
        crm.panel,
        "overflow-hidden",
        tone === "danger" && "border-rose-200/80 dark:border-rose-900/40",
        className,
      )}
    >
      <div
        className={cn(
          "border-b px-5 py-4 sm:px-6",
          tone === "danger"
            ? "border-rose-100 bg-rose-50/40 dark:border-rose-950/30 dark:bg-rose-950/10"
            : "border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/30",
        )}
      >
        <div className="flex items-start gap-3">
          {Icon ? (
            <span
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                tone === "danger"
                  ? "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                  : "bg-[#191970]/10 text-[#191970] dark:bg-[#2277FF]/10 dark:text-[#2277FF]",
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
          ) : null}
          <div className="min-w-0">
            <h2
              className={cn(
                "text-sm font-bold text-slate-900 dark:text-white",
                tone === "danger" && "text-rose-800 dark:text-rose-300",
              )}
            >
              {title}
            </h2>
            {description ? <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{description}</p> : null}
          </div>
        </div>
      </div>
      <div className="px-5 py-5 sm:px-6">{children}</div>
      {footer ? (
        <div className="border-t border-slate-100 bg-slate-50/40 px-5 py-4 dark:border-slate-800 dark:bg-slate-950/20 sm:px-6">
          {footer}
        </div>
      ) : null}
    </section>
  );
}

export function SettingsField({
  label,
  htmlFor,
  hint,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)} htmlFor={htmlFor}>
      <span className={crm.sectionLabel}>{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint ? <p className="mt-1 text-[11px] text-slate-400">{hint}</p> : null}
    </label>
  );
}

export function SettingsStatPill({
  label,
  value,
  icon: Icon,
  tone = "slate",
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  tone?: "blue" | "purple" | "amber" | "emerald" | "slate";
}) {
  const toneClass = {
    blue: "border-blue-100 bg-blue-50/80 text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-300",
    purple:
      "border-purple-100 bg-purple-50/80 text-purple-700 dark:border-purple-900/40 dark:bg-purple-950/20 dark:text-purple-300",
    amber:
      "border-amber-100 bg-amber-50/80 text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300",
    emerald:
      "border-emerald-100 bg-emerald-50/80 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300",
    slate:
      "border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200",
  }[tone];

  return (
    <div className={cn("flex items-center gap-3 rounded-xl border px-3.5 py-2.5 shadow-sm", toneClass)}>
      <Icon className="h-4 w-4 shrink-0 opacity-80" />
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wide opacity-70">{label}</p>
        <p className="text-lg font-bold tabular-nums leading-tight">{value}</p>
      </div>
    </div>
  );
}

export type SettingsNavItem = {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
};

export type SettingsNavGroup = {
  title: string;
  items: SettingsNavItem[];
};

export function SettingsNav({
  groups,
  activeId,
  onSelect,
}: {
  groups: SettingsNavGroup[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <nav className="space-y-5" aria-label="Settings sections">
      {groups.map((group) => (
        <div key={group.title}>
          <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{group.title}</p>
          <div className="space-y-1">
            {group.items.map((item) => {
              const active = activeId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelect(item.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition",
                    active
                      ? "border-[#191970]/25 bg-[#191970]/[0.04] shadow-sm dark:border-[#2277FF]/30 dark:bg-[#2277FF]/[0.06]"
                      : "border-transparent bg-transparent hover:border-slate-200 hover:bg-white dark:hover:border-slate-700 dark:hover:bg-slate-900/80",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                      active
                        ? "bg-[#191970] text-white dark:bg-[#2277FF]"
                        : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {item.label}
                    </span>
                    <span className="block truncate text-[11px] text-slate-400">{item.description}</span>
                  </span>
                  {active ? <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#2277FF]" /> : null}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
