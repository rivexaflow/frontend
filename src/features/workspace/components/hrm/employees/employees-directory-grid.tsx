"use client";

import { ChevronRight, Plus, Users } from "lucide-react";

import { EmployeeStatusBadge } from "@/features/workspace/components/hrm/employees/employee-status-badge";
import {
  getManagerName,
  HRM_EMPLOYMENT_TYPES,
  type HrmEmployeeRecord,
} from "@/features/workspace/data/hrm-employees-demo";
import { cn } from "@/lib/utils/cn";

const BRAND = "#191970";

const DEPT_ACCENT: Record<string, string> = {
  Executive: "from-[#191970] to-indigo-700",
  Revenue: "from-blue-600 to-indigo-600",
  People: "from-violet-600 to-purple-600",
  Finance: "from-amber-500 to-orange-600",
  Operations: "from-slate-600 to-slate-700",
  Engineering: "from-cyan-600 to-sky-600",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function deptAccent(department: string) {
  return DEPT_ACCENT[department] ?? "from-[#191970] to-indigo-700";
}

type Props = {
  employees: HrmEmployeeRecord[];
  allEmployees: HrmEmployeeRecord[];
  selectedId: string | null;
  onSelect: (employee: HrmEmployeeRecord) => void;
  onAdd: () => void;
};

function EmployeeCard({
  employee,
  allEmployees,
  selected,
  onSelect,
}: {
  employee: HrmEmployeeRecord;
  allEmployees: HrmEmployeeRecord[];
  selected: boolean;
  onSelect: () => void;
}) {
  const accent = deptAccent(employee.department);
  const typeLabel = HRM_EMPLOYMENT_TYPES.find((t) => t.id === employee.employmentType)?.label;
  const manager = getManagerName(allEmployees, employee.managerId);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group relative flex w-full overflow-hidden rounded-xl border bg-white text-left shadow-sm transition-all duration-200 dark:bg-slate-900",
        selected
          ? "border-[#191970] shadow-md ring-1 ring-[#191970]/25"
          : "border-slate-200/90 hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:hover:border-slate-700",
      )}
    >
      <div className={cn("w-1 shrink-0 bg-gradient-to-b", accent)} aria-hidden />
      <div className="min-w-0 flex-1 px-3 py-3">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-xs font-bold text-white",
              accent,
            )}
          >
            {initials(employee.name)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{employee.name}</p>
              <ChevronRight
                className={cn(
                  "h-3.5 w-3.5 shrink-0 text-slate-300 transition group-hover:text-[#191970]",
                  selected && "text-[#191970]",
                )}
                aria-hidden
              />
            </div>
            <p className="truncate text-[11px] font-medium text-slate-500">{employee.designation}</p>
          </div>
        </div>
        <p className="mt-2 truncate font-mono text-[11px] text-slate-400">{employee.employeeCode}</p>
        <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-slate-100 pt-2 dark:border-slate-800">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            <EmployeeStatusBadge status={employee.status} className="!px-1.5 !py-0 !text-[9px]" />
            <span className="truncate text-[10px] font-semibold text-slate-500">
              {employee.department}
              {typeLabel ? ` · ${typeLabel}` : ""}
            </span>
          </div>
          <span className="shrink-0 truncate text-[10px] text-slate-400">{manager}</span>
        </div>
      </div>
    </button>
  );
}

function AddEmployeeCard({ onAdd }: { onAdd: () => void }) {
  return (
    <button
      type="button"
      onClick={onAdd}
      className="group flex w-full items-center gap-3 overflow-hidden rounded-xl border border-dashed border-slate-200 bg-gradient-to-r from-slate-50/80 to-blue-50/40 px-3 py-3 text-left transition hover:border-[#191970]/40 hover:shadow-sm dark:border-slate-700 dark:from-slate-950/40 dark:to-blue-950/20"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#191970] to-indigo-700 text-white shadow-sm transition group-hover:scale-105">
        <Plus className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">Add employee</p>
        <p className="truncate text-[11px] text-slate-500">Create profile & assign manager</p>
      </div>
      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300 group-hover:text-[#191970]" />
    </button>
  );
}

export function EmployeesDirectoryGrid({ employees, allEmployees, selectedId, onSelect, onAdd }: Props) {
  if (employees.length === 0) {
    return (
      <div className="px-4 py-12 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
          <Users className="h-5 w-5 text-slate-400" />
        </div>
        <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-200">No employees match your filters</p>
        <button
          type="button"
          onClick={onAdd}
          className="mt-4 inline-flex h-8 items-center gap-1.5 rounded-lg px-3.5 text-xs font-semibold text-white"
          style={{ backgroundColor: BRAND }}
        >
          <Plus className="h-3.5 w-3.5" />
          Add employee
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 bg-slate-50/50 p-3 min-[640px]:grid-cols-2 min-[900px]:grid-cols-3 min-[1280px]:grid-cols-3 min-[1536px]:grid-cols-4 dark:bg-slate-950/20">
      {employees.map((employee) => (
        <EmployeeCard
          key={employee.id}
          employee={employee}
          allEmployees={allEmployees}
          selected={selectedId === employee.id}
          onSelect={() => onSelect(employee)}
        />
      ))}
      <AddEmployeeCard onAdd={onAdd} />
    </div>
  );
}
