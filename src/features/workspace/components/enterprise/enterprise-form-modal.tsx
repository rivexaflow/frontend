"use client";

import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils/cn";

type Props = {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
  className?: string;
  size?: "md" | "lg" | "xl" | "2xl" | "full";
  flush?: boolean;
};

export function EnterpriseFormModal({
  open,
  title,
  description,
  children,
  onClose,
  className,
  size = "md",
  flush = false,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="enterprise-modal-title"
        className={cn(
          "relative z-[1] flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl border border-slate-200/80 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900 sm:rounded-2xl",
          size === "md" && "sm:max-w-md",
          size === "lg" && "sm:max-w-lg",
          size === "xl" && "sm:max-w-3xl",
          size === "2xl" && "sm:max-w-5xl",
          size === "full" && "sm:max-w-6xl",
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5 dark:border-slate-800">
          <div>
            <h2 id="enterprise-modal-title" className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
              {title}
            </h2>
            {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className={cn("overflow-y-auto", flush ? "" : "px-6 py-5")}>{children}</div>
      </div>
    </div>
  );
}

export function FormField({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="text-xs font-semibold text-slate-700 dark:text-slate-300">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
      {error ? <p className="mt-1 text-xs font-medium text-rose-600">{error}</p> : null}
    </div>
  );
}

export const inputClassName =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 dark:border-slate-700 dark:bg-slate-950";

export const selectClassName = inputClassName;
