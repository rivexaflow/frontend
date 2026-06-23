"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Download, Loader2, Plus, RefreshCw, Search } from "lucide-react";

import { CrmShell } from "@/features/workspace/components/crm/crm-panel";
import { crm } from "@/features/workspace/components/crm/crm-styles";
import { AttendanceEmployeeProfileView } from "@/features/workspace/components/hrm/attendance/attendance-employee-profile-view";
import { AttendanceDirectoryGrid } from "@/features/workspace/components/hrm/attendance/attendance-directory-grid";
import { AttendanceTable } from "@/features/workspace/components/hrm/attendance/attendance-table";
import { HrmCompactBanner, HrmPanelTabs } from "@/features/workspace/components/hrm/hrm-compact-banner";
import type { HrmViewMode } from "@/features/workspace/components/hrm/hrm-directory-view-toggle";
import { HrmDirectoryViewToggle } from "@/features/workspace/components/hrm/hrm-directory-view-toggle";
import {
  ATTENDANCE_STATUSES,
  type AttendanceStatus,
} from "@/features/workspace/data/hrm-attendance-demo";
import {
  ATTENDANCE_TABS,
  type AttendanceTabId,
  parseAttendanceTab,
} from "@/features/workspace/data/attendance-tabs";
import {
  formatDisplayDate,
  getSalaryMonthRange,
  type EmployeeAttendanceProfile,
} from "@/features/workspace/data/hrm-attendance-salary-month";
import { useHrCompanyId } from "@/features/workspace/hooks/use-hr-company-id";
import {
  buildEmployeeAttendanceProfileFromRecords,
  toIsoDateOnly,
} from "@/lib/hrm/build-attendance-profile";
import { fetchHrAttendanceLogs, fetchHrEmployees } from "@/lib/api/hrm";
import { MISSING_COMPANY_CONTEXT_MESSAGE } from "@/lib/workspace/company-context";
import { workspacePaths } from "@/lib/workspace/paths";
import { authStore } from "@/stores/auth.store";
import type { AttendanceRecord, HrmEmployeeRecord } from "@/types/hrm";
import { cn } from "@/lib/utils/cn";

export type AttendanceFilters = {
  query: string;
  department: string;
  status: AttendanceStatus | "";
};

const EMPTY_FILTERS: AttendanceFilters = { query: "", department: "", status: "" };

type Props = {
  initialTab?: AttendanceTabId;
};

export function HrmAttendanceView({ initialTab }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const companyId = useHrCompanyId();
  const currentUserId = authStore((s) => s.user?.id);

  const activeTab = parseAttendanceTab(initialTab ?? searchParams.get("tab"));

  const [employees, setEmployees] = useState<HrmEmployeeRecord[]>([]);
  const [profiles, setProfiles] = useState<EmployeeAttendanceProfile[]>([]);
  const [filters, setFilters] = useState<AttendanceFilters>(EMPTY_FILTERS);
  const [selectedEmployee, setSelectedEmployee] = useState<HrmEmployeeRecord | null>(null);
  const [viewMode, setViewMode] = useState<HrmViewMode>("grid");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const referenceDate = useMemo(() => new Date(), []);
  const todayLabel = formatDisplayDate(referenceDate);
  const salaryMonthRange = useMemo(() => getSalaryMonthRange(referenceDate), [referenceDate]);

  const load = useCallback(async () => {
    if (!companyId) {
      setLoading(false);
      return;
    }
    setError(null);
    try {
      const employeeList = await fetchHrEmployees(companyId, { status: "active" });
      setEmployees(employeeList);

      const todayIso = toIsoDateOnly(referenceDate);
      const profileResults = await Promise.all(
        employeeList.map(async (emp) => {
          const fallback = {
            employeeId: emp.id,
            employeeName: emp.name,
            employeeCode: emp.employeeCode,
            department: emp.department,
            location: emp.location,
          };
          const logs = await fetchHrAttendanceLogs(
            companyId,
            emp.id,
            { from: todayIso, to: todayIso },
            fallback,
          ).catch(() => [] as AttendanceRecord[]);

          return buildEmployeeAttendanceProfileFromRecords(
            {
              id: emp.id,
              name: emp.name,
              employeeCode: emp.employeeCode,
              department: emp.department,
              location: emp.location,
              designation: emp.designation,
              joinedAt: emp.joinedAt,
            },
            logs,
            referenceDate,
          );
        }),
      );

      setProfiles(profileResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load attendance.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [companyId, referenceDate]);

  useEffect(() => {
    setLoading(true);
    void load();
  }, [load]);

  const setTab = (tab: AttendanceTabId) => {
    setSelectedEmployee(null);
    setFilters(EMPTY_FILTERS);
    const url = tab === "all" ? workspacePaths.hrmAttendance : `${workspacePaths.hrmAttendance}?tab=${tab}`;
    router.replace(url, { scroll: false });
  };

  const departments = useMemo(
    () => [...new Set(profiles.map((p) => p.department))].sort(),
    [profiles],
  );

  const tabFiltered = useMemo(() => {
    switch (activeTab) {
      case "not-clocked-in":
        return profiles.filter((p) => !p.today.checkIn && p.today.status !== "on_leave");
      case "on-break":
        return profiles.filter((p) => p.today.status === "half_day");
      case "me":
        return currentUserId ? profiles.filter((p) => p.id === currentUserId) : [];
      default:
        return profiles;
    }
  }, [profiles, activeTab, currentUserId]);

  const filtered = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    return tabFiltered.filter((p) => {
      if (filters.department && p.department !== filters.department) return false;
      if (filters.status && p.today.status !== filters.status) return false;
      if (q) {
        const hay = `${p.employeeName} ${p.employeeCode} ${p.department}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [tabFiltered, filters]);

  const presentCount = profiles.filter(
    (p) => p.today.status === "present" || p.today.status === "remote",
  ).length;
  const lateCount = profiles.filter((p) => p.today.status === "late").length;
  const absentCount = profiles.filter((p) => p.today.status === "absent").length;
  const notClockedCount = profiles.filter((p) => !p.today.checkIn && p.today.status !== "on_leave").length;

  const tabCounts: Partial<Record<AttendanceTabId, number>> = {
    all: profiles.length,
    "on-break": profiles.filter((p) => p.today.status === "half_day").length,
    "not-clocked-in": notClockedCount,
  };

  const handleRefresh = () => {
    setRefreshing(true);
    void load();
  };

  const showProfile = selectedEmployee && companyId;
  const showDirectory = activeTab === "all" || activeTab === "not-clocked-in" || activeTab === "on-break" || activeTab === "me";

  const setFilter = <K extends keyof AttendanceFilters>(key: K, value: AttendanceFilters[K]) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="pb-8">
      {!showProfile ? (
        <CrmShell>
          <HrmCompactBanner
            title="Attendance"
            subtitle={`${todayLabel} · Salary month ${salaryMonthRange.label}`}
            stats={[
              { label: "Present", value: presentCount, tone: "success" },
              { label: "Late", value: lateCount, tone: "warning" },
              { label: "Absent", value: absentCount, tone: "danger" },
              { label: "Not in", value: notClockedCount },
            ]}
            actions={
              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing || !companyId}
                className={cn(
                  crm.btnSecondarySm,
                  "border-white/20 bg-white/10 text-white hover:bg-white/20 disabled:opacity-50",
                )}
              >
                <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
                Refresh
              </button>
            }
          />

          <HrmPanelTabs
            tabs={ATTENDANCE_TABS.map((t) => ({
              id: t.id,
              label: t.label,
              count: tabCounts[t.id],
            }))}
            active={activeTab}
            onChange={setTab}
          />

          {!companyId ? (
            <div className="mx-4 mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{MISSING_COMPANY_CONTEXT_MESSAGE}</p>
            </div>
          ) : null}

          {error ? (
            <div className="mx-4 mt-4 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          ) : null}

          {showDirectory ? (
            <>
              <div className="flex flex-col gap-2 border-b border-slate-100 bg-slate-50/40 px-4 py-2.5 sm:flex-row sm:items-center dark:border-slate-800 dark:bg-slate-950/20">
                <div className="relative min-w-0 flex-1 sm:max-w-xs">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    value={filters.query}
                    onChange={(e) => setFilter("query", e.target.value)}
                    placeholder="Search employee…"
                    className={cn(crm.inputSm, "w-full pl-8")}
                  />
                </div>
                <select
                  value={filters.department}
                  onChange={(e) => setFilter("department", e.target.value)}
                  className={crm.select}
                  aria-label="Department"
                >
                  <option value="">All departments</option>
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <select
                  value={filters.status}
                  onChange={(e) => setFilter("status", e.target.value as AttendanceFilters["status"])}
                  className={crm.select}
                  aria-label="Status"
                >
                  <option value="">All statuses</option>
                  {ATTENDANCE_STATUSES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-2 sm:ml-auto">
                  <HrmDirectoryViewToggle viewMode={viewMode} onChange={setViewMode} />
                  <span className="text-xs text-slate-500">
                    <span className="font-semibold tabular-nums text-slate-800">{filtered.length}</span> records
                  </span>
                  <button type="button" className={crm.btnSecondarySm}>
                    <Download className="h-3.5 w-3.5" />
                    Export
                  </button>
                  <button type="button" className={crm.btnPrimarySm}>
                    <Plus className="h-3.5 w-3.5" />
                    Mark attendance
                  </button>
                </div>
              </div>

              <div className="p-3 md:p-4">
                {loading ? (
                  <div className="flex items-center justify-center gap-2 py-20 text-sm text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading attendance…
                  </div>
                ) : viewMode === "grid" ? (
                  <AttendanceDirectoryGrid
                    profiles={filtered}
                    selectedId={null}
                    onSelect={(p) => {
                      const emp = employees.find((e) => e.id === p.id);
                      if (emp) setSelectedEmployee(emp);
                    }}
                  />
                ) : (
                  <AttendanceTable
                    profiles={filtered}
                    selectedId={null}
                    onSelect={(p) => {
                      const emp = employees.find((e) => e.id === p.id);
                      if (emp) setSelectedEmployee(emp);
                    }}
                  />
                )}
              </div>
            </>
          ) : (
            <AttendancePlaceholderPanel tab={activeTab} />
          )}
        </CrmShell>
      ) : (
        <AttendanceEmployeeProfileView
          companyId={companyId}
          employee={selectedEmployee}
          onBack={() => setSelectedEmployee(null)}
          onRecordsChange={load}
        />
      )}
    </div>
  );
}

function AttendancePlaceholderPanel({ tab }: { tab: AttendanceTabId }) {
  const copy: Record<string, { title: string; body: string }> = {
    regularization: {
      title: "Regularization requests",
      body: "Pending clock corrections and manager approvals will appear here when the regularization API is connected.",
    },
    roster: {
      title: "Shift roster",
      body: "Weekly shift grid and team assignments will load from roster endpoints — same panel, no extra navigation.",
    },
  };

  const info = copy[tab] ?? { title: "Coming online", body: "This view connects to live clock events when endpoints ship." };

  return (
    <div className="px-5 py-16 text-center">
      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{info.title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{info.body}</p>
    </div>
  );
}
