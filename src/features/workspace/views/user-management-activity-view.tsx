"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, Clock, LogIn, PenLine } from "lucide-react";

import { ActivityDetailPanel } from "@/features/workspace/components/user-management/activity-detail-panel";
import {
  ActivityDirectoryToolbar,
  type ActivityFilters,
} from "@/features/workspace/components/user-management/activity-directory-toolbar";
import { ActivityFeedList } from "@/features/workspace/components/user-management/activity-feed-list";
import {
  DEMO_WORKSPACE_ACTIVITY,
  type WorkspaceActivityRecord,
} from "@/features/workspace/data/workspace-activity-demo";

const EMPTY_FILTERS: ActivityFilters = {
  query: "",
  module: "all",
  type: "all",
};

export function UserManagementActivityView() {
  const [filters, setFilters] = useState<ActivityFilters>(EMPTY_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    return DEMO_WORKSPACE_ACTIVITY.filter((event) => {
      if (filters.module !== "all" && event.moduleKey !== filters.module) return false;
      if (filters.type !== "all" && event.type !== filters.type) return false;
      if (q) {
        const hay = `${event.userName} ${event.userEmail} ${event.action} ${event.summary} ${event.module} ${event.resource ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [filters]);

  const selected = selectedId ? filtered.find((e) => e.id === selectedId) ?? null : null;

  useEffect(() => {
    if (filtered.length === 0) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !filtered.some((e) => e.id === selectedId)) {
      setSelectedId(filtered[0]!.id);
    }
  }, [filtered, selectedId]);

  const todayCount = DEMO_WORKSPACE_ACTIVITY.filter((e) => e.whenGroup === "Today").length;
  const loginCount = DEMO_WORKSPACE_ACTIVITY.filter((e) => e.type === "login").length;
  const changeCount = DEMO_WORKSPACE_ACTIVITY.filter((e) =>
    ["update", "create", "delete", "approve", "role_change"].includes(e.type),
  ).length;

  return (
    <div className="pb-10">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Governance · User management</p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">User activity</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
              Audit trail of sign-ins, record changes, and actions across your workspace. Select an event to see full
              details.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { label: "Today", value: todayCount, icon: Activity },
              { label: "Sign-ins", value: loginCount, icon: LogIn },
              { label: "Changes", value: changeCount, icon: PenLine },
              { label: "Avg. session", value: "2h 14m", icon: Clock },
            ].map((stat) => (
              <div
                key={stat.label}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-white px-3 py-1.5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <stat.icon className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-xs text-slate-500">{stat.label}</span>
                <span className="text-sm font-bold tabular-nums text-slate-900 dark:text-white">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <ActivityDirectoryToolbar
          filters={filters}
          onChange={setFilters}
          resultCount={filtered.length}
        />

        <div className="grid min-h-[520px] lg:grid-cols-[minmax(300px,380px)_1fr]">
          <div className="border-b border-slate-200/90 lg:border-b-0 lg:border-r dark:border-slate-800">
            <ActivityFeedList
              events={filtered}
              selectedId={selectedId}
              onSelect={(event: WorkspaceActivityRecord) => setSelectedId(event.id)}
            />
          </div>

          <div className="min-h-[360px]">
            {selected ? (
              <ActivityDetailPanel key={selected.id} event={selected} />
            ) : (
              <div className="flex h-full min-h-[360px] flex-col items-center justify-center px-8 text-center">
                <Activity className="h-10 w-10 text-slate-300" />
                <p className="mt-4 text-sm font-semibold text-slate-800 dark:text-slate-200">Select an activity event</p>
                <p className="mt-1 max-w-sm text-sm text-slate-500">
                  Choose an event from the feed to review who performed it, what changed, and when it happened.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
