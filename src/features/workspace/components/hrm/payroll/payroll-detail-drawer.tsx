"use client";

import { useEffect } from "react";
import { Building2, Calendar, Download, MapPin, X } from "lucide-react";

import { StatusBadge } from "@/features/workspace/components/enterprise/enterprise-data-table";
import {
  formatPayrollAmount,
  type PayrollRecord,
} from "@/features/workspace/data/hrm-payroll-demo";

const STATUS_TONE = {
  completed: "emerald",
  processing: "amber",
  draft: "slate",
  failed: "rose",
} as const;

const STATUS_LABEL = {
  completed: "Paid",
  processing: "Processing",
  draft: "Draft",
  failed: "Failed",
} as const;

type Props = {
  record: PayrollRecord | null;
  onClose: () => void;
};

export function PayrollDetailDrawer({ record, onClose }: Props) {
  useEffect(() => {
    if (!record) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [record, onClose]);

  if (!record) return null;

  return (
    <div className="fixed inset-0 z-[130] flex justify-end">
      <button type="button" className="absolute inset-0 bg-slate-900/40" aria-label="Close" onClick={onClose} />
      <aside className="relative z-[1] flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{record.employeeName}</h2>
            <p className="text-sm text-slate-500">{record.period} · {record.payslipId}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
          <StatusBadge label={STATUS_LABEL[record.status]} tone={STATUS_TONE[record.status]} />

          <div className="rounded-xl border border-slate-200/80 p-4 dark:border-slate-800">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Gross pay</span>
                <span className="font-medium tabular-nums">{formatPayrollAmount(record.grossPay, record.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Deductions</span>
                <span className="font-medium tabular-nums">{formatPayrollAmount(record.deductions, record.currency)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                <span className="font-semibold text-slate-900 dark:text-white">Net pay</span>
                <span className="font-bold tabular-nums text-slate-900 dark:text-white">
                  {formatPayrollAmount(record.netPay, record.currency)}
                </span>
              </div>
            </dl>
          </div>

          <dl className="space-y-3 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-slate-400" />
              <span>{record.department}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-slate-400" />
              <span>{record.location}</span>
            </div>
            {record.paidOn ? (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span>Paid {record.paidOn}</span>
              </div>
            ) : null}
          </dl>
        </div>

        <div className="border-t border-slate-100 px-5 py-4 dark:border-slate-800">
          <button
            type="button"
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700"
          >
            <Download className="h-4 w-4" />
            Download payslip
          </button>
        </div>
      </aside>
    </div>
  );
}
