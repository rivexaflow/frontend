"use client";

import { useEffect } from "react";
import { Building2, Calendar, Clock, MapPin, X } from "lucide-react";

import { StatusBadge } from "@/features/workspace/components/enterprise/enterprise-data-table";
import type { AttendanceRecord } from "@/features/workspace/data/hrm-attendance-demo";

const STATUS_TONE = {
  present: "emerald",
  remote: "blue",
  late: "amber",
  half_day: "purple",
  on_leave: "blue",
  absent: "rose",
} as const;

const STATUS_LABEL = {
  present: "Present",
  remote: "Remote",
  late: "Late",
  half_day: "Half day",
  on_leave: "On leave",
  absent: "Absent",
} as const;

type Props = {
  record: AttendanceRecord | null;
  onClose: () => void;
};

export function AttendanceDetailDrawer({ record, onClose }: Props) {
  useEffect(() => {
    if (!record) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [record, onClose]);

  if (!record) return null;

  return (
    <div className="fixed inset-0 z-[130] flex justify-end">
      <button type="button" className="absolute inset-0 bg-slate-900/40" aria-label="Close" onClick={onClose} />
      <aside className="relative z-[1] flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{record.employeeName}</h2>
            <p className="text-sm text-slate-500">{record.date}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
          <StatusBadge label={STATUS_LABEL[record.status]} tone={STATUS_TONE[record.status]} />

          <dl className="space-y-3 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-400" />
              <span>Check in {record.checkIn ?? "—"} · Check out {record.checkOut ?? "—"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-400" />
              <span>{record.hoursWorked != null ? `${record.hoursWorked} hours worked` : "No hours recorded"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-slate-400" />
              <span>{record.department}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-slate-400" />
              <span>{record.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span>{record.date}</span>
            </div>
          </dl>
        </div>
      </aside>
    </div>
  );
}
