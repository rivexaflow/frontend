"use client";

import { useMemo, useState } from "react";
import { BarChart3, Building2, Target, TrendingUp, UsersRound } from "lucide-react";

import { CrmPanel, CrmPanelHead, CrmShell } from "@/features/workspace/components/crm/crm-panel";
import { PerformanceAnalyticsPanel } from "@/features/workspace/components/hrm/performance/performance-analytics-panel";
import {
  PerformanceBreadcrumb,
  type PerformanceDrillPath,
} from "@/features/workspace/components/hrm/performance/performance-breadcrumb";
import { PerformanceEmployeePanel } from "@/features/workspace/components/hrm/performance/performance-employee-panel";
import { PerformanceEmployeesTable } from "@/features/workspace/components/hrm/performance/performance-employees-table";
import { PerformanceHighlightsStrip } from "@/features/workspace/components/hrm/performance/performance-highlights-strip";
import { PerformanceDepartmentCard } from "@/features/workspace/components/hrm/performance/performance-department-card";
import {
  PerformanceUnitCard,
  type PerformanceUnitCardData,
} from "@/features/workspace/components/hrm/performance/performance-unit-card";
import { HrmCompactBanner, HrmPanelTabs } from "@/features/workspace/components/hrm/hrm-compact-banner";
import { OrgChartStatStrip } from "@/features/workspace/components/hrm/org-chart-stat-strip";
import {
  DEMO_PERFORMANCE_DEPARTMENTS,
  DEMO_PERFORMANCE_EMPLOYEES,
  DEMO_PERFORMANCE_TEAMS,
  getEmployeesForDepartment,
  getEmployeesForTeam,
  getPerformanceStats,
  getTeamsForDepartment,
  getTopBottomPerformers,
  type PerformanceEmployee,
} from "@/features/workspace/data/hrm-performance-demo";

type Tab = "overview" | "analytics";

function teamToCard(team: (typeof DEMO_PERFORMANCE_TEAMS)[0], employees: PerformanceEmployee[]): PerformanceUnitCardData {
  const teamEmployees = getEmployeesForTeam(team.id, employees);
  return {
    id: team.id,
    title: team.name,
    category: "Team",
    leaderName: team.leaderName,
    memberCount: team.memberCount,
    avatarNames: teamEmployees.map((e) => e.name),
    score: team.avgScore,
    trendPct: team.trendPct,
    trendUp: team.trendUp,
    sparkline: team.sparkline,
    stage: team.stage,
    stageProgress: team.stageProgress,
    band: team.band,
    kind: "team",
  };
}

export function HrmPerformanceView() {
  const [tab, setTab] = useState<Tab>("overview");
  const [path, setPath] = useState<PerformanceDrillPath>({});
  const [query, setQuery] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  const stats = useMemo(() => getPerformanceStats(DEMO_PERFORMANCE_EMPLOYEES), []);

  const selectedDept = path.departmentId
    ? DEMO_PERFORMANCE_DEPARTMENTS.find((d) => d.id === path.departmentId)
    : null;
  const selectedTeam = path.teamId
    ? DEMO_PERFORMANCE_TEAMS.find((t) => t.id === path.teamId)
    : null;

  const deptTeams = path.departmentId ? getTeamsForDepartment(path.departmentId) : [];
  const teamEmployees = path.teamId ? getEmployeesForTeam(path.teamId) : [];
  const deptEmployees = path.departmentId && !path.teamId
    ? getEmployeesForDepartment(path.departmentId)
    : [];

  const q = query.trim().toLowerCase();

  const filteredDepartments = useMemo(() => {
    if (!q) return DEMO_PERFORMANCE_DEPARTMENTS;
    return DEMO_PERFORMANCE_DEPARTMENTS.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.headName.toLowerCase().includes(q),
    );
  }, [q]);

  const filteredTeams = useMemo(() => {
    const base = deptTeams;
    if (!q) return base;
    return base.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.leaderName.toLowerCase().includes(q),
    );
  }, [deptTeams, q]);

  const filteredEmployees = useMemo(() => {
    const base = path.teamId ? teamEmployees : deptEmployees;
    if (!q) return base;
    return base.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.designation.toLowerCase().includes(q) ||
        e.teamName.toLowerCase().includes(q),
    );
  }, [path.teamId, teamEmployees, deptEmployees, q]);

  const deptHighlights = useMemo(
    () => getTopBottomPerformers(deptEmployees),
    [deptEmployees],
  );
  const teamHighlights = useMemo(
    () => getTopBottomPerformers(teamEmployees),
    [teamEmployees],
  );

  const selectedEmployee = selectedEmployeeId
    ? DEMO_PERFORMANCE_EMPLOYEES.find((e) => e.id === selectedEmployeeId) ?? null
    : null;

  const teamAvg = selectedTeam?.avgScore;
  const deptAvg = selectedDept?.avgScore;

  const resultCount = path.teamId
    ? filteredEmployees.length
    : path.departmentId
      ? filteredTeams.length
      : filteredDepartments.length;

  const handleNavigate = (next: PerformanceDrillPath) => {
    setPath(next);
    setSelectedEmployeeId(null);
    if (!next.departmentId) setQuery("");
  };

  const viewLevel = path.teamId ? "employees" : path.departmentId ? "teams" : "departments";

  return (
    <div className="pb-8">
      <CrmShell>
        <HrmCompactBanner
          title="Performance & goals"
          subtitle="Department → team → employee · Appraisals, KPIs, and growth tracking"
          stats={[
            { label: "Org avg", value: stats.avgScore },
            { label: "On track", value: stats.onTrack, tone: "success" },
            { label: "At risk", value: stats.atRisk, tone: "warning" },
            { label: "Employees", value: stats.total },
          ]}
        />

        <HrmPanelTabs
          tabs={[
            { id: "overview" as const, label: "Overview", count: DEMO_PERFORMANCE_DEPARTMENTS.length },
            { id: "analytics" as const, label: "Analytics" },
          ]}
          active={tab}
          onChange={setTab}
        />

        <div className="space-y-4 p-3 md:p-4">
          {tab === "analytics" ? (
            <PerformanceAnalyticsPanel />
          ) : (
            <>
              <OrgChartStatStrip
                stats={[
                  {
                    label: "Departments",
                    value: DEMO_PERFORMANCE_DEPARTMENTS.length,
                    hint: "Org units",
                    icon: Building2,
                    tone: "blue",
                  },
                  {
                    label: "Teams",
                    value: DEMO_PERFORMANCE_TEAMS.length,
                    hint: "Active squads",
                    icon: UsersRound,
                    tone: "blue",
                  },
                  {
                    label: "Avg score",
                    value: stats.avgScore,
                    hint: "Org-wide",
                    icon: TrendingUp,
                    tone: "emerald",
                  },
                ]}
              />

              <CrmPanel>
                <CrmPanelHead
                  title={
                    viewLevel === "employees"
                      ? selectedTeam?.name ?? "Team members"
                      : viewLevel === "teams"
                        ? selectedDept?.name ?? "Teams"
                        : "Departments"
                  }
                  subtitle={
                    viewLevel === "employees"
                      ? "Click an employee to open their full performance panel"
                      : viewLevel === "teams"
                        ? "Select a team to view member performance"
                        : "Click a department to drill into teams and employees"
                  }
                  actions={
                    viewLevel === "departments" ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400">
                        <Target className="h-3.5 w-3.5" />
                        FY 2026 H1 cycle
                      </span>
                    ) : null
                  }
                />
                <div className="space-y-4 p-4">
                  <PerformanceBreadcrumb
                    path={path}
                    query={query}
                    onQueryChange={setQuery}
                    onNavigate={handleNavigate}
                    resultCount={resultCount}
                  />

                  {viewLevel === "departments" ? (
                    <>
                      {!path.departmentId && (
                        <PerformanceHighlightsStrip
                          scopeLabel="Organization"
                          top={getTopBottomPerformers(DEMO_PERFORMANCE_EMPLOYEES).top}
                          bottom={getTopBottomPerformers(DEMO_PERFORMANCE_EMPLOYEES).bottom}
                        />
                      )}
                      <div className="grid gap-4 sm:grid-cols-2">
                        {filteredDepartments.map((dept) => {
                          const deptEmployees = getEmployeesForDepartment(dept.id, DEMO_PERFORMANCE_EMPLOYEES);
                          return (
                            <PerformanceDepartmentCard
                              key={dept.id}
                              dept={dept}
                              avatarNames={deptEmployees.map((e) => e.name)}
                              onSelect={() =>
                                handleNavigate({
                                  departmentId: dept.id,
                                  departmentName: dept.name,
                                })
                              }
                            />
                          );
                        })}
                      </div>
                    </>
                  ) : null}

                  {viewLevel === "teams" ? (
                    <>
                      <PerformanceHighlightsStrip
                        scopeLabel={selectedDept?.name ?? "Department"}
                        top={deptHighlights.top}
                        bottom={deptHighlights.bottom}
                      />
                      <div className="space-y-3">
                        {filteredTeams.map((team) => (
                          <PerformanceUnitCard
                            key={team.id}
                            unit={teamToCard(team, DEMO_PERFORMANCE_EMPLOYEES)}
                            onSelect={() =>
                              handleNavigate({
                                departmentId: path.departmentId,
                                departmentName: path.departmentName,
                                teamId: team.id,
                                teamName: team.name,
                              })
                            }
                          />
                        ))}
                      </div>
                    </>
                  ) : null}

                  {viewLevel === "employees" ? (
                    <>
                      <PerformanceHighlightsStrip
                        scopeLabel={selectedTeam?.name ?? "Team"}
                        top={teamHighlights.top}
                        bottom={teamHighlights.bottom}
                      />
                      <PerformanceEmployeesTable
                        employees={filteredEmployees}
                        selectedId={selectedEmployeeId}
                        onSelect={(emp) => setSelectedEmployeeId(emp.id)}
                      />
                    </>
                  ) : null}

                  {resultCount === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center">
                      <BarChart3 className="mx-auto h-8 w-8 text-slate-300" />
                      <p className="mt-3 text-sm font-medium text-slate-600">No results match your search</p>
                    </div>
                  ) : null}
                </div>
              </CrmPanel>
            </>
          )}
        </div>
      </CrmShell>

      <PerformanceEmployeePanel
        employee={selectedEmployee}
        teamAvg={teamAvg}
        deptAvg={deptAvg}
        onClose={() => setSelectedEmployeeId(null)}
      />
    </div>
  );
}
