"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Bell, Filter, Plus, Search, Settings2, Loader2 } from "lucide-react";

import { Breadcrumbs } from "@/components/layout/breadcrumbs/breadcrumbs";
import { WorkspaceAdvancedFiltersModal } from "@/components/layout/header/workspace-advanced-filters-modal";
import { WorkspaceCreateWorkspaceModal } from "@/components/layout/header/workspace-create-workspace-modal";
import { WorkspaceSearchableFieldsModal } from "@/components/layout/header/workspace-searchable-fields-modal";
import { WorkspaceTopbarUser } from "@/components/layout/header/workspace-topbar-user";
import { WorkspaceSwitcher } from "@/components/layout/workspace-switcher/workspace-switcher";
import { resolveWorkspaceBreadcrumbs } from "@/lib/workspace/page-meta";
import { workspacePaths } from "@/lib/workspace/paths";
import { workspaceTopbarStore } from "@/stores/workspace-topbar.store";
import { uiStore } from "@/stores/ui.store";
import { cn } from "@/lib/utils/cn";
import { apiClient } from "@/lib/api/client";
import { useHrCompanyId } from "@/features/workspace/hooks/use-hr-company-id";

const iconBtn =
  "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200/90 bg-white text-slate-500 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-[#191970] dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800";

export function WorkspaceHeader() {
  const pathname = usePathname();
  const breadcrumbs = resolveWorkspaceBreadcrumbs(pathname);
  const notifications = uiStore((s) => s.notifications);
  const unread = notifications.length;
  const searchRef = useRef<HTMLInputElement>(null);

  const quickSearch = workspaceTopbarStore((s) => s.quickSearch);
  const setQuickSearch = workspaceTopbarStore((s) => s.setQuickSearch);
  const advancedFiltersActive = workspaceTopbarStore((s) => s.advancedFiltersActive);

  const [fieldsOpen, setFieldsOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const companyId = useHrCompanyId();
  const [clockStatus, setClockStatus] = useState<{
    isClockedIn: boolean;
    isClockedOut: boolean;
    checkIn: string | null;
    checkOut: string | null;
    hoursWorked?: number | null;
  } | null>(null);
  const [loadingClock, setLoadingClock] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  const getLiveHoursWorked = () => {
    if (!clockStatus) return null;
    if (clockStatus.isClockedIn && !clockStatus.isClockedOut && clockStatus.checkIn) {
      const checkInTime = new Date(clockStatus.checkIn).getTime();
      const now = new Date().getTime();
      const diffMs = Math.max(0, now - checkInTime);
      return diffMs / (1000 * 60 * 60);
    }
    return clockStatus.hoursWorked ?? null;
  };

  const formatHours = (hours: number | null) => {
    if (hours === null) return "";
    const totalMinutes = Math.floor(hours * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h}h ${m}m`;
  };

  // Live running clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("en-US", { hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch status of clock in/out
  useEffect(() => {
    if (!companyId) {
      setClockStatus(null);
      return;
    }
    const getStatus = async () => {
      try {
        const res = await apiClient.get(`/hr/${companyId}/attendance/today-status`);
        if (res.data?.success) {
          setClockStatus(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch today clock status", err);
      }
    };
    void getStatus();
  }, [companyId]);

  const handleClockAction = async () => {
    if (!companyId || !clockStatus || loadingClock) return;
    setLoadingClock(true);
    try {
      const action = clockStatus.isClockedIn ? "clock-out" : "clock-in";
      const res = await apiClient.post(`/hr/${companyId}/attendance/${action}`, {});
      if (res.data?.success) {
        const statusRes = await apiClient.get(`/hr/${companyId}/attendance/today-status`);
        if (statusRes.data?.success) {
          setClockStatus(statusRes.data.data);
          window.location.reload();
        }
      }
    } catch (err) {
      console.error("Clock action failed", err);
    } finally {
      setLoadingClock(false);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <WorkspaceSearchableFieldsModal open={fieldsOpen} onClose={() => setFieldsOpen(false)} />
      <WorkspaceAdvancedFiltersModal open={filtersOpen} onClose={() => setFiltersOpen(false)} />
      <WorkspaceCreateWorkspaceModal open={createOpen} onClose={() => setCreateOpen(false)} />

      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/95">
        <div className="flex flex-col gap-2 px-3 py-2.5 md:px-5 lg:flex-row lg:items-center lg:gap-3 lg:py-2">
          <div className="flex min-w-0 items-center justify-between gap-2 lg:hidden">
            <Breadcrumbs items={breadcrumbs} />
            <WorkspaceTopbarUser compact />
          </div>

          <div className="hidden min-w-0 shrink-0 lg:block lg:max-w-[200px]">
            <Breadcrumbs items={breadcrumbs} />
          </div>

          <div className="relative flex min-w-0 flex-1 items-center">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              ref={searchRef}
              type="search"
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              placeholder="Quick search…"
              className="h-10 w-full rounded-xl border border-slate-200/90 bg-slate-50/80 pl-10 pr-14 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#2277FF] focus:bg-white focus:ring-2 focus:ring-[#2277FF]/15 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100"
            />
            <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 sm:inline-block">
              ⌘K
            </kbd>
          </div>

          <div className="flex shrink-0 items-center justify-end gap-2 lg:ml-auto">
            <button
              type="button"
              onClick={() => setFieldsOpen(true)}
              aria-label="Searchable fields"
              className={iconBtn}
            >
              <Settings2 className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              aria-label="Advanced filters"
              className={cn(iconBtn, advancedFiltersActive && "border-[#191970]/30 bg-[#191970]/5 text-[#191970]")}
            >
              <Filter className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="hidden h-9 items-center gap-1.5 rounded-xl border border-[#191970]/25 bg-white px-3 text-xs font-semibold text-[#191970] shadow-sm transition hover:border-[#191970]/40 hover:bg-[#191970]/5 sm:inline-flex"
            >
              <Plus className="h-3.5 w-3.5" />
              Create workspace
            </button>

            <div className="hidden sm:block">
              <WorkspaceSwitcher onAddWorkspace={() => setCreateOpen(true)} />
            </div>

            {/* CLOCK IN/OUT PORTAL */}
            {companyId && clockStatus && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-mono text-sm font-semibold">
                  <span className="relative flex h-2 w-2">
                    <span className={cn(
                      "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                      clockStatus.isClockedIn && !clockStatus.isClockedOut ? "bg-emerald-400" : "bg-slate-400"
                    )}></span>
                    <span className={cn(
                      "relative inline-flex rounded-full h-2 w-2",
                      clockStatus.isClockedIn && !clockStatus.isClockedOut ? "bg-emerald-500" : "bg-slate-500"
                    )}></span>
                  </span>
                  {currentTime}
                  {clockStatus.isClockedIn && (
                    <span className="text-xs text-slate-500 font-medium ml-1">
                      ({formatHours(getLiveHoursWorked())})
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  disabled={clockStatus.isClockedIn && clockStatus.isClockedOut || loadingClock}
                  onClick={handleClockAction}
                  className={cn(
                    "inline-flex h-9 items-center gap-1.5 rounded-xl px-4 text-xs font-bold transition-all shadow-sm active:scale-95 border",
                    loadingClock && "opacity-80 cursor-not-allowed",
                    !clockStatus.isClockedIn 
                      ? "bg-emerald-600 border-emerald-600 hover:bg-emerald-500 text-white" 
                      : clockStatus.isClockedOut 
                        ? "bg-slate-100 border-slate-200 text-slate-400 dark:bg-slate-900 dark:border-slate-800 cursor-not-allowed" 
                        : "bg-rose-600 border-rose-600 hover:bg-rose-500 text-white"
                  )}
                >
                  {loadingClock ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : !clockStatus.isClockedIn ? (
                    "Clock In"
                  ) : clockStatus.isClockedOut ? (
                    "Clocked Out"
                  ) : (
                    "Clock Out"
                  )}
                </button>
              </div>
            )}

            <Link
              href={workspacePaths.notifications}
              className={cn(iconBtn, "relative")}
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unread > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#2277FF] px-1 text-[10px] font-bold text-white ring-2 ring-white">
                  {unread > 9 ? "9+" : unread}
                </span>
              ) : (
                <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#2277FF] ring-2 ring-white" />
              )}
            </Link>

            <div className="hidden lg:block">
              <WorkspaceTopbarUser />
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
