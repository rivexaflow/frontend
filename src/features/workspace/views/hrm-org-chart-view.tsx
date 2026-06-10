"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { AlertCircle, GitBranch, Loader2, Users } from "lucide-react";

import {
  OrganizationChart,
  OrgChartToolbar,
} from "@/features/workspace/components/hrm/organization-chart";
import { OrgChartDetailPanel } from "@/features/workspace/components/hrm/org-chart-detail-panel";
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

  return (
    <EnterprisePageShell
      eyebrow="People · HRM"
      title="Company org chart"
      description="Full-width interactive hierarchy. Click any unit to open its profile — scroll and zoom to explore the entire organization."
      metrics={[
        {
          label: "Headcount",
          value: String(employees.length),
          hint: "On chart",
          icon: Users,
          tone: "blue",
        },
        {
          label: "Units",
          value: String(new Set(employees.map((e) => e.unitLabel ?? e.department)).size),
          icon: GitBranch,
          tone: "purple",
        },
      ]}
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
