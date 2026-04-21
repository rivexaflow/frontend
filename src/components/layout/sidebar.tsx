"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/classnames";

const routesByRole: Record<Role, { href: string; label: string }[]> = {
  SUPER_ADMIN: [
    { href: "/super-admin", label: "Overview" },
    { href: "/super-admin/tenants", label: "Tenants" },
    { href: "/super-admin/audit", label: "Audit Logs" }
  ],
  ADMIN: [
    { href: "/dashboard", label: "Organization Dashboard" },
    { href: "/dashboard/crm", label: "CRM" },
    { href: "/dashboard/team", label: "Team" },
    { href: "/dashboard/kyc", label: "KYC" },
    { href: "/dashboard/invoices", label: "Invoices" },
    { href: "/dashboard/ai-services", label: "AI Services" },
    { href: "/dashboard/settings", label: "Settings" }
  ],
  USER: [
    { href: "/agent", label: "User Dashboard" },
    { href: "/agent/contacts", label: "Assigned Contacts" },
    { href: "/agent/kyc", label: "My KYC Uploads" },
    { href: "/agent/ai-tools", label: "My AI Tools" }
  ]
};

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  return (
    <aside className="w-64 border-r border-[var(--rvx-midnight)]/10 bg-[var(--rvx-white)] p-4">
      <p className="mb-6 text-lg font-semibold text-[var(--rvx-azure)]">Rivexaflow</p>
      <div className="space-y-2">
        {routesByRole[role].map((route) => {
          const isActive = pathname === route.href || pathname.startsWith(`${route.href}/`);
          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "block rounded-md px-3 py-2 text-sm",
                isActive
                  ? "bg-[var(--rvx-royal)] text-[var(--rvx-white)]"
                  : "text-[var(--rvx-midnight)] hover:bg-[var(--rvx-lavender)]"
              )}
            >
              {route.label}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
