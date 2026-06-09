"use client";

import { ChevronRight, Wallet } from "lucide-react";

import { PayrollStatusBadge } from "@/features/workspace/components/hrm/payroll/payroll-status-badge";
import {
  formatPayrollAmount,
  type PayrollRecord,
} from "@/features/workspace/data/hrm-payroll-demo";
import { cn } from "@/lib/utils/cn";

type Props = {
  records: PayrollRecord[];
  selectedId: string | null;
  onSelect: (record: PayrollRecord) => void;
};

function PayrollCard({
  record,
  selected,
  onSelect,
}: {
  record: PayrollRecord;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group flex w-full flex-col rounded-xl border bg-white p-4 text-left shadow-sm transition dark:bg-slate-900",
        selected
          ? "border-[#191970] ring-1 ring-[#191970]/25"
          : "border-slate-200/90 hover:border-slate-300 hover:shadow-md dark:border-slate-800",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{record.employeeName}</p>
          <p className="font-mono text-[11px] text-slate-500">{record.employeeCode}</p>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 group-hover:text-[#191970]" />
      </div>
      <p className="mt-2 font-mono text-[11px] text-slate-400">{record.payslipId}</p>
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Net pay</p>
          <p className="text-sm font-bold tabular-nums text-slate-900 dark:text-white">
            {formatPayrollAmount(record.netPay, record.currency)}
          </p>
        </div>
        <PayrollStatusBadge status={record.status} />
      </div>
      <p className="mt-2 text-[11px] text-slate-500">
        {record.period} · {record.department}
      </p>
    </button>
  );
}

export function PayrollDirectoryGrid({ records, selectedId, onSelect }: Props) {
  if (records.length === 0) {
    return (
      <div className="px-4 py-12 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
          <Wallet className="h-5 w-5 text-slate-400" />
        </div>
        <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-200">No payroll records match your filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 bg-slate-50/50 p-3 min-[640px]:grid-cols-2 min-[900px]:grid-cols-3 min-[1280px]:grid-cols-4 dark:bg-slate-950/20">
      {records.map((record) => (
        <PayrollCard
          key={record.id}
          record={record}
          selected={selectedId === record.id}
          onSelect={() => onSelect(record)}
        />
      ))}
    </div>
  );
}
