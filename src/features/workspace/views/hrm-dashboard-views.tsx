"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, Loader2, RefreshCw, AlertTriangle, Server } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

import { HrmDashboardDailyTasks } from "@/features/workspace/components/hrm/dashboard/hrm-dashboard-daily-tasks";
import { HrmDashboardKpiCards } from "@/features/workspace/components/hrm/dashboard/hrm-dashboard-kpi-cards";
import { HrmDashboardOpenPositionsSummary } from "@/features/workspace/components/hrm/dashboard/hrm-dashboard-open-positions-summary";
import { HrmDashboardOverviewChart } from "@/features/workspace/components/hrm/dashboard/hrm-dashboard-overview-chart";
import { HrmDashboardPositionDetail } from "@/features/workspace/components/hrm/dashboard/hrm-dashboard-position-detail";
import { HrmDashboardRecruitmentBoard } from "@/features/workspace/components/hrm/dashboard/hrm-dashboard-recruitment-board";
import { HrmDashboardSchedule } from "@/features/workspace/components/hrm/dashboard/hrm-dashboard-schedule";
import { HrmPageHeader } from "@/features/workspace/components/hrm/hrm-page-header";
import { useHrCompanyId } from "@/features/workspace/hooks/use-hr-company-id";
import {
  DEMO_HRM_CANDIDATES,
  HRM_DAILY_TASKS,
  HRM_DASHBOARD_KPIS,
  HRM_OPEN_POSITIONS,
  HRM_SCHEDULE_BASE_DATE,
  type HrmCandidate,
  type HrmDailyTask,
  type HrmOverviewMonth,
  type HrmRecruitmentStage,
} from "@/features/workspace/data/hrm-dashboard-demo";
import { MISSING_COMPANY_CONTEXT_MESSAGE } from "@/lib/workspace/company-context";
import { fetchHrEmployees } from "@/lib/api/hrm";
import type { HrmEmployeeRecord } from "@/types/hrm";

type MainPanel =
  | { view: "overview" }
  | { view: "pipeline"; focus: HrmRecruitmentStage }
  | { view: "position"; positionId: string };

export function HrmDashboardView() {
  const companyId = useHrCompanyId();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const [employees, setEmployees] = useState<HrmEmployeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localServer, setLocalServer] = useState<{
    active: boolean;
    ip?: string;
    port?: number;
    isOnline?: boolean;
    backupTimestamp?: string;
    compromised?: boolean;
  } | null>(null);

  useEffect(() => {
    if (!companyId) return;
    const fetchStatus = async () => {
      try {
        const res = await apiClient.get(`/auth/cli/status?companyId=${companyId}`);
        if (res.data?.success) {
          setLocalServer(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch local server status", err);
      }
    };
    void fetchStatus();
  }, [companyId]);

  const [candidates, setCandidates] = useState<HrmCandidate[]>(DEMO_HRM_CANDIDATES);
  const [tasks, setTasks] = useState<HrmDailyTask[]>(HRM_DAILY_TASKS);
  const [panel, setPanel] = useState<MainPanel>({ view: "overview" });
  const [selectedMonth, setSelectedMonth] = useState<HrmOverviewMonth>("Apr");
  const [scheduleWeekOffset, setScheduleWeekOffset] = useState(0);
  const [selectedScheduleDate, setSelectedScheduleDate] = useState(HRM_SCHEDULE_BASE_DATE.getDate());

  const load = useCallback(async () => {
    if (!companyId) {
      setLoading(false);
      return;
    }
    try {
      setError(null);
      const list = await fetchHrEmployees(companyId);
      setEmployees(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load HR dashboard.");
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    void load();
  }, [load]);

  const kpis = useMemo(() => {
    const counts = {
      applicant: candidates.filter((c) => c.stageId === "applicant").length,
      interviewed: candidates.filter((c) => c.stageId === "interviewed").length,
      hired: candidates.filter((c) => c.stageId === "hired").length,
    };
    return HRM_DASHBOARD_KPIS.map((k) => ({ ...k, value: counts[k.id] }));
  }, [candidates]);

  const headcountHint = useMemo(() => {
    if (!employees.length) return undefined;
    const active = employees.filter((e) => e.status === "active").length;
    return `${active} active · ${employees.length} total in directory`;
  }, [employees]);

  const selectedPosition = useMemo(
    () => (panel.view === "position" ? HRM_OPEN_POSITIONS.find((p) => p.id === panel.positionId) : null),
    [panel],
  );

  const handleKpiSelect = (id: HrmRecruitmentStage) => {
    if (panel.view === "pipeline" && panel.focus === id) {
      setPanel({ view: "overview" });
    } else {
      setPanel({ view: "pipeline", focus: id });
    }
  };

  const openPosition = (positionId: string) => {
    setPanel({ view: "position", positionId });
  };

  const backToOverview = () => setPanel({ view: "overview" });

  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-24 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!companyId) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <p>{MISSING_COMPANY_CONTEXT_MESSAGE}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading HRM dashboard…
      </div>
    );
  }

  const kpiActiveId = panel.view === "pipeline" ? panel.focus : null;

  return (
    <div className="pb-10">
      <HrmPageHeader
        module="People · HRM"
        title="HRM Dashboard"
        actions={
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        }
      />

       {error ? (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      ) : null}

      {localServer && localServer.active && (
        <div className={cn(
          "mb-6 flex flex-col justify-between gap-4 rounded-2xl border p-5 shadow-sm md:flex-row md:items-center",
          localServer.compromised
            ? "border-rose-200 bg-rose-50/50 dark:border-rose-900/30 dark:from-rose-950/20"
            : localServer.isOnline
              ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/30 dark:from-emerald-950/20"
              : "border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900"
        )}>
          <div className="flex items-start gap-4">
            <div className={cn(
              "flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-md",
              localServer.compromised
                ? "bg-rose-500"
                : localServer.isOnline
                  ? "bg-emerald-500"
                  : "bg-slate-400"
            )}>
              {localServer.compromised ? (
                <AlertTriangle className="h-6 w-6 animate-pulse" />
              ) : (
                <Server className="h-6 w-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-slate-900 dark:text-white">Local Premises Hosting Server</h4>
                <span className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                  localServer.compromised
                    ? "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400"
                    : localServer.isOnline
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400"
                )}>
                  {localServer.compromised ? "🚨 compromised / wiped" : localServer.isOnline ? "🟢 active & online" : "🔴 disconnected"}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Running locally at: <code className="rounded bg-slate-100 px-1 py-0.5 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">{localServer.ip}:{localServer.port}</code>
              </p>
              {localServer.backupTimestamp && (
                <p className="mt-1 text-[11px] text-slate-400">
                  Last secure cloud sync backup: <span className="font-semibold text-slate-600 dark:text-slate-300">{new Date(localServer.backupTimestamp).toLocaleString()}</span>
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/lucky-neo-enterprise?portal=integrations" 
              className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              Configure Deployment
            </Link>
          </div>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(280px,340px)] xl:items-start">
        <div className="space-y-6">
          {panel.view === "overview" ? (
            <HrmDashboardKpiCards items={kpis} activeId={null} onSelect={handleKpiSelect} />
          ) : null}

          {panel.view === "pipeline" ? (
            <>
              <HrmDashboardKpiCards items={kpis} activeId={kpiActiveId} onSelect={handleKpiSelect} />
              <HrmDashboardRecruitmentBoard
                candidates={candidates}
                onChange={setCandidates}
                focusStage={panel.focus}
                onClose={backToOverview}
              />
            </>
          ) : null}

          {panel.view === "position" && selectedPosition ? (
            <HrmDashboardPositionDetail
              position={selectedPosition}
              candidates={candidates}
              onChangeCandidates={setCandidates}
              onBack={backToOverview}
            />
          ) : null}

          {panel.view === "overview" ? (
            <>
              <div className="grid gap-4 lg:grid-cols-2 lg:items-stretch">
                <HrmDashboardOpenPositionsSummary
                  positions={HRM_OPEN_POSITIONS}
                  onOpenPosition={openPosition}
                />
                <HrmDashboardOverviewChart
                  selectedMonth={selectedMonth}
                  onSelectMonth={setSelectedMonth}
                />
              </div>
              <HrmDashboardDailyTasks tasks={tasks} onChange={setTasks} />
            </>
          ) : null}
        </div>

        <div className="xl:sticky xl:top-6">
          <HrmDashboardSchedule
            weekOffset={scheduleWeekOffset}
            selectedDate={selectedScheduleDate}
            onWeekChange={setScheduleWeekOffset}
            onSelectDate={setSelectedScheduleDate}
          />
        </div>
      </div>
    </div>
  );
}

export function HrmAttendanceDashboardView() {
  return null;
}
