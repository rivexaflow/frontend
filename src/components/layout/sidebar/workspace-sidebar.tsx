"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { authStore } from "@/stores/auth.store";
import { cn } from "@/lib/utils/cn";

type NavItem = { href: string; label: string };

const adminNav = (slug: string): NavItem[] => [
  { href: `/${slug}/dashboard`, label: "Dashboard" },
  { href: `/${slug}/crm`, label: "CRM" },
  { href: `/${slug}/crm/contacts`, label: "Contacts" },
  { href: `/${slug}/crm/leads`, label: "Leads" },
  { href: `/${slug}/crm/pipelines`, label: "Pipelines" },
  { href: `/${slug}/team`, label: "Team" },
  { href: `/${slug}/kyc`, label: "KYC" },
  { href: `/${slug}/invoices`, label: "Invoices" },
  { href: `/${slug}/ai`, label: "AI" },
  { href: `/${slug}/reports`, label: "Reports" },
  { href: `/${slug}/notifications`, label: "Notifications" },
  { href: `/${slug}/settings`, label: "Settings" }
];

const userNav = (slug: string): NavItem[] => [
  { href: `/${slug}/dashboard`, label: "Dashboard" },
  { href: `/${slug}/crm/contacts`, label: "My contacts" },
  { href: `/${slug}/kyc/submissions`, label: "My KYC" },
  { href: `/${slug}/ai/tools`, label: "AI tools" },
  { href: `/${slug}/notifications`, label: "Notifications" }
];

export function WorkspaceSidebar({ slug }: { slug: string }) {
  const pathname = usePathname();
  const role = authStore((s) => s.role);
  const items = role === "USER" ? userNav(slug) : adminNav(slug);

  return (
    <aside className="w-64 shrink-0 border-r border-[var(--rvx-midnight)]/10 bg-[var(--rvx-white)] p-4">
      <div className="mb-6">
        <p className="text-lg font-bold text-[var(--rvx-azure)]">Rivexaflow</p>
        <p className="text-xs text-[var(--rvx-midnight)]/60">{slug}</p>
      </div>
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
