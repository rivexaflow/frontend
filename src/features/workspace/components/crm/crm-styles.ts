/** Shared Tailwind class strings for CRM surfaces — keep visual language consistent. */

export const crm = {
  page: "pb-8",
  shell:
    "overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.04)] dark:border-slate-800 dark:bg-slate-900",
  panel:
    "overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:border-slate-800 dark:bg-slate-900",
  input:
    "h-9 rounded-xl border border-slate-200/90 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#191970] focus:ring-2 focus:ring-[#191970]/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100",
  inputSm:
    "h-8 rounded-lg border border-slate-200/90 bg-white px-2.5 text-xs text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#191970] focus:ring-2 focus:ring-[#191970]/10 dark:border-slate-700 dark:bg-slate-950",
  select:
    "h-8 appearance-none rounded-lg border border-slate-200/90 bg-white px-2.5 pr-8 text-xs font-medium text-slate-700 shadow-sm outline-none transition focus:border-[#191970] focus:ring-2 focus:ring-[#191970]/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200",
  btnPrimary:
    "inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-[#191970] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#12124a] active:scale-[0.98] disabled:opacity-50",
  btnPrimarySm:
    "inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-[#191970] px-3 text-xs font-semibold text-white shadow-sm transition hover:bg-[#12124a] active:scale-[0.98] disabled:opacity-50",
  btnSecondary:
    "inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-200/90 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200",
  btnSecondarySm:
    "inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-slate-200/90 bg-white px-3 text-xs font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900",
  tableHead:
    "border-b border-slate-100 bg-slate-50/90 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:border-slate-800 dark:bg-slate-950/50",
  tableRow: "transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40",
  metricPill:
    "inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-2.5 py-1 text-xs shadow-sm dark:border-slate-700 dark:bg-slate-900",
  sectionLabel: "text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400",
} as const;
