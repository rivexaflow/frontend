"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Bell, Loader2, LogIn, LogOut } from "lucide-react";

import { WorkspaceAdvancedFiltersModal } from "@/components/layout/header/workspace-advanced-filters-modal";
import { WorkspaceCreateWorkspaceModal } from "@/components/layout/header/workspace-create-workspace-modal";
import { WorkspaceGlobalSearch } from "@/components/layout/header/workspace-global-search";
import { WorkspaceSearchableFieldsModal } from "@/components/layout/header/workspace-searchable-fields-modal";
import { WorkspaceTopbarUser } from "@/components/layout/header/workspace-topbar-user";
import { WorkspaceSwitcher } from "@/components/layout/workspace-switcher/workspace-switcher";
import { useAttendanceClock } from "@/features/workspace/hooks/use-attendance-clock";
import { resolveWorkspacePageTitle } from "@/lib/workspace/page-meta";
import { workspacePaths } from "@/lib/workspace/paths";
import { authStore } from "@/stores/auth.store";
import { workspaceTopbarStore } from "@/stores/workspace-topbar.store";
import { uiStore } from "@/stores/ui.store";
import { cn } from "@/lib/utils/cn";

export function WorkspaceHeader() {
  const pathname = usePathname();
  const pageTitle = resolveWorkspacePageTitle(pathname);
  const user = authStore((s) => s.user);
  const firstName = user?.fullName?.split(" ")[0] || user?.name?.split(" ")[0] || "there";

  const notifications = uiStore((s) => s.notifications);
  const unread = notifications.length;
  const advancedFiltersActive = workspaceTopbarStore((s) => s.advancedFiltersActive);

  const [fieldsOpen, setFieldsOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const { companyId, clockStatus, loadingClock, handleClockAction } = useAttendanceClock();

  const searchBar = (
    <WorkspaceGlobalSearch
      className="w-full min-w-0 md:w-56 lg:w-64 xl:w-72"
      onOpenSearchableFields={() => setFieldsOpen(true)}
      onOpenAdvancedFilters={() => setFiltersOpen(true)}
      advancedFiltersActive={advancedFiltersActive}
    />
  );

  return (
    <>
      <WorkspaceSearchableFieldsModal open={fieldsOpen} onClose={() => setFieldsOpen(false)} />
      <WorkspaceAdvancedFiltersModal open={filtersOpen} onClose={() => setFiltersOpen(false)} />
      <WorkspaceCreateWorkspaceModal open={createOpen} onClose={() => setCreateOpen(false)} />

      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/95">
        <div className="flex items-center gap-3 px-4 py-2 md:gap-4 md:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span
              className="hidden h-10 w-1 shrink-0 rounded-full bg-gradient-to-b from-[#191970] to-[#2277FF] shadow-sm sm:block"
              aria-hidden
            />
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#2277FF]">Panel</p>
              <h1 className="truncate text-lg font-bold leading-tight tracking-tight text-slate-900 dark:text-white md:text-xl">
                {pageTitle}
              </h1>
              <p className="hidden truncate text-[11px] text-slate-500 sm:block">
                Welcome back, <span className="font-semibold text-slate-700 dark:text-slate-300">{firstName}</span>
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden md:block">{searchBar}</div>

            <div className="hidden sm:block">
              <WorkspaceSwitcher />
            </div>

            {companyId && clockStatus ? (
              <button
                type="button"
                disabled={(clockStatus.isClockedIn && clockStatus.isClockedOut) || loadingClock}
                onClick={() => void handleClockAction()}
                className={cn(
                  "inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-[11px] font-bold shadow-sm transition active:scale-[0.98]",
                  loadingClock && "cursor-not-allowed opacity-80",
                  !clockStatus.isClockedIn
                    ? "bg-emerald-600 text-white hover:bg-emerald-500"
                    : clockStatus.isClockedOut
                      ? "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400 dark:border-slate-800 dark:bg-slate-900"
                      : "bg-rose-600 text-white hover:bg-rose-500",
                )}
              >
                {loadingClock ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : !clockStatus.isClockedIn ? (
                  <LogIn className="h-3 w-3" />
                ) : (
                  <LogOut className="h-3 w-3" />
                )}
                <span className="hidden lg:inline">
                  {!clockStatus.isClockedIn
                    ? "Clock In"
                    : clockStatus.isClockedOut
                      ? "Clocked Out"
                      : "Clock Out"}
                </span>
              </button>
            ) : null}

            <Link
              href={workspacePaths.notifications}
              className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200/90 bg-white text-slate-500 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-[#191970] dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
              aria-label="Notifications"
            >
              <Bell className="h-3.5 w-3.5" />
              {unread > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[#2277FF] px-0.5 text-[9px] font-bold text-white ring-2 ring-white">
                  {unread > 9 ? "9+" : unread}
                </span>
              ) : null}
            </Link>

            <WorkspaceTopbarUser onCreateWorkspace={() => setCreateOpen(true)} />
          </div>
        </div>

        <div className="border-t border-slate-100 px-4 py-2 md:hidden dark:border-slate-800">{searchBar}</div>
      </header>
    </>
  );
}
