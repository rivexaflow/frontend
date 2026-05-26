"use client";

import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export const adminInputClass =
  "h-10 w-full rounded-lg border border-slate-200/90 bg-white px-3.5 text-sm text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.03)] outline-none transition placeholder:text-slate-400 focus:border-[#2277FF] focus:ring-2 focus:ring-[#2277FF]/12";

export const adminSelectClass =
  "h-10 min-w-[9.5rem] rounded-lg border border-slate-200/90 bg-white px-3 text-sm text-slate-800 shadow-[0_1px_2px_rgba(15,23,42,0.03)] outline-none focus:border-[#2277FF] focus:ring-2 focus:ring-[#2277FF]/12";

export function AdminAlert({
  children,
  tone = "error",
}: {
  children: ReactNode;
  tone?: "error" | "info";
}) {
  return (
    <div
      role="alert"
      className={cn(
        "mb-5 flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm",
        tone === "error"
          ? "border-rose-200/80 bg-rose-50/90 text-rose-800"
          : "border-sky-200/80 bg-sky-50/90 text-sky-900",
      )}
    >
      {children}
    </div>
  );
}

export function AdminPanel({
  title,
  description,
  action,
  children,
  className,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(25,25,112,0.08)]",
        className,
      )}
    >
      {title ? (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-[#191970]">{title}</h2>
            {description ? <p className="mt-0.5 text-xs text-slate-500">{description}</p> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}

export function AdminToolbar({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:flex-row sm:flex-wrap sm:items-center",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function AdminSearchInput({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  className?: string;
}) {
  return (
    <div className={cn("relative min-w-[200px] flex-1 sm:max-w-md", className)}>
      <svg
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(adminInputClass, "pl-10")}
      />
    </div>
  );
}

export function AdminTableWrap({ children }: { children: ReactNode }) {
  return <div className="overflow-x-auto">{children}</div>;
}

export function AdminTable({ children, minWidth = "720px" }: { children: ReactNode; minWidth?: string }) {
  return (
    <table className="w-full text-left text-sm" style={{ minWidth }}>
      {children}
    </table>
  );
}

export function AdminThead({ children }: { children: ReactNode }) {
  return (
    <thead className="border-b border-slate-100 bg-[#f8fafc]">
      <tr className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-slate-500">{children}</tr>
    </thead>
  );
}

export function AdminTh({ children, className }: { children: ReactNode; className?: string }) {
  return <th className={cn("px-5 py-3.5 font-semibold first:pl-6 last:pr-6", className)}>{children}</th>;
}

export function AdminTbody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-slate-100/90">{children}</tbody>;
}

export function AdminTr({ children, className }: { children: ReactNode; className?: string }) {
  return <tr className={cn("transition-colors hover:bg-[#f8faff]/80", className)}>{children}</tr>;
}

export function AdminTd({
  children,
  className,
  colSpan,
}: {
  children?: ReactNode;
  className?: string;
  colSpan?: number;
}) {
  return (
    <td colSpan={colSpan} className={cn("px-5 py-4 align-middle first:pl-6 last:pr-6", className)}>
      {children}
    </td>
  );
}

export function AdminTableFooter({
  left,
  right,
}: {
  left: ReactNode;
  right?: ReactNode;
}) {
  return (
    <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/40 px-5 py-3.5 sm:px-6">
      <p className="text-xs font-medium text-slate-500">{left}</p>
      {right ? <div className="flex items-center gap-2">{right}</div> : null}
    </footer>
  );
}

export function AdminPagination({
  page,
  totalPages,
  total,
  label,
  onPrev,
  onNext,
}: {
  page: number;
  totalPages: number;
  total: number;
  label: string;
  onPrev: () => void;
  onNext: () => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <AdminTableFooter
      left={
        <>
          Page <span className="font-semibold text-slate-700">{page}</span> of{" "}
          <span className="font-semibold text-slate-700">{totalPages}</span>
          <span className="mx-2 text-slate-300">·</span>
          {total.toLocaleString()} {label}
        </>
      }
      right={
        <>
          <button
            type="button"
            disabled={page <= 1}
            onClick={onPrev}
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={onNext}
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </>
      }
    />
  );
}

export function AdminEmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-[#eef2ff] to-[#e0e7ff] text-[#4338ca]">
        <Icon className="h-6 w-6" strokeWidth={1.75} />
      </span>
      <p className="mt-4 text-sm font-semibold text-[#191970]">{title}</p>
      <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-500">{description}</p>
    </div>
  );
}

export function AdminSkeletonRows({ cols, rows = 5 }: { cols: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <AdminTr key={i}>
          <AdminTd colSpan={cols}>
            <div className="h-3.5 w-full max-w-md animate-pulse rounded-full bg-slate-100" />
          </AdminTd>
        </AdminTr>
      ))}
    </>
  );
}

export function AdminAvatar({ name }: { name: string }) {
  const parts = name.trim().split(/\s+/);
  const initials =
    parts.length >= 2
      ? `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase()
      : (name.slice(0, 2) || "??").toUpperCase();
  return (
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#2277FF] to-[#6366f1] text-[11px] font-bold text-white shadow-sm ring-2 ring-white">
      {initials}
    </span>
  );
}

export function AdminBtnPrimary({
  children,
  onClick,
  disabled,
  type = "button",
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg bg-[#191970] px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_14px_-4px_rgba(25,25,112,0.55)] transition hover:bg-[#12145c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2277FF]/40 disabled:opacity-60",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function AdminBtnSecondary({
  children,
  onClick,
  disabled,
  type = "button",
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function AdminInlineSelect({
  value,
  onChange,
  options,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-slate-200/90 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm outline-none focus:border-[#2277FF] focus:ring-2 focus:ring-[#2277FF]/12 disabled:opacity-50"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
