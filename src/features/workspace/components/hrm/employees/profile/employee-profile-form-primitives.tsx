"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

import { crm } from "@/features/workspace/components/crm/crm-styles";
import { cn } from "@/lib/utils/cn";

export function FormSectionBlock({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-2xl border border-slate-200/80 bg-slate-50/40 p-4 dark:border-slate-800 dark:bg-slate-950/20", className)}>
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h3>
        {description ? <p className="mt-0.5 text-xs text-slate-500">{description}</p> : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </section>
  );
}

export function FormField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
  readOnly,
  hint,
  span = 1,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  readOnly?: boolean;
  hint?: string;
  span?: 1 | 2 | 3;
}) {
  const spanClass = span === 3 ? "sm:col-span-2 lg:col-span-3" : span === 2 ? "sm:col-span-2" : "";

  return (
    <label className={cn("block", spanClass)}>
      <span className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
        {label}
        {required ? <span className="text-rose-500">*</span> : null}
      </span>
      {readOnly || !onChange ? (
        <div className="rounded-xl border border-slate-200/90 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
          {value || "—"}
        </div>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(crm.input, "w-full bg-white dark:bg-slate-900")}
        />
      )}
      {hint ? <p className="mt-1 text-[11px] text-slate-400">{hint}</p> : null}
    </label>
  );
}

export function FormSelect({
  label,
  value,
  onChange,
  options,
  required,
  readOnly,
  placeholder = "Select…",
  span = 1,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  span?: 1 | 2 | 3;
}) {
  const spanClass = span === 3 ? "sm:col-span-2 lg:col-span-3" : span === 2 ? "sm:col-span-2" : "";

  return (
    <label className={cn("block", spanClass)}>
      <span className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
        {label}
        {required ? <span className="text-rose-500">*</span> : null}
      </span>
      {readOnly || !onChange ? (
        <div className="rounded-xl border border-slate-200/90 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          {options.find((o) => o.value === value)?.label ?? value ?? "—"}
        </div>
      ) : (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(crm.select, "h-10 w-full bg-white dark:bg-slate-900")}
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    </label>
  );
}

export function FormTextArea({
  label,
  value,
  onChange,
  rows = 3,
  span = 3,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  rows?: number;
  span?: 1 | 2 | 3;
}) {
  const spanClass = span === 3 ? "sm:col-span-2 lg:col-span-3" : span === 2 ? "sm:col-span-2" : "";

  return (
    <label className={cn("block", spanClass)}>
      <span className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">{label}</span>
      <textarea
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        rows={rows}
        className={cn(crm.input, "h-auto min-h-[88px] w-full resize-y bg-white py-2.5 dark:bg-slate-900")}
      />
    </label>
  );
}

export function FormToggle({
  label,
  checked,
  onChange,
  description,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  description?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 sm:col-span-2 lg:col-span-3">
      <div>
        <p className="text-sm font-medium text-slate-900 dark:text-white">{label}</p>
        {description ? <p className="mt-0.5 text-xs text-slate-500">{description}</p> : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition",
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
  );
}

export function FormUploadPlaceholder({ label, hint }: { label: string; hint?: string }) {
  return (
    <div className="sm:col-span-2 lg:col-span-3">
      <p className="mb-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">{label}</p>
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-white px-4 py-8 text-center dark:border-slate-700 dark:bg-slate-900">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Drop file or click to upload</p>
        {hint ? <p className="mt-1 text-xs text-slate-400">{hint}</p> : null}
      </div>
    </div>
  );
}

export function AnimatedSection({ sectionKey, children }: { sectionKey: string; children: ReactNode }) {
  return (
    <motion.div
      key={sectionKey}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="space-y-4 p-5"
    >
      {children}
    </motion.div>
  );
}

export function InfoChip({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "success" | "warning" }) {
  return (
    <div
      className={cn(
        "rounded-xl border px-3 py-2",
        tone === "success" && "border-emerald-200/80 bg-emerald-50/80 dark:border-emerald-900/40 dark:bg-emerald-950/20",
        tone === "warning" && "border-amber-200/80 bg-amber-50/80 dark:border-amber-900/40 dark:bg-amber-950/20",
        tone === "default" && "border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900",
      )}
    >
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}
