"use client";

import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { Download, Eye, Printer } from "lucide-react";

import { PayrollPayslipDocument } from "@/features/workspace/components/hrm/payroll/payroll-payslip-document";
import { PayrollStatusBadge } from "@/features/workspace/components/hrm/payroll/payroll-status-badge";
import { formatPayrollAmount, getDemoPayslipDetail } from "@/features/workspace/data/hrm-payroll-demo";
import { downloadHrPayrollRun } from "@/lib/api/hrm";
import { downloadPayslipHtml, payslipDocumentTitle, printPayslipElement } from "@/lib/hrm/payslip-export";
import type { PayrollRecord } from "@/types/hrm";
import { cn } from "@/lib/utils/cn";

type Props = {
  records: PayrollRecord[];
  companyId: string | null;
  onView: (record: PayrollRecord) => void;
};

function withRenderedSlip(record: PayrollRecord, action: (el: HTMLElement, detail: ReturnType<typeof getDemoPayslipDetail>) => void) {
  const host = document.createElement("div");
  host.style.position = "fixed";
  host.style.left = "-9999px";
  document.body.appendChild(host);
  const root = createRoot(host);
  const detail = getDemoPayslipDetail(record);

  flushSync(() => {
    root.render(<PayrollPayslipDocument detail={detail} />);
  });

  const el = host.querySelector<HTMLElement>("#payslip-document");
  if (el) action(el, detail);

  root.unmount();
  host.remove();
}

export function PayrollPayslipsTable({ records, companyId, onView }: Props) {
  if (records.length === 0) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No payslips match your filters</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[960px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-950/50">
            <th className="px-4 py-3">Employee</th>
            <th className="hidden px-4 py-3 md:table-cell">Department</th>
            <th className="px-4 py-3 text-right">Basic</th>
            <th className="hidden px-4 py-3 text-right lg:table-cell">Allowance</th>
            <th className="px-4 py-3 text-right">Deduction</th>
            <th className="px-4 py-3 text-right">Net pay</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Payslip</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {records.map((row) => {
            const basic = row.basicPay ?? Math.round(row.grossPay * 0.8);
            const allowance = row.allowance ?? row.grossPay - basic;
            return (
              <tr key={row.id} className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-900 dark:text-white">{row.employeeName}</p>
                  <p className="font-mono text-xs text-slate-500">{row.employeeCode}</p>
                </td>
                <td className="hidden px-4 py-3 text-slate-600 md:table-cell">{row.department}</td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-700 dark:text-slate-300">
                  {formatPayrollAmount(basic, row.currency)}
                </td>
                <td className="hidden px-4 py-3 text-right tabular-nums text-slate-700 lg:table-cell dark:text-slate-300">
                  {formatPayrollAmount(allowance, row.currency)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-rose-600">
                  {formatPayrollAmount(row.deductions, row.currency)}
                </td>
                <td className="px-4 py-3 text-right font-semibold tabular-nums text-slate-900 dark:text-white">
                  {formatPayrollAmount(row.netPay, row.currency)}
                </td>
                <td className="px-4 py-3">
                  <PayrollStatusBadge status={row.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1.5">
                    <ActionBtn icon={Eye} label="View" onClick={() => onView(row)} />
                    <ActionBtn
                      icon={Printer}
                      label="Print"
                      onClick={() =>
                        withRenderedSlip(row, (el, detail) => printPayslipElement(el, payslipDocumentTitle(detail)))
                      }
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (companyId) {
                          void downloadHrPayrollRun(companyId, row.id).catch(() => {
                            withRenderedSlip(row, (el, detail) => downloadPayslipHtml(detail, el));
                          });
                        } else {
                          withRenderedSlip(row, (el, detail) => downloadPayslipHtml(detail, el));
                        }
                      }}
                      className="inline-flex h-8 items-center gap-1 rounded-lg bg-[#191970] px-2.5 text-[11px] font-bold text-white hover:bg-[#12124a]"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ActionBtn({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Eye;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300",
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="hidden xl:inline">{label}</span>
    </button>
  );
}
