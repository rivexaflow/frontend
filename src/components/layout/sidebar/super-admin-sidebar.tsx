"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  Cpu,
  GitBranch,
  LayoutDashboard,
  Shield,
  Users,
} from "lucide-react";

import { authStore } from "@/stores/auth.store";
import { cn } from "@/lib/utils";

const items = [
  { href: "/super-admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/super-admin/users", label: "Users", icon: Users },
  { href: "/super-admin/companies", label: "Companies", icon: Building2 },
  { href: "/super-admin/ai-models", label: "AI models", icon: Cpu },
  { href: "/super-admin/workflows", label: "Workflows", icon: GitBranch },
];

export function SuperAdminSidebar() {
  const pathname = usePathname();
  const user = authStore((s) => s.user);

  return (
    <aside className="sticky top-0 h-screen z-10 hidden w-[17.5rem] shrink-0 flex-col border-r border-slate-200/90 bg-white/95 shadow-[4px_0_24px_-12px_rgba(15,23,42,0.06)] backdrop-blur-sm md:flex lg:w-72">
      <div className="border-b border-slate-100 px-5 py-5">
        <Link href="/super-admin" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#191970] via-[#2277FF] to-[#6366f1] text-sm font-bold text-white shadow-md">
            R
          </span>
          <div>
            <p className="text-[15px] font-bold tracking-tight text-[#191970]">Rivexaflow</p>
            <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#2277FF]">
              <Shield className="h-3 w-3" />
              Super Admin
            </p>
          </div>
        </Link>
      </div>

      <p className="px-5 pb-2 pt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
        Platform
      </p>
      <nav className="flex-1 space-y-0.5 px-3 overflow-y-auto scrollbar-none">
        {items.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition-all",
                active
                  ? "bg-gradient-to-r from-[#2277FF] to-[#3b82f6] text-white shadow-[0_4px_14px_-4px_rgba(34,119,255,0.55)]"
                  : "text-slate-600 hover:bg-slate-50 hover:text-[#191970]",
              )}
            >
              {active ? (
                <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-white/40" />
              ) : null}
              <Icon
                className={cn("h-[18px] w-[18px] shrink-0", active ? "text-white" : "text-slate-400 group-hover:text-[#2277FF]")}
                strokeWidth={active ? 2.25 : 2}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-100 p-4">
        <div className="rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-3.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Signed in as</p>
          <p className="mt-1 truncate text-sm font-semibold text-[#191970]">{user?.name ?? "Operator"}</p>
          <p className="truncate text-xs text-slate-500">{user?.email}</p>
        </div>
        <p className="mt-3 text-[10px] leading-relaxed text-slate-400">
          Full platform control — users, companies, AI models, workflows.
        </p>
      </div>
    </aside>
  );
}
