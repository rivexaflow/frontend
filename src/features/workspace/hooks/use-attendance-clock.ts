"use client";

import { useCallback, useEffect, useState } from "react";

import { apiClient } from "@/lib/api/client";
import { useHrCompanyId } from "@/features/workspace/hooks/use-hr-company-id";

export type AttendanceClockStatus = {
  isClockedIn: boolean;
  isClockedOut: boolean;
  checkIn: string | null;
  checkOut: string | null;
  hoursWorked?: number | null;
};

export function useAttendanceClock() {
  const companyId = useHrCompanyId();
  const [clockStatus, setClockStatus] = useState<AttendanceClockStatus | null>(null);
  const [loadingClock, setLoadingClock] = useState(false);

  const refreshStatus = useCallback(async () => {
    if (!companyId) {
      setClockStatus(null);
      return;
    }
    try {
      const res = await apiClient.get(`/hr/${companyId}/attendance/today-status`);
      if (res.data?.success) {
        setClockStatus(res.data.data);
      }
    } catch {
      setClockStatus(null);
    }
  }, [companyId]);

  useEffect(() => {
    void refreshStatus();
  }, [refreshStatus]);

  const getLiveHoursWorked = useCallback(() => {
    if (!clockStatus) return null;
    if (clockStatus.isClockedIn && !clockStatus.isClockedOut && clockStatus.checkIn) {
      const checkInTime = new Date(clockStatus.checkIn).getTime();
      const now = Date.now();
      return Math.max(0, now - checkInTime) / (1000 * 60 * 60);
    }
    return clockStatus.hoursWorked ?? null;
  }, [clockStatus]);

  const handleClockAction = useCallback(async () => {
    if (!companyId || !clockStatus || loadingClock) return;
    setLoadingClock(true);
    try {
      const action = clockStatus.isClockedIn ? "clock-out" : "clock-in";
      const res = await apiClient.post(`/hr/${companyId}/attendance/${action}`, {});
      if (res.data?.success) {
        await refreshStatus();
      }
    } finally {
      setLoadingClock(false);
    }
  }, [companyId, clockStatus, loadingClock, refreshStatus]);

  return {
    companyId,
    clockStatus,
    loadingClock,
    refreshStatus,
    getLiveHoursWorked,
    handleClockAction,
  };
}
