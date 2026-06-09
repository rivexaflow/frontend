"use client";

import { motion } from "framer-motion";
import { Building2, Calendar, Clock, MapPin, X } from "lucide-react";

import { AttendanceMonthDayList } from "@/features/workspace/components/hrm/attendance/attendance-month-day-list";
import { AttendanceSalaryMonthStrip } from "@/features/workspace/components/hrm/attendance/attendance-salary-month-strip";
import { AttendanceStatusBadge } from "@/features/workspace/components/hrm/attendance/attendance-status-badge";
import type { EmployeeAttendanceProfile } from "@/features/workspace/data/hrm-attendance-salary-month";
import { getSalaryMonthRange } from "@/features/workspace/data/hrm-attendance-salary-month";

type Props = {
  profile: EmployeeAttendanceProfile;
  onClose: () => void;
};

function Info({ icon: Icon, label, value }: { icon: typeof Calendar; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-2.5 text-sm">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
      <div>
        <p className="text-[10px] font-semibold uppercase text-slate-400">{label}</p>
        <p className="font-medium text-slate-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}

export function AttendanceDetailPanel({ profile, onClose }: Props) {
  const { today, salaryMonth, monthDays } = profile;
  const range = getSalaryMonthRange(new Date(today.date));

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
        className="fixed inset-y-0 right-0 z-[110] flex w-full max-w-[520px] flex-col border-l border-slate-200/90 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950"
        role="dialog"
        aria-labelledby="attendance-detail-title"
      >
        <div className="shrink-0 border-b border-slate-200/90 px-5 py-4 dark:border-slate-800">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Attendance record</p>
              <h2 id="attendance-detail-title" className="mt-1 truncate text-base font-semibold text-slate-900 dark:text-white">
                {profile.employeeName}
              </h2>
              <p className="font-mono text-xs text-slate-500">{profile.employeeCode}</p>
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
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <AttendanceStatusBadge status={today.status} />
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              {today.date}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <section>
            <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Today</h3>
            <div className="rounded-lg border border-slate-200/90 px-4 dark:border-slate-800">
              <Info icon={Clock} label="Check in" value={today.checkIn ?? "Not recorded"} />
              <div className="border-t border-slate-100 dark:border-slate-800">
                <Info icon={Clock} label="Check out" value={today.checkOut ?? "Not recorded"} />
              </div>
              <div className="border-t border-slate-100 dark:border-slate-800">
                <Info
                  icon={Clock}
                  label="Hours worked"
                  value={today.hoursWorked != null ? `${today.hoursWorked} hours` : "—"}
                />
              </div>
              <div className="border-t border-slate-100 dark:border-slate-800">
                <Info icon={Building2} label="Department" value={profile.department} />
              </div>
              <div className="border-t border-slate-100 dark:border-slate-800">
                <Info icon={MapPin} label="Work location" value={profile.location} />
              </div>
            </div>
          </section>

          <section className="mt-6">
            <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Salary month summary</h3>
            <AttendanceSalaryMonthStrip summary={salaryMonth} />
          </section>

          <section className="mt-6">
            <div className="mb-3 flex items-end justify-between gap-2">
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Full month ledger</h3>
                <p className="mt-1 text-xs text-slate-500">
                  {salaryMonth.periodLabel} · Day {salaryMonth.cutoffDay} to day {salaryMonth.cutoffDay - 1}
                </p>
              </div>
              <span className="shrink-0 text-xs font-semibold tabular-nums text-slate-600">
                {salaryMonth.daysElapsed}/{salaryMonth.totalCalendarDays} days
              </span>
            </div>
            <AttendanceMonthDayList monthDays={monthDays} range={range} reference={new Date(today.date)} />
          </section>
        </div>
      </motion.aside>
    </>
  );
}
