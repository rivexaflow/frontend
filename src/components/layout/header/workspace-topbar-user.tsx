"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, Settings } from "lucide-react";

import { AdminModal } from "@/features/super-admin/components/admin-modal";
import { logoutUser } from "@/lib/api/auth";
import { clearSessionCookie } from "@/lib/auth/session";
import { authStore } from "@/stores/auth.store";
import { workspaceStore } from "@/stores/workspace.store";
import { cn } from "@/lib/utils/cn";

export function WorkspaceTopbarUser({ compact }: { compact?: boolean }) {
  const router = useRouter();
  const user = authStore((s) => s.user);
  const [open, setOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const displayName = user?.fullName || user?.name || "User";
  const initial = (displayName.charAt(0) || user?.email?.charAt(0) || "U").toUpperCase();

  useEffect(() => {
    const onPointerDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const finishLogout = () => {
    authStore.getState().logout();
    workspaceStore.getState().clearWorkspace();
    clearSessionCookie();
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("rvx-auth");
      window.localStorage.removeItem("rvx-workspace");
    }
    router.replace("/login");
  };

  const onConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutUser();
    } finally {
      finishLogout();
    }
  };

  return (
    <>
      <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white shadow-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900",
          compact ? "p-1" : "py-1 pl-1 pr-2.5",
        )}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#191970] to-[#2277FF] text-xs font-bold text-white ring-2 ring-white dark:ring-slate-900">
          {initial}
        </span>
        {!compact ? (
          <span className="hidden max-w-[120px] truncate text-left text-sm font-semibold text-slate-800 dark:text-slate-200 sm:block">
            {displayName.split(" ")[0]}
          </span>
        ) : null}
        {!compact ? (
          <ChevronDown className={cn("hidden h-4 w-4 text-slate-400 transition sm:block", open && "rotate-180")} />
        ) : null}
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200/80 bg-white py-1 shadow-xl dark:border-slate-700 dark:bg-slate-900"
        >
          <div className="border-b border-slate-100 px-3 py-2.5 dark:border-slate-800">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{displayName}</p>
            <p className="truncate text-xs text-slate-500">{user?.email}</p>
            {user?.role ? (
              <span className="mt-1.5 inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600 dark:bg-slate-800">
                {user.role}
              </span>
            ) : null}
          </div>
          <Link
            href="/settings"
            role="menuitem"
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
            onClick={() => setOpen(false)}
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
            onClick={() => {
              setOpen(false);
              setLogoutOpen(true);
            }}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      ) : null}
      </div>

      <AdminModal
        open={logoutOpen}
        title="Sign out?"
        description="Are you sure you want to log out of your workspace?"
        onClose={() => {
          if (!isLoggingOut) setLogoutOpen(false);
        }}
      >
        <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={isLoggingOut}
            onClick={() => setLogoutOpen(false)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isLoggingOut}
            onClick={() => void onConfirmLogout()}
            className="rounded-xl bg-[#191970] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#050a1f] disabled:opacity-60"
          >
            {isLoggingOut ? "Signing out…" : "Yes, sign out"}
          </button>
        </div>
      </AdminModal>
    </>
  );
}
