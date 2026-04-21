"use client";

import { Bell } from "lucide-react";
import { authStore } from "@/stores/auth-store";
import { uiStore } from "@/stores/ui-store";

export function Header() {
  const user = authStore((s) => s.user);
  const notifications = uiStore((s) => s.notifications);

  return (
    <header className="flex h-16 items-center justify-between border-b border-[var(--rvx-midnight)]/10 bg-[var(--rvx-white)] px-6">
      <div>
        <p className="text-sm text-[var(--rvx-midnight)]/60">Welcome back</p>
        <p className="font-medium text-[var(--rvx-midnight)]">{user?.name ?? "User"}</p>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative rounded-md border border-[var(--rvx-midnight)]/20 p-2 text-[var(--rvx-midnight)]">
          <Bell className="h-4 w-4" />
          {notifications.length > 0 && (
            <span className="absolute -right-1 -top-1 h-4 min-w-4 rounded-full bg-indigo-500 px-1 text-center text-[10px] leading-4">
              {notifications.length}
            </span>
          )}
        </button>
        <div className="rounded-md bg-[var(--rvx-lavender)] px-3 py-1 text-sm text-[var(--rvx-midnight)]">{user?.email}</div>
      </div>
    </header>
  );
}
