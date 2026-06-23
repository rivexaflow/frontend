"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";

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
  const [employees, setEmployees] = useState<HrmEmployeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        description={
          headcountHint
            ? `Recruitment pipeline, workforce analytics, and today’s schedule. ${headcountHint}.`
            : "Recruitment pipeline, workforce analytics, and today’s schedule."
        }
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
