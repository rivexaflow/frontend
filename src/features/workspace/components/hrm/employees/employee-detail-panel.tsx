"use client";

import type { ElementType, ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Briefcase,
  Building2,
  Calendar,
  GitBranch,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Trash2,
  User,
  X,
} from "lucide-react";

import { EmployeeStatusBadge } from "@/features/workspace/components/hrm/employees/employee-status-badge";
import {
  countDirectReports,
  getManagerName,
  HRM_EMPLOYMENT_STATUSES,
  HRM_EMPLOYMENT_TYPES,
  type HrmEmployeeRecord,
  type HrmEmploymentType,
} from "@/features/workspace/data/hrm-employees-demo";
import type { HrmRole } from "@/types/hrm";
import { workspacePaths } from "@/lib/workspace/paths";
import { cn } from "@/lib/utils/cn";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

type Props = {
  employee: HrmEmployeeRecord;
  allEmployees: HrmEmployeeRecord[];
  roles?: HrmRole[];
  onClose: () => void;
  onUpdate: (patch: Partial<HrmEmployeeRecord>) => Promise<void>;
  onDelete: () => Promise<void>;
};

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{children}</h3>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-slate-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}

const WORK_MODE_LABELS = {
  onsite: "On-site",
  hybrid: "Hybrid",
  remote: "Remote",
} as const;

export function EmployeeDetailPanel({
  employee,
  allEmployees,
  roles = [],
  onClose,
  onUpdate,
  onDelete,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const managerName = getManagerName(allEmployees, employee.managerId);
  const directReports = countDirectReports(allEmployees, employee.id);
  const typeLabel = HRM_EMPLOYMENT_TYPES.find((t) => t.id === employee.employmentType)?.label ?? "—";
  const roleName =
    employee.hrRoleName ?? roles.find((r) => r.id === employee.hrRoleId)?.name ?? "—";

  const runUpdate = async (patch: Partial<HrmEmployeeRecord>) => {
    setBusy(true);
    setError(null);
    try {
      await onUpdate(patch);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setBusy(false);
    }
  };

  const runDelete = async () => {
    if (!window.confirm(`Remove ${employee.name} from the employee directory?`)) return;
    setBusy(true);
    setError(null);
    try {
      await onDelete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
      setBusy(false);
    }
  };

  return (
    <>
      <motion.button
        type="button"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        aria-label="Close"
        className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <motion.aside
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 420, damping: 38 }}
        className="fixed inset-y-0 right-0 z-[110] flex w-full max-w-[400px] flex-col border-l border-slate-200/90 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950"
        role="dialog"
        aria-labelledby="employee-detail-title"
      >
        <div className="shrink-0 border-b border-slate-200/90 px-5 py-4 dark:border-slate-800">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#191970] text-sm font-bold text-white">
                {initials(employee.name)}
              </span>
              <div className="min-w-0">
                <h2 id="employee-detail-title" className="truncate text-base font-semibold text-slate-900 dark:text-white">
                  {employee.name}
                </h2>
                <p className="truncate text-sm text-slate-500">{employee.designation}</p>
                <p className="mt-1 font-mono text-[11px] text-slate-400">{employee.employeeCode}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              aria-label="Close panel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <EmployeeStatusBadge status={employee.status} />
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              {typeLabel}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {error ? (
            <p className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
          ) : null}

          <section>
            <SectionTitle>Employment</SectionTitle>
            <div className="divide-y divide-slate-100 rounded-lg border border-slate-200/90 px-4 dark:divide-slate-800 dark:border-slate-800">
              <InfoRow icon={Building2} label="Department" value={employee.department} />
              <InfoRow icon={MapPin} label="Location" value={employee.location} />
              <InfoRow icon={Calendar} label="Joined" value={employee.joinedAt} />
              {employee.leavingDate && employee.leavingDate !== "—" ? (
                <InfoRow icon={Calendar} label="Leaving" value={employee.leavingDate} />
              ) : null}
              {employee.workMode ? (
                <InfoRow icon={Briefcase} label="Work mode" value={WORK_MODE_LABELS[employee.workMode]} />
              ) : null}
              <InfoRow icon={Briefcase} label="HR role" value={roleName} />
            </div>
          </section>

          <section className="mt-6">
            <SectionTitle>Reporting</SectionTitle>
            <div className="divide-y divide-slate-100 rounded-lg border border-slate-200/90 px-4 dark:divide-slate-800 dark:border-slate-800">
              <InfoRow icon={User} label="Reports to" value={managerName} />
              <InfoRow
                icon={GitBranch}
                label="Direct reports"
                value={directReports === 0 ? "None" : String(directReports)}
              />
            </div>
            <Link
              href={workspacePaths.hrmOrgChart}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#191970] transition hover:underline dark:text-blue-300"
            >
              <GitBranch className="h-3.5 w-3.5" />
              View in org chart
            </Link>
          </section>

          <section className="mt-6">
            <SectionTitle>Contact</SectionTitle>
            <div className="divide-y divide-slate-100 rounded-lg border border-slate-200/90 px-4 dark:divide-slate-800 dark:border-slate-800">
              <InfoRow icon={Mail} label="Email" value={employee.email} />
              {employee.phone ? <InfoRow icon={Phone} label="Phone" value={employee.phone} /> : null}
            </div>
          </section>

          <section className="mt-6">
            <SectionTitle>Update status</SectionTitle>
            <div className="flex flex-wrap gap-1.5">
              {HRM_EMPLOYMENT_STATUSES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  disabled={busy}
                  onClick={() => void runUpdate({ status: s.id })}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-xs font-medium transition disabled:opacity-50",
                    employee.status === s.id
                      ? "bg-[#191970] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700",
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-slate-400">
              Termination or inactive status automatically sets leaving date on the server.
            </p>
          </section>

          <section className="mt-6">
            <SectionTitle>Employment type</SectionTitle>
            <select
              value={employee.employmentType}
              disabled={busy}
              onChange={(e) => void runUpdate({ employmentType: e.target.value as HrmEmploymentType })}
              className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#191970] disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900"
            >
              {HRM_EMPLOYMENT_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </section>

          {roles.length > 0 ? (
            <section className="mt-6">
              <SectionTitle>HR role</SectionTitle>
              <select
                value={employee.hrRoleId ?? ""}
                disabled={busy}
                onChange={(e) =>
                  void runUpdate({ hrRoleId: e.target.value || null, hrRoleName: undefined })
                }
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#191970] disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900"
              >
                <option value="">No custom role</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </section>
          ) : null}
        </div>

        <div className="shrink-0 border-t border-slate-200/90 px-5 py-4 dark:border-slate-800">
          <button
            type="button"
            disabled={busy}
            onClick={() => void runDelete()}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-rose-200 bg-rose-50 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Remove employee
          </button>
        </div>
      </motion.aside>
    </>
  );
}
