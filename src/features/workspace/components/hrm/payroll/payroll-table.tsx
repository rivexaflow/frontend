"use client";

import { ChevronRight } from "lucide-react";

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

export function PayrollTable({ records, selectedId, onSelect }: Props) {
  if (records.length === 0) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No payroll records match your filters</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[880px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-xs font-medium text-slate-500 dark:border-slate-800 dark:bg-slate-950/50">
            <th className="px-4 py-3">Employee</th>
            <th className="px-4 py-3">Payslip</th>
            <th className="hidden px-4 py-3 md:table-cell">Period</th>
            <th className="hidden px-4 py-3 lg:table-cell">Department</th>
            <th className="px-4 py-3 text-right">Gross</th>
            <th className="px-4 py-3 text-right">Net pay</th>
            <th className="px-4 py-3">Status</th>
            <th className="w-10 px-2 py-3" aria-hidden />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {records.map((row) => {
            const selected = selectedId === row.id;
            return (
              <tr
                key={row.id}
                onClick={() => onSelect(row)}
                className={cn(
                  "cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50",
                  selected && "bg-[#191970]/[0.04] dark:bg-blue-950/20",
                )}
              >
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900 dark:text-white">{row.employeeName}</p>
                  <p className="font-mono text-xs text-slate-500">{row.employeeCode}</p>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{row.payslipId}</td>
                <td className="hidden px-4 py-3 text-slate-600 md:table-cell">{row.period}</td>
                <td className="hidden px-4 py-3 text-slate-600 lg:table-cell">{row.department}</td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-700 dark:text-slate-300">
                  {formatPayrollAmount(row.grossPay, row.currency)}
                </td>
                <td className="px-4 py-3 text-right font-medium tabular-nums text-slate-900 dark:text-white">
                  {formatPayrollAmount(row.netPay, row.currency)}
                </td>
                <td className="px-4 py-3">
                  <PayrollStatusBadge status={row.status} />
                </td>
                <td className="px-2 py-3 text-slate-300">
                  <ChevronRight className="h-4 w-4" />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
