"use client";

import { PayrollStatusBadge } from "@/features/workspace/components/hrm/payroll/payroll-status-badge";
import { formatPayrollInrCompact } from "@/features/workspace/data/hrm-payroll-demo";
import type { PayrollBatchRun } from "@/types/hrm";

type Props = {
  runs: PayrollBatchRun[];
};

export function PayrollRunsTable({ runs }: Props) {
  if (runs.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-500">No payroll runs yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[820px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-950/50">
            <th className="px-4 py-3">Run</th>
            <th className="px-4 py-3">Month</th>
            <th className="px-4 py-3 text-right">Employees</th>
            <th className="px-4 py-3 text-right">Gross</th>
            <th className="px-4 py-3 text-right">Deductions</th>
            <th className="px-4 py-3 text-right">Net</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {runs.map((run) => (
            <tr key={run.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
              <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">{run.runCode}</td>
              <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{run.period}</td>
              <td className="px-4 py-3 text-right tabular-nums text-slate-700 dark:text-slate-300">{run.employeeCount.toLocaleString()}</td>
              <td className="px-4 py-3 text-right tabular-nums text-slate-700 dark:text-slate-300">{formatPayrollInrCompact(run.grossPay)}</td>
              <td className="px-4 py-3 text-right tabular-nums text-rose-600">{formatPayrollInrCompact(run.deductions)}</td>
              <td className="px-4 py-3 text-right font-semibold tabular-nums text-slate-900 dark:text-white">{formatPayrollInrCompact(run.netPay)}</td>
              <td className="px-4 py-3">
                <PayrollStatusBadge status={run.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
