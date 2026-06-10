"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { AlertCircle, Calendar, Check, Clock, Loader2, RefreshCw, UserPlus } from "lucide-react";

import type { HrmViewMode } from "@/features/workspace/components/hrm/hrm-directory-view-toggle";
import { ApplyLeaveModal } from "@/features/workspace/components/hrm/leave/apply-leave-modal";
import { LeaveDirectoryGrid } from "@/features/workspace/components/hrm/leave/leave-directory-grid";
import { LeaveDetailPanel } from "@/features/workspace/components/hrm/leave/leave-detail-panel";
import {
  LeaveDirectoryToolbar,
  type LeaveFilters,
} from "@/features/workspace/components/hrm/leave/leave-directory-toolbar";
import { LeaveTable } from "@/features/workspace/components/hrm/leave/leave-table";
import { useHrCompanyId } from "@/features/workspace/hooks/use-hr-company-id";
import type { ApplyLeavePayload, LeaveRequest, LeaveStatus } from "@/types/hrm";
import {
  applyHrLeaveRequest,
  fetchHrLeaveRequests,
  updateHrLeaveRequestStatus,
} from "@/lib/api/hrm";

const EMPTY_FILTERS: LeaveFilters = { query: "", status: "", leaveType: "" };

export function HrmLeaveView() {
  const companyId = useHrCompanyId();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [filters, setFilters] = useState<LeaveFilters>(EMPTY_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [applyOpen, setApplyOpen] = useState(false);
  const [viewMode, setViewMode] = useState<HrmViewMode>("grid");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!companyId) {
      setLoading(false);
      return;
    }
    setError(null);
    try {
      const list = await fetchHrLeaveRequests(companyId, {
        status: filters.status || undefined,
        leaveType: filters.leaveType || undefined,
      });
      setRequests(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load leave requests.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [companyId, filters.status, filters.leaveType]);

  useEffect(() => {
    setLoading(true);
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    if (!q) return requests;
    return requests.filter((r) => {
      const hay = `${r.employeeName} ${r.employeeCode} ${r.requestId} ${r.department}`.toLowerCase();
      return hay.includes(q);
    });
  }, [requests, filters.query]);

  const selected = selectedId ? requests.find((r) => r.id === selectedId) ?? null : null;
  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const approvedCount = requests.filter((r) => r.status === "approved").length;
  const totalDays = requests.filter((r) => r.status === "approved").reduce((s, r) => s + r.days, 0);

  const handleRefresh = () => {
    setRefreshing(true);
    void load();
  };

  const updateStatus = async (id: string, status: LeaveStatus) => {
    if (!companyId) return;
    try {
      const updated = await updateHrLeaveRequestStatus(companyId, id, status);
      setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update leave status.");
    }
  };

  const handleApply = async (payload: ApplyLeavePayload) => {
    if (!companyId) return;
    const created = await applyHrLeaveRequest(companyId, payload);
    setRequests((prev) => [created, ...prev]);
    setSelectedId(created.id);
  };

  return (
    <div className="pb-10">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">People · HRM</p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Manage leave</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Leave requests, approvals, and team availability.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { label: "Requests", value: requests.length, icon: Calendar },
              { label: "Pending", value: pendingCount, icon: Clock },
              { label: "Approved", value: approvedCount, icon: Check },
              { label: "Days approved", value: totalDays, icon: UserPlus },
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
              disabled={refreshing}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw className={cnIcon(refreshing)} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      {error ? (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <LeaveDirectoryToolbar
          filters={filters}
          onChange={setFilters}
          onApply={() => setApplyOpen(true)}
          resultCount={filtered.length}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-sm text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading leave requests…
          </div>
        ) : viewMode === "grid" ? (
          <LeaveDirectoryGrid
            requests={filtered}
            selectedId={selectedId}
            onSelect={(r) => setSelectedId(r.id)}
            onApply={() => setApplyOpen(true)}
          />
        ) : (
          <LeaveTable requests={filtered} selectedId={selectedId} onSelect={(r) => setSelectedId(r.id)} />
        )}
      </div>

      <AnimatePresence>
        {selected ? (
          <LeaveDetailPanel
            key={selected.id}
            request={selected}
            onClose={() => setSelectedId(null)}
            onUpdateStatus={(status) => void updateStatus(selected.id, status)}
          />
        ) : null}
      </AnimatePresence>

      <ApplyLeaveModal
        open={applyOpen}
        companyId={companyId}
        onClose={() => setApplyOpen(false)}
        onSubmit={handleApply}
      />
    </div>
  );
}

function cnIcon(spinning: boolean) {
  return `h-3.5 w-3.5 ${spinning ? "animate-spin" : ""}`;
}
