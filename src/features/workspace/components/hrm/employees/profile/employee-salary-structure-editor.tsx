"use client";

import {
  DEFAULT_PAYROLL_SALARY_COMPONENTS,
  buildPayslipLines,
} from "@/features/workspace/data/hrm-payroll-salary-components";
import { formatPayrollAmount } from "@/features/workspace/data/hrm-payroll-demo";
import type { HrmEmployeeSalaryComponentAmount, PayrollSalaryComponent } from "@/types/hrm";
import { cn } from "@/lib/utils/cn";

type Props = {
  components?: PayrollSalaryComponent[];
  amounts: HrmEmployeeSalaryComponentAmount[];
  currency?: string;
  onChange: (next: HrmEmployeeSalaryComponentAmount[]) => void;
};

export function EmployeeSalaryStructureEditor({
  components = DEFAULT_PAYROLL_SALARY_COMPONENTS,
  amounts,
  currency = "INR",
  onChange,
}: Props) {
  const enabled = components.filter((c) => c.enabled).sort((a, b) => a.sortOrder - b.sortOrder);
  const amountMap = new Map(amounts.map((a) => [a.componentId, a.amount]));
  const totals = buildPayslipLines(components, amounts);

  const setAmount = (componentId: string, value: number) => {
    const next = amounts.some((a) => a.componentId === componentId)
      ? amounts.map((a) => (a.componentId === componentId ? { ...a, amount: value } : a))
      : [...amounts, { componentId, amount: value }];
    onChange(next);
  };

  return (
    <div className="col-span-full space-y-4">
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-[1fr_140px] gap-3 border-b border-slate-100 bg-slate-50 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-950/50">
          <span>Component</span>
          <span className="text-right">Monthly amount</span>
        </div>
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {enabled.map((component) => (
            <li key={component.id} className="grid grid-cols-[1fr_140px] items-center gap-3 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{component.label}</p>
                <p className="text-xs text-slate-500">{component.type === "earning" ? "Earning" : "Deduction"}</p>
              </div>
              <input
                type="number"
                min={0}
                value={amountMap.get(component.id) ?? ""}
                onChange={(e) => setAmount(component.id, Number(e.target.value) || 0)}
                className={cn(
                  "h-9 rounded-lg border border-slate-200 bg-white px-3 text-right text-sm tabular-nums outline-none focus:border-[#191970] focus:ring-1 focus:ring-[#191970]/20 dark:border-slate-700 dark:bg-slate-950",
                  component.type === "deduction" && "text-rose-700",
                )}
              />
            </li>
          ))}
        </ul>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <TotalCard label="Gross earnings" value={formatPayrollAmount(totals.grossPay, currency)} />
        <TotalCard label="Total deductions" value={formatPayrollAmount(totals.deductions, currency)} tone="danger" />
        <TotalCard label="Net pay" value={formatPayrollAmount(totals.netPay, currency)} tone="success" />
      </div>
    </div>
  );
}

function TotalCard({ label, value, tone }: { label: string; value: string; tone?: "success" | "danger" }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p
        className={cn(
          "mt-1 text-lg font-bold tabular-nums",
          tone === "success" && "text-emerald-700",
          tone === "danger" && "text-rose-600",
          !tone && "text-slate-900 dark:text-white",
        )}
      >
        {value}
      </p>
    </div>
  );
}
