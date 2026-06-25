"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";

import { CrmShell } from "@/features/workspace/components/crm/crm-panel";
import { AttendanceDashboardPanel } from "@/features/workspace/components/hrm/attendance/attendance-dashboard-panel";
import { AttendanceEmployeeProfileView } from "@/features/workspace/components/hrm/attendance/attendance-employee-profile-view";
import type { AttendanceStatus } from "@/features/workspace/data/hrm-attendance-demo";
import { useAttendanceProfiles } from "@/features/workspace/hooks/use-attendance-profiles";
import { MISSING_COMPANY_CONTEXT_MESSAGE } from "@/lib/workspace/company-context";
import type { HrmEmployeeRecord } from "@/types/hrm";

export function HrmAttendanceView() {
  const data = useAttendanceProfiles();
  const [selectedEmployee, setSelectedEmployee] = useState<HrmEmployeeRecord | null>(null);
  const [dashboardStatusFilter, setDashboardStatusFilter] = useState<AttendanceStatus | "">("");

  if (selectedEmployee && data.companyId) {
    return (
      <AttendanceEmployeeProfileView
        companyId={data.companyId}
        employee={selectedEmployee}
        onBack={() => setSelectedEmployee(null)}
        onRecordsChange={data.reload}
      />
    );
  }

  return (
    <div className="pb-8">
      <CrmShell>
        {!data.companyId ? (
          <div className="mx-4 mt-4 flex items-start gap-3 rounded-xl border border-[#2277FF]/20 bg-[#2277FF]/5 px-4 py-3 text-sm text-[#191970] dark:text-[#2277FF]">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{MISSING_COMPANY_CONTEXT_MESSAGE}</p>
          </div>
        ) : null}
        {data.error ? (
          <div className="mx-4 mt-4 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{data.error}</p>
          </div>
        ) : null}
        <AttendanceDashboardPanel
          profiles={data.profiles}
          loading={data.loading}
          refreshing={data.refreshing}
          referenceDate={data.referenceDate}
          statusFilter={dashboardStatusFilter}
          onStatusFilterChange={setDashboardStatusFilter}
          onRefresh={data.refresh}
          onSelect={(p) => {
            const emp = data.employees.find((e) => e.id === p.id);
            if (emp) setSelectedEmployee(emp);
          }}
        />
      </CrmShell>
    </div>
  );
}
