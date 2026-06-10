"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Building2, Calendar, GitBranch, Mail, MapPin, Phone, X } from "lucide-react";

import { StatusBadge } from "@/features/workspace/components/enterprise/enterprise-data-table";
import {
  countDirectReports,
  getManagerName,
  HRM_EMPLOYMENT_TYPES,
  type HrmEmployeeRecord,
} from "@/features/workspace/data/hrm-employees-demo";
import { workspacePaths } from "@/lib/workspace/paths";

const STATUS_TONE = {
  active: "emerald",
  probation: "amber",
  on_leave: "blue",
  offboarding: "purple",
  terminated: "rose",
  inactive: "slate",
} as const;

const STATUS_LABEL = {
  active: "Active",
  probation: "Probation",
  on_leave: "On leave",
  offboarding: "Offboarding",
  terminated: "Terminated",
  inactive: "Inactive",
} as const;

type Props = {
  employee: HrmEmployeeRecord | null;
  allEmployees: HrmEmployeeRecord[];
  onClose: () => void;
};

export function EmployeeDetailDrawer({ employee, allEmployees, onClose }: Props) {
  useEffect(() => {
    if (!employee) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [employee, onClose]);

  if (!employee) return null;

  const typeLabel = HRM_EMPLOYMENT_TYPES.find((t) => t.id === employee.employmentType)?.label;
  const managerName = getManagerName(allEmployees, employee.managerId);
  const reports = countDirectReports(allEmployees, employee.id);

  return (
    <div className="fixed inset-0 z-[130] flex justify-end">
      <button type="button" className="absolute inset-0 bg-slate-900/40" aria-label="Close" onClick={onClose} />
      <aside className="relative z-[1] flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{employee.name}</h2>
            <p className="text-sm text-slate-500">{employee.designation}</p>
            <p className="mt-0.5 font-mono text-xs text-slate-400">{employee.employeeCode}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
          <div className="flex flex-wrap gap-2">
            <StatusBadge label={STATUS_LABEL[employee.status]} tone={STATUS_TONE[employee.status]} />
            {typeLabel ? <StatusBadge label={typeLabel} tone="slate" /> : null}
          </div>

          <dl className="space-y-3 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-slate-400" />
              <a href={`mailto:${employee.email}`} className="text-blue-600 hover:underline">{employee.email}</a>
            </div>
            {employee.phone ? (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-400" />
                <span>{employee.phone}</span>
              </div>
            ) : null}
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-slate-400" />
              <span>{employee.department}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-slate-400" />
              <span>{employee.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span>Joined {employee.joinedAt}</span>
            </div>
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-slate-400" />
              <span>Reports to {managerName} · {reports} direct report{reports !== 1 ? "s" : ""}</span>
            </div>
          </dl>

          <Link
            href={workspacePaths.hrmOrgChart}
            className="inline-flex text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
          >
            View in org chart →
          </Link>
        </div>
      </aside>
    </div>
  );
}
