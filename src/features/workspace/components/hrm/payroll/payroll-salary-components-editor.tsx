"use client";

import type { PayrollSalaryComponent } from "@/types/hrm";
import { cn } from "@/lib/utils/cn";

type Props = {
  components: PayrollSalaryComponent[];
  onChange: (next: PayrollSalaryComponent[]) => void;
};

export function PayrollSalaryComponentsEditor({ components, onChange }: Props) {
  const sorted = [...components].sort((a, b) => a.sortOrder - b.sortOrder);

  const toggle = (id: string) => {
    onChange(components.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c)));
  };

  return (
    <div className="col-span-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
      <div className="grid grid-cols-[1fr_auto_auto] gap-3 border-b border-slate-100 bg-slate-50 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-950/50">
        <span>Salary head</span>
        <span>Type</span>
        <span>Active</span>
      </div>
      <ul className="divide-y divide-slate-100 dark:divide-slate-800">
        {sorted.map((component) => (
          <li key={component.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{component.label}</p>
              <p className="font-mono text-xs text-slate-500">{component.code}</p>
            </div>
            <span
              className={cn(
                "rounded-md px-2 py-0.5 text-[11px] font-semibold capitalize",
                component.type === "earning"
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
              )}
            >
              {component.type}
            </span>
            <label className="inline-flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={component.enabled}
                onChange={() => toggle(component.id)}
                className="h-4 w-4 rounded border-slate-300 text-[#191970] focus:ring-[#191970]/30"
              />
              <span className="sr-only">Enable {component.label}</span>
            </label>
          </li>
        ))}
      </ul>
      <p className="border-t border-slate-100 px-4 py-2.5 text-xs text-slate-500 dark:border-slate-800">
        Enabled heads appear on employee payroll profiles and monthly payslips. Amounts are set per employee.
      </p>
    </div>
  );
}
