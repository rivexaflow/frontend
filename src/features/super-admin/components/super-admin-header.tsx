"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, ChevronRight, Menu, Shield } from "lucide-react";

import { authStore } from "@/stores/auth.store";

function HeaderAvatar({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-[#191970] to-[#4338ca] text-[11px] font-bold text-white ring-2 ring-white">
      {initials || "OP"}
    </span>
  );
}

export function SuperAdminHeader({
  title,
  onMenuClick,
}: {
  title: string;
  onMenuClick?: () => void;
}) {
  const router = useRouter();
  const user = authStore((s) => s.user);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/90 bg-white/90 shadow-[0_1px_0_rgba(15,23,42,0.04)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          {onMenuClick ? (
            <button
              type="button"
              onClick={onMenuClick}
              className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm md:hidden"
              aria-label="Open navigation"
            >
              <Menu className="h-4 w-4" />
            </button>
          ) : null}
          <div className="min-w-0">
            <nav className="mb-1 flex items-center gap-1 text-[11px] font-medium text-slate-400" aria-label="Breadcrumb">
              <Shield className="h-3 w-3 text-[#2277FF]" aria-hidden />
              <span>Platform</span>
              <ChevronRight className="h-3 w-3" aria-hidden />
              <span className="text-slate-600">{title}</span>
            </nav>
            <h1 className="truncate text-xl font-semibold tracking-tight text-[#191970] sm:text-[1.35rem]">
              {title}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            className="relative rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 shadow-sm transition hover:border-slate-300 hover:text-slate-800"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#2277FF]" />
          </button>

          <div className="hidden items-center gap-2.5 rounded-xl border border-slate-200/90 bg-white py-1.5 pl-1.5 pr-3 shadow-sm sm:flex">
            <HeaderAvatar name={user?.name ?? "Operator"} />
            <div className="text-left leading-tight">
              <p className="max-w-[140px] truncate text-sm font-semibold text-[#191970]">{user?.name ?? "Operator"}</p>
              <p className="max-w-[140px] truncate text-[11px] text-slate-500">{user?.email}</p>
            </div>
          </div>

          <span className="hidden rounded-full bg-[#191970] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white sm:inline-flex">
            Super Admin
          </span>

          <button
            type="button"
            onClick={() => router.push("/logout?next=/admin/login")}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Sign out
          </button>

          <Link
            href="/"
            className="rounded-xl px-2 py-2 text-xs font-medium text-[#2277FF] hover:bg-[#2277FF]/5 md:hidden"
          >
            Site
          </Link>
        </div>
      </div>
    </header>
  );
}
