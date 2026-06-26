"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

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
import type { AttendanceRecord, HrmEmployeeRecord } from "@/types/hrm";

export function useAttendanceProfiles() {
  const companyId = useHrCompanyId();
  const referenceDate = useMemo(() => new Date(), []);

  const [employees, setEmployees] = useState<HrmEmployeeRecord[]>([]);
  const [profiles, setProfiles] = useState<EmployeeAttendanceProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const refresh = () => {
    setRefreshing(true);
    void load();
  };

  return {
    companyId,
    employees,
    profiles,
    loading,
    refreshing,
    error,
    referenceDate,
    todayLabel,
    salaryMonthRange,
    refresh,
    reload: load,
  };
}
