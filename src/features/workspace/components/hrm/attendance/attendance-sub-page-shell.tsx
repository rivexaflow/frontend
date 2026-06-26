"use client";

import type { ReactNode } from "react";
import { AlertCircle, Loader2 } from "lucide-react";

import { CrmShell } from "@/features/workspace/components/crm/crm-panel";
import { AttendanceEmployeeProfileView } from "@/features/workspace/components/hrm/attendance/attendance-employee-profile-view";
import type { EmployeeAttendanceProfile } from "@/features/workspace/data/hrm-attendance-salary-month";
import { MISSING_COMPANY_CONTEXT_MESSAGE } from "@/lib/workspace/company-context";
import type { HrmEmployeeRecord } from "@/types/hrm";

type Props = {
  companyId: string | null;
  error: string | null;
  loading: boolean;
  employees: HrmEmployeeRecord[];
  selectedEmployee: HrmEmployeeRecord | null;
  onSelectProfile: (profile: EmployeeAttendanceProfile) => void;
  onClearProfile: () => void;
  onRecordsChange: () => void;
  children: ReactNode;
};

export function AttendanceSubPageShell({
  companyId,
  error,
  loading,
  employees,
  selectedEmployee,
  onSelectProfile,
  onClearProfile,
  onRecordsChange,
  children,
}: Props) {
  if (selectedEmployee && companyId) {
    return (
      <AttendanceEmployeeProfileView
        companyId={companyId}
        employee={selectedEmployee}
        onBack={onClearProfile}
        onRecordsChange={onRecordsChange}
      />
    );
  }

  return (
    <div className="pb-8">
      <CrmShell>
        {!companyId ? (
          <div className="mx-4 mt-4 flex items-start gap-3 rounded-xl border border-[#2277FF]/20 bg-[#2277FF]/5 px-4 py-3 text-sm text-[#191970] dark:text-[#2277FF]">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{MISSING_COMPANY_CONTEXT_MESSAGE}</p>
          </div>
        ) : null}
        {error ? (
          <div className="mx-4 mt-4 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        ) : null}
        {loading && !employees.length ? (
          <div className="flex items-center justify-center gap-2 py-24 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading attendance…
          </div>
        ) : (
          children
        )}
      </CrmShell>
    </div>
  );
}