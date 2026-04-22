"use client";

import { Bell } from "lucide-react";
import { authStore } from "@/stores/auth.store";
import { uiStore } from "@/stores/ui.store";
import { Breadcrumbs } from "@/components/layout/breadcrumbs/breadcrumbs";
import { UserMenu } from "@/components/layout/user-menu/user-menu";
import { WorkspaceSwitcher } from "@/components/layout/workspace-switcher/workspace-switcher";

type Props = {
  slug: string;
  title: string;
};

export function WorkspaceHeader({ slug, title }: Props) {
  const user = authStore((s) => s.user);
  const notifications = uiStore((s) => s.notifications);

  return (
    <header className="border-b border-[var(--rvx-midnight)]/10 bg-[var(--rvx-white)] px-6 py-4">
      <Breadcrumbs
        items={[
          { label: "Workspace", href: `/${slug}` },
          { label: title }
        ]}
      />
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-[var(--rvx-midnight)]/50">Signed in</p>
          <p className="text-lg font-semibold text-[var(--rvx-midnight)]">{user?.name ?? "User"}</p>
          <p className="text-xs text-[var(--rvx-midnight)]/60">{user?.email}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <WorkspaceSwitcher />
          <button type="button" className="relative rounded-md border border-[var(--rvx-midnight)]/20 p-2 text-[var(--rvx-midnight)]">
            <Bell className="h-4 w-4" />
            {notifications.length > 0 ? (
              <span className="absolute -right-1 -top-1 min-h-4 min-w-4 rounded-full bg-[var(--rvx-royal)] px-1 text-center text-[10px] leading-4 text-[var(--rvx-white)]">
                {notifications.length}
              </span>
            ) : null}
          </button>
          <div className="rounded-md bg-[var(--rvx-lavender)] px-3 py-1 text-xs font-medium text-[var(--rvx-midnight)]">{user?.role}</div>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
