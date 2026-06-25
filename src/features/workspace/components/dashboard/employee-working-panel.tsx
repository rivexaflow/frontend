"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, User, Users } from "lucide-react";
import { workspaceStore } from "@/stores/workspace.store";
import { apiClient } from "@/lib/api/client";
import { cn } from "@/lib/utils/cn";

type EmployeeWorkingPanelProps = {
  workspaceSlug: string;
};

export function EmployeeWorkingPanel({ workspaceSlug }: EmployeeWorkingPanelProps) {
  const { workspaceId } = workspaceStore();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tickedHours, setTickedHours] = useState<Record<string, number>>({});

  const fetchAttendance = async () => {
    if (!workspaceId) return;
    try {
      const res = await apiClient.get(`/hr/${workspaceId}/attendance`, {
        params: { limit: 10 }
      });
      if (res.data.success) {
        setRecords(res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to load employee working hours:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
    const interval = setInterval(fetchAttendance, 15000);
    return () => clearInterval(interval);
  }, [workspaceId]);

  useEffect(() => {
    const timer = setInterval(() => {
      const updated: Record<string, number> = {};
      const now = new Date().getTime();
      records.forEach((r) => {
        if (r.checkIn && !r.checkOut) {
          const checkInTime = new Date(r.checkIn).getTime();
          const elapsed = (now - checkInTime) / (1000 * 60 * 60);
          updated[r.id] = Math.max(0, elapsed);
        }
      });
      setTickedHours(updated);
    }, 1000);

    return () => clearInterval(timer);
  }, [records]);

  const formatHours = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const getLocalDateString = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return "Today";
    
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  const activeCount = records.filter(r => r.checkIn && !r.checkOut).length;

  return (
    <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Employee Working Hours</h3>
            <p className="text-xs text-slate-500">
              {activeCount} actively working now · showing latest attendance
            </p>
          </div>
        </div>
        <Link
          href={`/${workspaceSlug}/hrm/attendance`}
          className="text-xs font-bold text-blue-600 hover:underline"
        >
          View details
        </Link>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        </div>
      ) : records.length === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center text-center p-4">
          <Clock className="h-8 w-8 text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No attendance logs found</p>
          <p className="text-xs text-slate-400 mt-0.5">Clocked-in team activity will appear here dynamically.</p>
        </div>
      ) : (
        <div className="max-h-[380px] overflow-y-auto pr-1 space-y-3 scrollbar-none">
          {records.map((r) => {
            const isActive = r.checkIn && !r.checkOut;
            const currentHours = isActive ? (tickedHours[r.id] ?? r.hoursWorked ?? 0) : (r.hoursWorked ?? 0);
            return (
              <div
                key={r.id}
                className={cn(
                  "flex w-full items-center justify-between rounded-2xl border p-4 transition shadow-sm",
                  isActive
                    ? "border-emerald-100 bg-emerald-50/20 dark:border-emerald-950/20 dark:bg-emerald-950/5"
                    : "border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                    isActive 
                      ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400" 
                      : "bg-slate-50 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                  )}>
                    <User className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                      {r.employee?.fullName || "Employee"}
                    </p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {r.employee?.designation || "Staff"} · {getLocalDateString(r.date)}
                    </p>
                  </div>
                </div>
                
                <div className="text-right shrink-0 ml-3 space-y-1">
                  <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                    {isActive ? (
                      <>
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-emerald-700 dark:text-emerald-400">Active</span>
                      </>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500">Clocked Out</span>
                    )}
                  </span>
                  <p className={cn(
                    "text-sm font-black tracking-tight",
                    isActive ? "text-emerald-700 dark:text-emerald-400" : "text-slate-700 dark:text-slate-300"
                  )}>
                    {formatHours(currentHours)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
