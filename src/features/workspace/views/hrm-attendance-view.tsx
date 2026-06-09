"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, AlertTriangle, CalendarRange, ClipboardList, Clock, Loader2, RefreshCw, UserCheck } from "lucide-react";

import { AttendanceEmployeeProfileView } from "@/features/workspace/components/hrm/attendance/attendance-employee-profile-view";
import { AttendanceDirectoryGrid } from "@/features/workspace/components/hrm/attendance/attendance-directory-grid";
import type { HrmViewMode } from "@/features/workspace/components/hrm/hrm-directory-view-toggle";
import {
  AttendanceDirectoryToolbar,
  type AttendanceFilters,
} from "@/features/workspace/components/hrm/attendance/attendance-directory-toolbar";
import { AttendanceTable } from "@/features/workspace/components/hrm/attendance/attendance-table";
import { useHrCompanyId } from "@/features/workspace/hooks/use-hr-company-id";
import { MISSING_COMPANY_CONTEXT_MESSAGE } from "@/lib/workspace/company-context";
import {
  formatDisplayDate,
  getSalaryMonthRange,
  type EmployeeAttendanceProfile,
} from "@/features/workspace/data/hrm-attendance-salary-month";
import {
  buildEmployeeAttendanceProfileFromRecords,
  toIsoDateOnly,
} from "@/lib/hrm/build-attendance-profile";
import { fetchHrAttendanceLogs, fetchHrEmployees } from "@/lib/api/hrm";
import type { AttendanceRecord, HrmEmployeeRecord } from "@/types/hrm";

const EMPTY_FILTERS: AttendanceFilters = { query: "", department: "", status: "" };

export function HrmAttendanceView() {
  const companyId = useHrCompanyId();
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

  const departments = useMemo(
    () => [...new Set(profiles.map((p) => p.department))].sort(),
    [profiles],
  );

  const filtered = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    return profiles.filter((p) => {
      if (filters.department && p.department !== filters.department) return false;
      if (filters.status && p.today.status !== filters.status) return false;
      if (q) {
        const hay = `${p.employeeName} ${p.employeeCode} ${p.department}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [profiles, filters]);

  const presentCount = profiles.filter(
    (p) => p.today.status === "present" || p.today.status === "remote",
  ).length;
  const lateCount = profiles.filter((p) => p.today.status === "late").length;
  const absentCount = profiles.filter((p) => p.today.status === "absent").length;
  const avgMonthRate =
    profiles.length === 0
      ? 0
      : Math.round(profiles.reduce((s, p) => s + p.salaryMonth.attendanceRate, 0) / profiles.length);

  const handleRefresh = () => {
    setRefreshing(true);
    void load();
  };

  if (selectedEmployee && companyId) {
    return (
      <AttendanceEmployeeProfileView
        companyId={companyId}
        employee={selectedEmployee}
        onBack={() => setSelectedEmployee(null)}
        onRecordsChange={load}
      />
    );
  }

  return (
    <div className="pb-10">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">People · HRM</p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Attendance</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Daily clock-in for {todayLabel}. Click an employee for full calendar history from their join date.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { label: "Today", value: profiles.length, icon: ClipboardList },
              { label: "Present", value: presentCount, icon: UserCheck },
              { label: "Late", value: lateCount, icon: Clock },
              { label: "Month avg", value: `${avgMonthRate}%`, icon: CalendarRange },
              { label: "Absent", value: absentCount, icon: AlertTriangle },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <stat.icon className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-xs text-slate-500">{stat.label}</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{stat.value}</span>
              </div>
            ))}
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing || !companyId}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      {!companyId ? (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{MISSING_COMPANY_CONTEXT_MESSAGE}</p>
        </div>
      ) : null}

      {error ? (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <AttendanceDirectoryToolbar
          filters={filters}
          onChange={setFilters}
          departments={departments}
          resultCount={filtered.length}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          salaryMonthLabel={salaryMonthRange.label}
          todayLabel={todayLabel}
        />
        {loading ? (
          <div className="flex items-center justify-center gap-2 px-4 py-20 text-sm text-slate-500">
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
    </div>
  );
}
