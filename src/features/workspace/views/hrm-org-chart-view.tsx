"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { AlertCircle, GitBranch, Layers, Loader2, Users } from "lucide-react";

import {
  OrganizationChart,
  OrgChartToolbar,
} from "@/features/workspace/components/hrm/organization-chart";
import { OrgChartDetailPanel } from "@/features/workspace/components/hrm/org-chart-detail-panel";
import { measureOrgTree } from "@/features/workspace/components/hrm/org-chart-layout";
import { OrgChartStatStrip } from "@/features/workspace/components/hrm/org-chart-stat-strip";
import { EnterprisePageShell } from "@/features/workspace/components/enterprise/enterprise-page-shell";
import { useHrCompanyId } from "@/features/workspace/hooks/use-hr-company-id";
import { MISSING_COMPANY_CONTEXT_MESSAGE } from "@/lib/workspace/company-context";
import type { HrmEmployee } from "@/features/workspace/data/hrm-org-demo";
import { fetchHrOrgChart, reassignHrEmployeeManager } from "@/lib/api/hrm";

export function HrmOrgChartView() {
  const companyId = useHrCompanyId();
  const [employees, setEmployees] = useState<HrmEmployee[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
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
      const list = await fetchHrOrgChart(companyId);
      setEmployees(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load org chart.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [companyId]);

  useEffect(() => {
    setLoading(true);
    void load();
  }, [load]);

  const selected = selectedId ? employees.find((e) => e.id === selectedId) ?? null : null;

  const updateSelected = useCallback(
    (patch: Partial<HrmEmployee>) => {
      if (!selectedId) return;
      setEmployees((prev) => prev.map((e) => (e.id === selectedId ? { ...e, ...patch } : e)));
    },
    [selectedId],
  );

  const handleReassignManager = useCallback(
    async (employeeId: string, managerId: string) => {
      if (!companyId) throw new Error("No company workspace found.");
      await reassignHrEmployeeManager(companyId, employeeId, managerId);
    },
    [companyId],
  );

  const handleRefresh = () => {
    setRefreshing(true);
    setSelectedId(null);
    void load();
  };

  const orgStats = useMemo(() => {
    const unitCount = new Set(employees.map((e) => e.unitLabel ?? e.department).filter(Boolean)).size;
    const { depth } = measureOrgTree(employees);
    const managerCount = employees.filter((e) =>
      employees.some((r) => r.managerId === e.id),
    ).length;

    return [
      {
        label: "Headcount",
        value: employees.length,
        hint: "On chart",
        icon: Users,
        tone: "blue" as const,
      },
      {
        label: "Units",
        value: unitCount,
        hint: "Departments",
        icon: GitBranch,
        tone: "emerald" as const,
      },
      {
        label: "Levels",
        value: depth,
        hint: managerCount > 0 ? `${managerCount} managers` : "Hierarchy depth",
        icon: Layers,
        tone: "amber" as const,
      },
    ];
  }, [employees]);

  return (
    <EnterprisePageShell
      eyebrow="People · HRM"
      title="Company org chart"
      description="Full-width interactive hierarchy. Click any unit to open its profile — scroll and zoom to explore the entire organization."
      toolbar={<OrgChartToolbar onRefresh={handleRefresh} />}
    >
      {!companyId ? (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{MISSING_COMPANY_CONTEXT_MESSAGE}</p>
        </div>
      ) : null}

      {error ? (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      ) : null}

      <OrgChartStatStrip stats={orgStats} />

      <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-100 px-5 py-3.5 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Organization structure</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            {selected
              ? "Profile panel open — drag cards to reassign reporting lines"
              : "Click a card for details · drag to reassign manager"}
          </p>
        </div>

        <div className="relative h-[min(78vh,820px)] min-h-[640px]">
          {loading ? (
            <div className="flex h-full items-center justify-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading org chart…
            </div>
          ) : (
            <>
              <OrganizationChart
                employees={employees}
                onEmployeesChange={setEmployees}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onReassignManager={companyId ? handleReassignManager : undefined}
              />

              <AnimatePresence>
                {selected ? (
                  <OrgChartDetailPanel
                    key={selected.id}
                    employee={selected}
                    employees={employees}
                    onClose={() => setSelectedId(null)}
                    onUpdate={updateSelected}
                  />
                ) : null}
              </AnimatePresence>
            </>
          )}
        </div>
      </div>
    </EnterprisePageShell>
  );
}
