"use client";

import { useState } from "react";

import { AttendanceRosterMonthGrid } from "@/features/workspace/components/hrm/attendance/attendance-roster-month-grid";
import type { EmployeeAttendanceProfile } from "@/features/workspace/data/hrm-attendance-salary-month";

type Props = {
  profiles: EmployeeAttendanceProfile[];
};

export function AttendanceRosterPanel({ profiles }: Props) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  return (
    <AttendanceRosterMonthGrid
      profiles={profiles}
      year={year}
      month={month}
      onMonthChange={(y, m) => {
        setYear(y);
        setMonth(m);
      }}
    />
  );
}
