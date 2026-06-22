"use client";

import type { ElementType, ReactNode } from "react";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Cake,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Mail,
  MapPin,
  Save,
  Sparkles,
} from "lucide-react";

import { EmployeeStatusBadge } from "@/features/workspace/components/hrm/employees/employee-status-badge";
import { crm } from "@/features/workspace/components/crm/crm-styles";
import {
  displayFullName,
  EMPLOYEE_PROFILE_SECTIONS,
} from "@/features/workspace/data/hrm-employee-profile-demo";
import {
  getManagerName,
  HRM_EMPLOYMENT_TYPES,
  HRM_WORK_MODES,
} from "@/features/workspace/data/hrm-employees-demo";
import { workspacePaths } from "@/lib/workspace/paths";
import type { HrmEmployeeProfile, HrmEmployeeProfileSectionId, HrmEmployeeRecord } from "@/types/hrm";
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
  profile: HrmEmployeeProfile;
  section: HrmEmployeeProfileSectionId;
  onSectionChange: (section: HrmEmployeeProfileSectionId) => void;
  allEmployees: HrmEmployeeRecord[];
  onSave?: () => void;
  saving?: boolean;
  children: ReactNode;
};

export function EmployeeProfileShell({
  profile,
  section,
  onSectionChange,
  allEmployees,
  onSave,
  saving,
  children,
}: Props) {
  const contentRef = useRef<HTMLDivElement>(null);
  const fullName = displayFullName(profile.basic) || profile.name;
  const manager = getManagerName(allEmployees, profile.managerId);
  const workMode =
    HRM_WORK_MODES.find((m) => m.id === (profile.attendanceLeave.workMode ?? profile.workMode))?.label ?? "—";
  const typeLabel = HRM_EMPLOYMENT_TYPES.find((t) => t.id === profile.employmentType)?.label ?? profile.employmentType;

  const sectionIndex = EMPLOYEE_PROFILE_SECTIONS.findIndex((s) => s.id === section);
  const activeMeta = EMPLOYEE_PROFILE_SECTIONS[sectionIndex];
  const prevSection = sectionIndex > 0 ? EMPLOYEE_PROFILE_SECTIONS[sectionIndex - 1] : null;
  const nextSection =
    sectionIndex >= 0 && sectionIndex < EMPLOYEE_PROFILE_SECTIONS.length - 1
      ? EMPLOYEE_PROFILE_SECTIONS[sectionIndex + 1]
      : null;

  useEffect(() => {
    contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [section]);

  return (
    <div className="pb-10">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href={workspacePaths.hrmEmployees}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/90 bg-white text-slate-600 shadow-sm transition hover:border-[#2277ff]/30 hover:text-[#2277ff] dark:border-slate-700 dark:bg-slate-900"
            aria-label="Back to employees"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <p className={crm.sectionLabel}>People · HRM · Employee profile</p>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">{fullName}</h1>
          </div>
        </div>
        {onSave ? (
          <button
            type="button"
            disabled={saving}
            onClick={onSave}
            className={cn(crm.btnPrimarySm, "shadow-md shadow-[#191970]/15")}
          >
            <Save className="h-3.5 w-3.5" />
            {saving ? "Saving…" : "Save changes"}
          </button>
        ) : null}
      </div>

      <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
        {/* Compact summary — no section nav here */}
        <aside className="xl:sticky xl:top-4 xl:self-start">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="relative px-5 pb-5 pt-5">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-br from-[#191970]/10 via-[#2277ff]/5 to-transparent" />

              <div className="relative flex items-start gap-3">
                <div className="relative shrink-0">
                  <div className="flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-full bg-[#191970] text-xl font-bold text-white ring-4 ring-white dark:ring-slate-900">
                    {profile.basic.profilePictureUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={profile.basic.profilePictureUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      initials(fullName)
                    )}
                  </div>
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="truncate text-base font-bold text-slate-900 dark:text-white">{fullName}</p>
                  <p className="mt-0.5 text-sm font-medium text-[#2277ff]">{profile.designation}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      {profile.employeeCode}
                    </span>
                    <EmployeeStatusBadge status={profile.status} />
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-2 border-t border-slate-100 pt-4 text-sm dark:border-slate-800">
                <QuickRow icon={Building2} label="Department" value={profile.department} />
                <QuickRow icon={Briefcase} label="Type" value={typeLabel} />
                <QuickRow icon={MapPin} label="Location" value={profile.location} />
                <QuickRow icon={Sparkles} label="Work mode" value={workMode} />
                <QuickRow icon={Briefcase} label="Manager" value={manager} />
                <QuickRow icon={Calendar} label="Joined" value={profile.joinedAt} />
                <QuickRow icon={Mail} label="Work email" value={profile.email} />
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-md border border-amber-200/80 bg-amber-50/80 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                  <Cake className="h-3 w-3" />
                  Birthday on
                </span>
                <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200/80 bg-emerald-50/80 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                  <Calendar className="h-3 w-3" />
                  Anniversary
                </span>
              </div>
            </div>
          </motion.div>
        </aside>

        {/* Main editor — tabs on top, form in middle, step nav at bottom */}
        <div
          ref={contentRef}
          className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="sticky top-0 z-20 border-b border-slate-100 bg-white/95 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/95">
            <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Profile sections</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-white">{activeMeta?.label}</p>
              <p className="text-xs text-slate-500">{activeMeta?.description}</p>
            </div>
            <div className="overflow-x-auto">
              <div className="flex min-w-max gap-1 p-2" role="tablist" aria-label="Profile sections">
                {EMPLOYEE_PROFILE_SECTIONS.map((item) => {
                  const active = section === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => onSectionChange(item.id)}
                      className={cn(
                        "shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition",
                        active
                          ? "bg-[#191970] text-white shadow-sm"
                          : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
                      )}
                    >
                      {item.shortLabel ?? item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <motion.div
            key={section}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="min-h-0 flex-1"
          >
            {children}
          </motion.div>

          <div className="sticky bottom-0 z-20 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/95 px-4 py-3 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/90">
            <button
              type="button"
              disabled={!prevSection}
              onClick={() => prevSection && onSectionChange(prevSection.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition",
                prevSection
                  ? "border-slate-200 bg-white text-slate-700 hover:border-[#2277ff]/30 hover:text-[#2277ff] dark:border-slate-700 dark:bg-slate-900"
                  : "cursor-not-allowed border-slate-100 text-slate-300 dark:border-slate-800",
              )}
            >
              <ChevronLeft className="h-4 w-4" />
              {prevSection ? prevSection.shortLabel ?? prevSection.label : "Previous"}
            </button>

            <span className="text-xs font-medium text-slate-500">
              Step {sectionIndex + 1} of {EMPLOYEE_PROFILE_SECTIONS.length}
            </span>

            <button
              type="button"
              disabled={!nextSection}
              onClick={() => nextSection && onSectionChange(nextSection.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition",
                nextSection
                  ? "border-[#191970] bg-[#191970] text-white hover:bg-[#12124a]"
                  : "cursor-not-allowed border-slate-100 text-slate-300 dark:border-slate-800",
              )}
            >
              {nextSection ? nextSection.shortLabel ?? nextSection.label : "Next"}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickRow({
  icon: Icon,
  label,
  value,
}: {
  icon: ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <p className="truncate font-medium text-slate-800 dark:text-slate-200">{value}</p>
      </div>
    </div>
  );
}

export function ProfileSectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="border-b border-slate-100 bg-gradient-to-r from-[#191970]/[0.04] to-transparent px-5 py-4 dark:border-slate-800">
      <h2 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h2>
      <p className="mt-0.5 text-sm text-slate-500">{description}</p>
    </div>
  );
}

export function ProfileDataTable({
  columns,
  rows,
  emptyMessage,
}: {
  columns: string[];
  rows: ReactNode[][];
  emptyMessage?: string;
}) {
  if (rows.length === 0) {
    return (
      <div className="mx-5 mb-5 rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500 dark:border-slate-700">
        {emptyMessage ?? "No records yet."}
      </div>
    );
  }

  return (
    <div className="mx-5 mb-5 overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800">
      <table className="w-full min-w-[520px] text-left text-sm">
        <thead>
          <tr className={crm.tableHead}>
            {columns.map((col) => (
              <th key={col} className="px-4 py-3 font-bold">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {rows.map((cells, idx) => (
            <tr key={idx} className={crm.tableRow}>
              {cells.map((cell, ci) => (
                <td key={ci} className="px-4 py-3 text-slate-700 dark:text-slate-300">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
