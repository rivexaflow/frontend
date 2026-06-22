"use client";

import { useRouter } from "next/navigation";
import { ExternalLink, Pencil, Users } from "lucide-react";

import { crm } from "@/features/workspace/components/crm/crm-styles";
import { EmployeeStatusBadge } from "@/features/workspace/components/hrm/employees/employee-status-badge";
import {
  getManagerName,
  HRM_WORK_MODES,
  type HrmEmployeeRecord,
} from "@/features/workspace/data/hrm-employees-demo";
import { hrmEmployeeProfilePath } from "@/lib/workspace/hrm-paths";
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
  onClearFilters?: () => void;
  isFiltered?: boolean;
  totalCount?: number;
};

export function EmployeesDirectoryTable({
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
    if (totalCount === 0 && !isFiltered) {
      return (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-950/20">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#191970]/10 text-[#191970]">
            <Users className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">No employees yet</h3>
          <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-slate-500">
            Click <strong className="font-semibold text-slate-700 dark:text-slate-300">Add employee</strong> in the
            toolbar to create your first record.
          </p>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center px-6 py-16 text-center">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No employees match your filters</p>
        <p className="mt-1 text-sm text-slate-500">Try a different search term or reset the filters.</p>
        {onClearFilters ? (
          <button type="button" onClick={onClearFilters} className={cn(crm.btnSecondarySm, "mt-4")}>
            Clear filters
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/80 shadow-sm dark:border-slate-800">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] text-left text-sm">
          <thead className="sticky top-0 z-10">
            <tr className={cn(crm.tableHead, "bg-slate-50/95 backdrop-blur-sm dark:bg-slate-900/95")}>
              <th className="px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider">Profile</th>
              <th className="px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider">Employee ID</th>
              <th className="px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider">Name</th>
              <th className="hidden px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider lg:table-cell">Designation</th>
              <th className="px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider">Department</th>
              <th className="hidden px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider xl:table-cell">Manager</th>
              <th className="hidden px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider md:table-cell">Location</th>
              <th className="hidden px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider sm:table-cell">Work mode</th>
              <th className="px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider">Status</th>
              <th className="hidden px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider md:table-cell">Joining date</th>
              <th className="px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {employees.map((employee, index) => {
              const selected = selectedId === employee.id;
              const workMode = HRM_WORK_MODES.find((m) => m.id === employee.workMode)?.label ?? "—";
              return (
                <tr
                  key={employee.id}
                  onClick={() => onSelect(employee)}
                  className={cn(
                    "cursor-pointer transition-colors",
                    crm.tableRow,
                    index % 2 === 1 && !selected && "bg-slate-50/40 dark:bg-slate-900/30",
                    selected && "bg-[#191970]/[0.06] dark:bg-blue-950/25",
                    "hover:bg-[#2277ff]/[0.04] dark:hover:bg-blue-950/20",
                  )}
                >
                  <td className="px-4 py-3.5">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold text-white shadow-sm ring-2 ring-white dark:ring-slate-900"
                      style={{ backgroundColor: BRAND }}
                    >
                      {initials(employee.name)}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      {employee.employeeCode}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="font-semibold text-slate-900 dark:text-white">{employee.name}</p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">{employee.email}</p>
                  </td>
                  <td className="hidden px-4 py-3.5 capitalize text-slate-700 dark:text-slate-300 lg:table-cell">
                    {employee.designation}
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400">{employee.department}</td>
                  <td className="hidden px-4 py-3.5 text-slate-600 xl:table-cell">
                    {getManagerName(allEmployees, employee.managerId)}
                  </td>
                  <td className="hidden px-4 py-3.5 text-slate-600 md:table-cell">{employee.location || "—"}</td>
                  <td className="hidden px-4 py-3.5 sm:table-cell">
                    <span className="rounded-md border border-slate-200/80 bg-white px-2 py-0.5 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {workMode}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <EmployeeStatusBadge status={employee.status} />
                  </td>
                  <td className="hidden px-4 py-3.5 text-slate-500 md:table-cell">{employee.joinedAt}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(hrmEmployeeProfilePath(employee.id));
                        }}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-[#191970] transition hover:bg-[#191970]/10"
                        title="View profile"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        View
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`${hrmEmployeeProfilePath(employee.id)}?section=employment`);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                        title="Edit employee"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
