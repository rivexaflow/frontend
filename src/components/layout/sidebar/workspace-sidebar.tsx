"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { authStore } from "@/stores/auth.store";
import { workspaceStore } from "@/stores/workspace.store";
import { effectiveNavRole } from "@/types/auth";
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
  { href: `/${slug}/migration`, label: "Data Migration" },
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
  const user = authStore((s) => s.user);
  const modules = workspaceStore((s) => s.modules);
  const logo = workspaceStore((s) => s.logo);
  const brandName = workspaceStore((s) => s.brandName);
  const workspaceName = workspaceStore((s) => s.workspaceName);
  const themeConfig = workspaceStore((s) => s.themeConfig);
  const primaryColor = themeConfig?.primaryColor || "#191970";
  const navRole = effectiveNavRole(user);

  const rawItems = navRole === "USER" ? userNav(slug) : adminNav(slug);

  const items = modules === null
    ? rawItems
    : rawItems.filter((item) => {
        const href = item.href;
        if (href.includes("/crm")) return modules.includes("crm");
        if (href.includes("/team")) return modules.includes("team");
        if (href.includes("/kyc")) return modules.includes("kyc");
        if (href.includes("/invoices")) return modules.includes("invoices");
        if (href.includes("/ai")) return modules.includes("ai");
        if (href.includes("/reports")) return modules.includes("reports");
        return true;
      });

  return (
    <aside className="w-64 shrink-0 border-r border-[var(--rvx-midnight)]/10 bg-[var(--rvx-white)] p-4">
      <div className="mb-6 flex items-center gap-3">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} alt={brandName || workspaceName || "Logo"} className="h-9 w-9 object-contain rounded-lg" />
        ) : (
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white font-black text-sm"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}, #2277ff)`,
            }}
          >
            {(brandName || workspaceName || "R")[0].toUpperCase()}
          </div>
        )}
        <div>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {brandName || workspaceName || "Rivexaflow"}
          </p>
          <p className="text-xs text-slate-400">{slug}</p>
        </div>
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
