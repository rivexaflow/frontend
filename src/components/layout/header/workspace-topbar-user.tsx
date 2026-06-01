"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, Settings } from "lucide-react";

import { authStore } from "@/stores/auth.store";
import { cn } from "@/lib/utils/cn";

export function WorkspaceTopbarUser() {
  const router = useRouter();
  const user = authStore((s) => s.user);
  const [open, setOpen] = useState(false);
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

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-white py-1 pl-1 pr-2.5 shadow-sm transition hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-bold text-white">
          {initial}
        </span>
        <span className="hidden max-w-[120px] truncate text-left text-sm font-semibold text-slate-800 dark:text-slate-200 sm:block">
          {displayName.split(" ")[0]}
        </span>
        <ChevronDown className={cn("h-4 w-4 text-slate-400 transition", open && "rotate-180")} />
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
              router.push("/logout?next=/login");
            }}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}
