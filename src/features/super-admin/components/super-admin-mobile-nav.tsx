"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  Cpu,
  GitBranch,
  LayoutDashboard,
  Users,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";

const items = [
  { href: "/super-admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/super-admin/users", label: "Users", icon: Users },
  { href: "/super-admin/companies", label: "Companies", icon: Building2 },
  { href: "/super-admin/ai-models", label: "AI models", icon: Cpu },
  { href: "/super-admin/workflows", label: "Workflows", icon: GitBranch },
];

export function SuperAdminMobileNav({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-[#0a0e2c]/45 backdrop-blur-sm"
        aria-label="Close menu"
        onClick={onClose}
      />
      <aside className="absolute left-0 top-0 flex h-full w-[min(100%,19rem)] flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <p className="text-sm font-bold text-[#191970]">Navigation</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {items.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium",
                  active
                    ? "bg-gradient-to-r from-[#2277FF] to-[#3b82f6] text-white shadow-md"
                    : "text-slate-600 hover:bg-slate-50",
                )}
              >
                <Icon className="h-[18px] w-[18px]" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </div>
  );
}
