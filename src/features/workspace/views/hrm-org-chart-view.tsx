"use client";

import { useCallback, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { GitBranch, Users } from "lucide-react";

import {
  OrganizationChart,
  OrgChartToolbar,
  addReportToManager,
} from "@/features/workspace/components/hrm/organization-chart";
import { OrgChartDetailPanel } from "@/features/workspace/components/hrm/org-chart-detail-panel";
import { EnterprisePageShell } from "@/features/workspace/components/enterprise/enterprise-page-shell";
import {
  DEMO_HRM_EMPLOYEES,
  type HrmEmployee,
} from "@/features/workspace/data/hrm-org-demo";

export function HrmOrgChartView() {
  const [employees, setEmployees] = useState<HrmEmployee[]>([...DEMO_HRM_EMPLOYEES]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = selectedId
    ? employees.find((e) => e.id === selectedId) ?? null
    : null;

  const updateSelected = useCallback(
    (patch: Partial<HrmEmployee>) => {
      if (!selectedId) return;
      setEmployees((prev) =>
        prev.map((e) => (e.id === selectedId ? { ...e, ...patch } : e)),
      );
    },
    [selectedId],
  );

  const handleAddReport = useCallback(() => {
    if (!selectedId) return;
    const { next, newId } = addReportToManager(employees, selectedId);
    setEmployees(next);
    setSelectedId(newId);
  }, [employees, selectedId]);

  const handleDeleteSelected = useCallback(() => {
    if (!selectedId || selectedId === "emp_root") return;
    const toRemove = new Set<string>();
    const collect = (empId: string) => {
      toRemove.add(empId);
      employees
        .filter((e) => e.managerId === empId)
        .forEach((c) => collect(c.id));
    };
    collect(selectedId);
    setEmployees((prev) => prev.filter((e) => !toRemove.has(e.id)));
    setSelectedId(null);
  }, [employees, selectedId]);

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
      toolbar={
        <OrgChartToolbar onRefresh={() => {
          setEmployees([...DEMO_HRM_EMPLOYEES]);
          setSelectedId(null);
        }} />
      }
    >
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-100 px-5 py-3.5 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Organization structure
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            {selected
              ? "Profile panel open — click outside or close to return to full chart"
              : "Click a card to view and edit unit details"}
          </p>
        </div>

        <div className="relative h-[min(78vh,820px)] min-h-[640px]">
          <OrganizationChart
            employees={employees}
            onEmployeesChange={setEmployees}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />

          <AnimatePresence>
            {selected ? (
              <OrgChartDetailPanel
                key={selected.id}
                employee={selected}
                employees={employees}
                onClose={() => setSelectedId(null)}
                onUpdate={updateSelected}
                onAddReport={handleAddReport}
                onDelete={handleDeleteSelected}
              />
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </EnterprisePageShell>
  );
}
