"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

const items = [
  { href: "/super-admin", label: "Overview" },
  { href: "/super-admin/tenants", label: "Tenants" },
  { href: "/super-admin/audit", label: "Audit" },
  { href: "/super-admin/billing", label: "Billing" },
  { href: "/super-admin/system-health", label: "System health" },
  { href: "/super-admin/users", label: "Users" }
];

export function SuperAdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-64 shrink-0 border-r border-[var(--rvx-midnight)]/10 bg-[var(--rvx-white)] p-4">
      <p className="mb-6 text-lg font-bold text-[var(--rvx-azure)]">Rivexaflow</p>
      <nav className="space-y-1">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block rounded-md px-3 py-2 text-sm",
                active ? "bg-[var(--rvx-royal)] text-[var(--rvx-white)]" : "text-[var(--rvx-midnight)] hover:bg-[var(--rvx-lavender)]"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
