"use client";

import { ChevronRight } from "lucide-react";

import { EmployeeStatusBadge } from "@/features/workspace/components/hrm/employees/employee-status-badge";
import {
  getManagerName,
  HRM_EMPLOYMENT_TYPES,
  type HrmEmployeeRecord,
} from "@/features/workspace/data/hrm-employees-demo";
import { cn } from "@/lib/utils/cn";

const BRAND = "#191970";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

type Props = {
  employees: HrmEmployeeRecord[];
  allEmployees: HrmEmployeeRecord[];
  selectedId: string | null;
  onSelect: (employee: HrmEmployeeRecord) => void;
};

export function EmployeesDirectoryTable({ employees, allEmployees, selectedId, onSelect }: Props) {
  if (employees.length === 0) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No employees match your filters</p>
        <p className="mt-1 text-sm text-slate-500">Adjust search or filters, or add a new employee.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-xs font-medium text-slate-500 dark:border-slate-800 dark:bg-slate-950/50">
            <th className="px-4 py-3 font-medium">Employee</th>
            <th className="px-4 py-3 font-medium">ID</th>
            <th className="hidden px-4 py-3 font-medium lg:table-cell">Designation</th>
            <th className="px-4 py-3 font-medium">Department</th>
            <th className="hidden px-4 py-3 font-medium md:table-cell">Location</th>
            <th className="hidden px-4 py-3 font-medium xl:table-cell">Manager</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="hidden px-4 py-3 font-medium sm:table-cell">Joined</th>
            <th className="w-10 px-2 py-3" aria-hidden />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {employees.map((employee) => {
            const selected = selectedId === employee.id;
            const typeLabel = HRM_EMPLOYMENT_TYPES.find((t) => t.id === employee.employmentType)?.label;
            return (
              <tr
                key={employee.id}
                onClick={() => onSelect(employee)}
                className={cn(
                  "cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50",
                  selected && "bg-[#191970]/[0.04] dark:bg-blue-950/20",
                )}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-semibold text-white"
                      style={{ backgroundColor: BRAND }}
                    >
                      {initials(employee.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 dark:text-white">{employee.name}</p>
                      <p className="truncate text-xs text-slate-500">{employee.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">
                  {employee.employeeCode}
                </td>
                <td className="hidden px-4 py-3 text-slate-700 dark:text-slate-300 lg:table-cell">
                  <span>{employee.designation}</span>
                  {typeLabel ? (
                    <span className="mt-0.5 block text-xs text-slate-400">{typeLabel}</span>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{employee.department}</td>
                <td className="hidden px-4 py-3 text-slate-600 md:table-cell">{employee.location}</td>
                <td className="hidden px-4 py-3 text-slate-600 xl:table-cell">
                  {getManagerName(allEmployees, employee.managerId)}
                </td>
                <td className="px-4 py-3">
                  <EmployeeStatusBadge status={employee.status} />
                </td>
                <td className="hidden px-4 py-3 text-slate-500 sm:table-cell">{employee.joinedAt}</td>
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
