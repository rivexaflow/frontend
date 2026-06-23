"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Copy, Pencil, Trash2 } from "lucide-react";

import { crm } from "@/features/workspace/components/crm/crm-styles";
import { cn } from "@/lib/utils/cn";

export function CrmRecordAvatar({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#191970] via-indigo-700 to-indigo-500 font-bold text-white ring-2 ring-white dark:ring-slate-900",
        size === "sm" ? "h-8 w-8 text-[10px]" : "h-9 w-9 text-xs",
      )}
    >
      {initials}
    </span>
  );
}

export function CrmSourceTag({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#191970]/15 bg-[#191970]/[0.06] px-2.5 py-1 text-[11px] font-semibold text-[#191970]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#191970]" />
      {label}
    </span>
  );
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode };

export function CrmPrimaryButton({ children, className, ...props }: BtnProps) {
  return (
    <button type="button" className={cn(crm.btnPrimarySm, className)} {...props}>
      {children}
    </button>
  );
}

export function CrmGhostButton({ children, className, ...props }: BtnProps) {
  return (
    <button type="button" className={cn(crm.btnSecondarySm, className)} {...props}>
      {children}
    </button>
  );
}

export function CrmRowActions({
  onEdit,
  onDelete,
  onCopy,
  extra,
}: {
  onEdit?: () => void;
  onDelete?: () => void;
  onCopy?: () => void;
  extra?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-end gap-1">
      {extra}
      {onEdit ? (
        <button
          type="button"
          onClick={onEdit}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-[#191970]/10 hover:text-[#191970]"
          aria-label="Edit"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      ) : null}
      {onCopy ? (
        <button
          type="button"
          onClick={onCopy}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          aria-label="Duplicate"
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
      ) : null}
      {onDelete ? (
        <button
          type="button"
          onClick={onDelete}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
          aria-label="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  );
}

export function CrmDragHandle() {
  return (
    <span className="inline-flex cursor-grab rounded p-0.5 text-slate-300 transition hover:bg-slate-100 hover:text-slate-500 active:cursor-grabbing" aria-hidden>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
        <circle cx="4" cy="3" r="1.2" />
        <circle cx="10" cy="3" r="1.2" />
        <circle cx="4" cy="7" r="1.2" />
        <circle cx="10" cy="7" r="1.2" />
        <circle cx="4" cy="11" r="1.2" />
        <circle cx="10" cy="11" r="1.2" />
      </svg>
    </span>
  );
}
