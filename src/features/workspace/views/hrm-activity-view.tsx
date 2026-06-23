"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  Download,
  Filter,
  RefreshCw,
  Search,
  Shield,
  User,
} from "lucide-react";

import { CrmPanel, CrmPanelHead, CrmShell } from "@/features/workspace/components/crm/crm-panel";
import { HrmActivityTimeline } from "@/features/workspace/components/hrm/activity/hrm-activity-timeline";
import { HrmCompactBanner, HrmPanelTabs } from "@/features/workspace/components/hrm/hrm-compact-banner";
import { OrgChartStatStrip } from "@/features/workspace/components/hrm/org-chart-stat-strip";
import {
  DEMO_HRM_ACTIVITY_EVENTS,
  getHrmActivityStats,
  groupActivityByDay,
  HRM_ACTIVITY_MODULES,
  type HrmActivityEvent,
  type HrmActivityModuleFilter,
  type HrmActivitySeverity,
} from "@/features/workspace/data/hrm-activity-ui";
import { cn } from "@/lib/utils/cn";

type SeverityFilter = "all" | HrmActivitySeverity;

const SEVERITY_TABS: { id: SeverityFilter; label: string }[] = [
  { id: "all", label: "All events" },
  { id: "info", label: "Info" },
  { id: "success", label: "Success" },
  { id: "warning", label: "Warnings" },
  { id: "critical", label: "Critical" },
];

export function HrmActivityView() {
  const [query, setQuery] = useState("");
  const [moduleFilter, setModuleFilter] = useState<HrmActivityModuleFilter>("All");
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("all");
  const [selected, setSelected] = useState<HrmActivityEvent | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DEMO_HRM_ACTIVITY_EVENTS.filter((e) => {
      if (moduleFilter !== "All" && e.module !== moduleFilter) return false;
      if (severityFilter !== "all" && e.severity !== severityFilter) return false;
      if (
        q &&
        !`${e.action} ${e.module} ${e.actor} ${e.detail ?? ""}`.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    }).sort((a, b) => a.occurredAtSort - b.occurredAtSort);
  }, [query, moduleFilter, severityFilter]);

  const stats = useMemo(() => getHrmActivityStats(DEMO_HRM_ACTIVITY_EVENTS), []);
  const grouped = useMemo(() => groupActivityByDay(filtered), [filtered]);

  const handleRefresh = () => {
    setRefreshing(true);
    window.setTimeout(() => setRefreshing(false), 600);
  };

  return (
    <div className="pb-8">
      <CrmShell>
        <HrmCompactBanner
          title="HR activity"
          subtitle="Audit trail · profile changes · approvals · security events"
          stats={[
            { label: "Events", value: stats.total },
            { label: "Today", value: stats.today, tone: "success" },
            { label: "Alerts", value: stats.warnings, tone: stats.warnings > 0 ? "warning" : "default" },
            { label: "Modules", value: stats.modules },
          ]}
          actions={
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-white/15 px-3 text-xs font-semibold text-white ring-1 ring-white/20 hover:bg-white/25 disabled:opacity-50"
              >
                <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
                Refresh
              </button>
              <button
                type="button"
                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-white px-3 text-xs font-semibold text-[#191970] hover:bg-[#2277ff]/10"
              >
                <Download className="h-3.5 w-3.5" />
                Export log
              </button>
            </div>
          }
        />

        <div className="space-y-4 p-3 md:p-4">
          <OrgChartStatStrip
            stats={[
              {
                label: "Profile updates",
                value: filtered.filter((e) => e.module === "Employees").length,
                hint: "This filter",
                icon: User,
                tone: "blue",
              },
              {
                label: "Compliance",
                value: filtered.filter((e) => e.module === "Documents" || e.module === "Policies").length,
                hint: "Docs & policies",
                icon: Shield,
                tone: "amber",
              },
              {
                label: "Automated",
                value: filtered.filter((e) => e.actor === "System").length,
                hint: "System events",
                icon: Activity,
                tone: "emerald",
              },
            ]}
          />

          <CrmPanel>
            <div className="border-b border-slate-100 px-4 py-3 md:px-5">
              <HrmPanelTabs
                tabs={SEVERITY_TABS.map((t) => ({
                  id: t.id,
                  label: t.label,
                  count:
                    t.id === "all"
                      ? filtered.length
                      : filtered.filter((e) => e.severity === t.id).length,
                }))}
                active={severityFilter}
                onChange={setSeverityFilter}
              />
            </div>

            <div className="space-y-3 border-b border-slate-100 px-4 py-4 md:px-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative min-w-0 flex-1 lg:max-w-md">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search action, actor, or detail…"
                    className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-[#191970] focus:ring-2 focus:ring-[#191970]/10"
                  />
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Filter className="h-3.5 w-3.5" />
                  <span className="font-semibold tabular-nums text-slate-800">{filtered.length}</span> results
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {HRM_ACTIVITY_MODULES.map((mod) => {
                  const active = moduleFilter === mod;
                  const count =
                    mod === "All"
                      ? DEMO_HRM_ACTIVITY_EVENTS.length
                      : DEMO_HRM_ACTIVITY_EVENTS.filter((e) => e.module === mod).length;
                  return (
                    <button
                      key={mod}
                      type="button"
                      onClick={() => setModuleFilter(mod)}
                      className={cn(
                        "rounded-lg px-2.5 py-1.5 text-xs font-semibold transition",
                        active
                          ? "bg-[#191970] text-white shadow-sm"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300",
                      )}
                    >
                      {mod}
                      <span className={cn("ml-1 tabular-nums", active ? "text-white/80" : "text-slate-400")}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid lg:grid-cols-[1fr_minmax(280px,320px)]">
              <div className="border-b border-slate-100 p-4 md:p-5 lg:border-b-0 lg:border-r dark:border-slate-800">
                <CrmPanelHead
                  title="Activity timeline"
                  subtitle="Chronological audit log across HR modules"
                />
                <div className="mt-4">
                  <HrmActivityTimeline
                    groups={grouped}
                    selectedId={selected?.id ?? null}
                    onSelect={setSelected}
                  />
                </div>
              </div>

              <aside className="bg-slate-50/50 p-4 md:p-5 dark:bg-slate-950/30">
                {selected ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Event detail</p>
                      <h3 className="mt-1 text-base font-bold text-slate-900 dark:text-white">{selected.action}</h3>
                      <p className="mt-2 text-sm text-slate-600">{selected.detail}</p>
                    </div>
                    <dl className="space-y-2 rounded-xl border border-slate-200/80 bg-white p-4 text-sm dark:border-slate-800 dark:bg-slate-900">
                      {[
                        ["Module", selected.module],
                        ["Actor", selected.actor],
                        ["Role", selected.actorRole ?? "—"],
                        ["When", selected.occurredAt],
                        ["Severity", selected.severity],
                        ["IP", selected.ipAddress ?? "—"],
                      ].map(([label, value]) => (
                        <div key={label} className="flex justify-between gap-3">
                          <dt className="text-slate-500">{label}</dt>
                          <dd className="font-semibold capitalize text-slate-800 dark:text-slate-200">{value}</dd>
                        </div>
                      ))}
                    </dl>
                    <p className="text-xs text-slate-500">
                      Immutable audit entries — retention follows your compliance settings in System setup.
                    </p>
                  </div>
                ) : (
                  <div className="flex h-full min-h-[240px] flex-col items-center justify-center text-center">
                    <Activity className="h-9 w-9 text-slate-300" />
                    <p className="mt-3 text-sm font-semibold text-slate-700">Select an event</p>
                    <p className="mt-1 max-w-xs text-xs text-slate-500">
                      Click any timeline row to inspect actor, module, and metadata.
                    </p>
                  </div>
                )}
              </aside>
            </div>
          </CrmPanel>
        </div>
      </CrmShell>
    </div>
  );
}
