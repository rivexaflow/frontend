"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, HelpCircle, Search } from "lucide-react";

import { Breadcrumbs } from "@/components/layout/breadcrumbs/breadcrumbs";
import {
  useWorkspaceCommandPalette,
  WorkspaceCommandPalette,
} from "@/components/layout/header/workspace-command-palette";
import { WorkspaceTopbarUser } from "@/components/layout/header/workspace-topbar-user";
import { WorkspaceSwitcher } from "@/components/layout/workspace-switcher/workspace-switcher";
import { resolveWorkspaceBreadcrumbs } from "@/lib/workspace/page-meta";
import { workspacePaths } from "@/lib/workspace/paths";
import { uiStore } from "@/stores/ui.store";

export function WorkspaceHeader() {
  const pathname = usePathname();
  const breadcrumbs = resolveWorkspaceBreadcrumbs(pathname);
  const notifications = uiStore((s) => s.notifications);
  const unread = notifications.length;
  const palette = useWorkspaceCommandPalette();

  return (
    <>
      <WorkspaceCommandPalette open={palette.open} onClose={palette.close} />
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90">
      <div className="flex h-14 items-center justify-between gap-4 px-4 md:px-6">
        <div className="min-w-0 flex-1">
          <Breadcrumbs items={breadcrumbs} />
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => palette.setOpen(true)}
            className="hidden h-9 items-center gap-2 rounded-lg border border-slate-200/80 px-2.5 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800 dark:border-slate-700 dark:hover:bg-slate-800 sm:inline-flex"
            aria-label="Search workspace"
          >
            <Search className="h-4 w-4" />
            <span className="hidden text-xs font-medium text-slate-400 lg:inline">⌘K</span>
          </button>

          <Link
            href={workspacePaths.notifications}
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200/80 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800 dark:border-slate-700 dark:hover:bg-slate-800"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unread > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">
                {unread > 9 ? "9+" : unread}
              </span>
            ) : null}
          </Link>

          <button
            type="button"
            className="hidden h-9 w-9 items-center justify-center rounded-lg border border-slate-200/80 text-slate-500 transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 lg:inline-flex"
            aria-label="Help"
          >
            <HelpCircle className="h-4 w-4" />
          </button>

          <div className="hidden md:block">
            <WorkspaceSwitcher />
          </div>

          <WorkspaceTopbarUser />
        </div>
      </div>
    </header>
    </>
  );
}
