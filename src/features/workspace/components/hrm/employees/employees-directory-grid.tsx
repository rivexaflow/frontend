"use client";

import { useRouter } from "next/navigation";
import { ChevronRight, ExternalLink, Users } from "lucide-react";

import { crm } from "@/features/workspace/components/crm/crm-styles";
import { EmployeeStatusBadge } from "@/features/workspace/components/hrm/employees/employee-status-badge";
import {
  getManagerName,
  HRM_EMPLOYMENT_TYPES,
  type HrmEmployeeRecord,
} from "@/features/workspace/data/hrm-employees-demo";
import { hrmEmployeeProfilePath } from "@/lib/workspace/hrm-paths";
import { cn } from "@/lib/utils/cn";

const DEPT_ACCENT: Record<string, string> = {
  Executive: "from-[#191970] to-indigo-700",
  Revenue: "from-blue-600 to-indigo-600",
  People: "from-violet-600 to-purple-600",
  Finance: "from-amber-500 to-orange-600",
  Operations: "from-slate-600 to-slate-700",
  Engineering: "from-cyan-600 to-sky-600",
  "Human Resources": "from-violet-600 to-purple-600",
  Compliance: "from-slate-600 to-slate-700",
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
  onClearFilters?: () => void;
  isFiltered?: boolean;
  totalCount?: number;
};

function EmployeeCard({
  employee,
  allEmployees,
  selected,
  onSelect,
  onOpenProfile,
}: {
  employee: HrmEmployeeRecord;
  allEmployees: HrmEmployeeRecord[];
  selected: boolean;
  onSelect: () => void;
  onOpenProfile: () => void;
}) {
  const accent = deptAccent(employee.department);
  const typeLabel = HRM_EMPLOYMENT_TYPES.find((t) => t.id === employee.employmentType)?.label;
  const manager = getManagerName(allEmployees, employee.managerId);

  return (
    <div
      className={cn(
        "group relative flex w-full overflow-hidden rounded-xl border bg-white text-left transition-all duration-200 dark:bg-slate-900",
        selected
          ? "border-[#191970] shadow-md ring-1 ring-[#191970]/20"
          : "border-slate-200/90 hover:border-slate-300 hover:shadow-sm dark:border-slate-800 dark:hover:border-slate-700",
      )}
    >
      <div className={cn("w-1 shrink-0 bg-gradient-to-b", accent)} aria-hidden />
      <button type="button" onClick={onSelect} className="min-w-0 flex-1 px-3.5 py-3.5 text-left">
        <div className="flex items-center gap-3">
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
            <p className="truncate text-xs text-slate-500">{employee.designation}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="font-mono text-[11px] text-slate-400">{employee.employeeCode}</span>
          <EmployeeStatusBadge status={employee.status} className="!px-1.5 !py-0 !text-[9px]" />
        </div>
        <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-slate-100 pt-2.5 dark:border-slate-800">
          <span className="truncate text-[11px] font-medium text-slate-500">
            {employee.department}
            {typeLabel ? ` · ${typeLabel}` : ""}
          </span>
          <span className="shrink-0 truncate text-[10px] text-slate-400">{manager}</span>
        </div>
      </button>
      <button
        type="button"
        onClick={onOpenProfile}
        className="flex shrink-0 items-center gap-1 border-l border-slate-100 px-3 text-[10px] font-semibold uppercase tracking-wide text-[#191970] opacity-0 transition hover:bg-[#191970]/5 group-hover:opacity-100 dark:border-slate-800"
        title="Open full profile"
      >
        <ExternalLink className="h-3.5 w-3.5" />
        Profile
      </button>
    </div>
  );
}

function EmployeesEmptyState({
  isFiltered,
  totalCount,
  onClearFilters,
}: {
  isFiltered: boolean;
  totalCount: number;
  onClearFilters?: () => void;
}) {
  if (totalCount === 0 && !isFiltered) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-950/20">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#191970]/10 text-[#191970] dark:bg-indigo-950/40 dark:text-indigo-300">
          <Users className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">No employees yet</h3>
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-slate-500">
          Click <strong className="font-semibold text-slate-700 dark:text-slate-300">Add employee</strong> above to
          create your first record. New hires start in probation until onboarding is complete.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
        <Users className="h-5 w-5 text-slate-400" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-slate-800 dark:text-slate-200">No employees match your filters</h3>
      <p className="mt-1 text-sm text-slate-500">Try a different search term or reset the filters.</p>
      {onClearFilters ? (
        <button type="button" onClick={onClearFilters} className={cn(crm.btnSecondarySm, "mt-4")}>
          Clear filters
        </button>
      ) : null}
    </div>
  );
}

export function EmployeesDirectoryGrid({
  employees,
  allEmployees,
  selectedId,
  onSelect,
  onClearFilters,
  isFiltered = false,
  totalCount = 0,
}: Props) {
  const router = useRouter();

  if (employees.length === 0) {
    return (
      <EmployeesEmptyState
        isFiltered={isFiltered}
        totalCount={totalCount}
        onClearFilters={onClearFilters}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 min-[640px]:grid-cols-2 min-[1024px]:grid-cols-3 min-[1400px]:grid-cols-4">
      {employees.map((employee) => (
        <EmployeeCard
          key={employee.id}
          employee={employee}
          allEmployees={allEmployees}
          selected={selectedId === employee.id}
          onSelect={() => onSelect(employee)}
          onOpenProfile={() => router.push(hrmEmployeeProfilePath(employee.id))}
        />
      ))}
    </div>
  );
}
