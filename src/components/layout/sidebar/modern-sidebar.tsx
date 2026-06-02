"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  Users, 
  Target, 
  Layers, 
  ShieldCheck, 
  FileText, 
  Sparkles, 
  Settings, 
  Bell, 
  LogOut,
  ChevronLeft,
  ChevronDown,
  Menu,
  Search,
  UserCog,
  Briefcase,
  Network,
  Zap,
  Building2,
  Ticket,
  Activity,
  History,
  CreditCard
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { HRM_NAV_ITEMS } from "@/features/workspace/data/hrm-nav";
import { workspacePaths } from "@/lib/workspace/paths";
import { authStore } from "@/stores/auth.store";
import { UserAccountDropdown } from "./user-account-dropdown";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  category: string;
}

interface NavGroup {
  name: string;
  icon: React.ElementType;
  category: string;
  children: { name: string; href: string }[];
}

const workspaceNavItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, category: "General" },
  { name: "Contacts", href: "/crm/contacts", icon: Users, category: "Operations" },
  { name: "Leads", href: "/crm/leads", icon: Target, category: "Operations" },
  { name: "Deals", href: workspacePaths.deals, icon: Briefcase, category: "Operations" },
  { name: "Pipelines", href: "/crm/pipelines", icon: Layers, category: "Operations" },
  { name: "KYC Center", href: "/kyc", icon: ShieldCheck, category: "Operations", badge: "Live" },
  { name: "Invoices", href: "/invoices", icon: FileText, category: "Operations" },
  { name: "AI Agents", href: "/ai", icon: Sparkles, category: "Intelligence" },
  { name: "Analytics", href: "/reports", icon: Zap, category: "Intelligence" },
];

const workspaceNavGroups: NavGroup[] = [
  {
    name: "HRM",
    icon: Network,
    category: "People",
    children: HRM_NAV_ITEMS.map((item) => ({ name: item.name, href: item.href })),
  },
  {
    name: "User Management",
    icon: UserCog,
    category: "Governance",
    children: [
      { name: "Users", href: workspacePaths.user },
      { name: "Roles & permissions", href: workspacePaths.role },
      { name: "User activity", href: workspacePaths.userActivity },
    ],
  },
];

function isNavGroupActive(pathname: string, children: { href: string }[]): boolean {
  return children.some(
    (child) => pathname === child.href || pathname.startsWith(`${child.href}/`),
  );
}

const workspaceNavFooter: NavItem[] = [
  { name: "Notifications", href: "/notifications", icon: Bell, category: "System" },
  { name: "Settings", href: "/settings", icon: Settings, category: "System" },
];

const adminNavItems: NavItem[] = [
  { name: "Overview", href: "/super-admin", icon: LayoutDashboard, category: "Platform" },
  { name: "Tenants", href: "/super-admin/tenants", icon: Building2, category: "Platform" },
  { name: "KYC Submissions", href: "/super-admin/kyc", icon: ShieldCheck, category: "Management" },
  { name: "Support Tickets", href: "/super-admin/support", icon: Ticket, category: "Management" },
  { name: "Users", href: "/super-admin/users", icon: Users, category: "Management" },
  { name: "Audit Logs", href: "/super-admin/audit", icon: History, category: "System" },
  { name: "Billing", href: "/super-admin/billing", icon: CreditCard, category: "System" },
  { name: "System Health", href: "/super-admin/system-health", icon: Activity, category: "System" },
];

export function ModernSidebar({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const user = authStore((s) => s.user);

  const items = isAdmin ? adminNavItems : workspaceNavItems;
  const groups = isAdmin ? [] : workspaceNavGroups;
  const footerItems = isAdmin ? [] : workspaceNavFooter;
  const CATEGORY_ORDER = ["General", "Operations", "People", "Governance", "Intelligence", "System"] as const;
  const categorySet = new Set([
    ...items.map((i) => i.category),
    ...groups.map((g) => g.category),
    ...footerItems.map((i) => i.category),
  ]);
  const categories = CATEGORY_ORDER.filter((c) => categorySet.has(c));
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    HRM: true,
    "User Management": true,
  });

  // Auto-collapse on small screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setIsCollapsed(true);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    for (const group of groups) {
      if (isNavGroupActive(pathname, group.children)) {
        setOpenGroups((prev) => ({ ...prev, [group.name]: true }));
      }
    }
  }, [pathname, groups]);

  const effectiveCollapsed = isCollapsed && !isHovered;

  const getHref = (baseHref: string) => baseHref;

  return (
    <>
      <motion.aside
        initial={false}
        animate={{ 
          width: effectiveCollapsed ? "80px" : "280px",
          transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "relative flex h-screen flex-col border-r border-slate-200/60 bg-white/80 backdrop-blur-xl transition-colors duration-300 z-30",
          "dark:border-slate-800/50 dark:bg-slate-950/90"
        )}
      >
        {/* Logo Section */}
        <div className="flex h-20 items-center px-6">
          <Link href={getHref("/dashboard")} className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg shadow-blue-500/30">
              <span className="text-xl font-black text-white">R</span>
            </div>
            <AnimatePresence mode="wait">
              {!effectiveCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="text-xl font-bold tracking-tight text-slate-900 dark:text-white"
                >
                  Rivexa<span className="text-blue-600">flow</span>
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-none">
          {categories.map((category) => {
            const categoryItems = items.filter((item) => item.category === category);
            const categoryGroups = groups.filter((group) => group.category === category);
            const categoryFooter = footerItems.filter((item) => item.category === category);

            if (
              categoryItems.length === 0 &&
              categoryGroups.length === 0 &&
              categoryFooter.length === 0
            ) {
              return null;
            }

            return (
              <div key={category} className="mb-8">
                {!effectiveCollapsed && (
                  <motion.h3
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mb-3 px-4 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500"
                  >
                    {category}
                  </motion.h3>
                )}
                <div className="space-y-1">
                  {categoryItems.map((item) => {
                    const href = getHref(item.href);
                    const isActive = pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
                    return (
                      <Link
                        key={item.name}
                        href={href}
                        className={cn(
                          "group relative flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200",
                          isActive 
                            ? "bg-blue-50/80 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" 
                            : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-white"
                        )}
                      >
                        <item.icon className={cn(
                          "h-5 w-5 shrink-0 transition-transform group-hover:scale-110",
                          isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"
                        )} />
                        
                        {!effectiveCollapsed && (
                          <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex-1 font-semibold"
                          >
                            {item.name}
                          </motion.span>
                        )}

                        {item.badge && !effectiveCollapsed && (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                            {item.badge}
                          </span>
                        )}

                        {isActive && (
                          <motion.div
                            layoutId="active-pill"
                            className="absolute left-0 h-6 w-1 rounded-r-full bg-blue-600"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          />
                        )}
                      </Link>
                    );
                  })}

                  {categoryGroups.map((group) => {
                      const groupActive = isNavGroupActive(pathname, group.children);
                      const isOpen = openGroups[group.name] ?? groupActive;

                      return (
                        <div key={group.name} className="space-y-0.5">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenGroups((prev) => ({
                                ...prev,
                                [group.name]: !isOpen,
                              }))
                            }
                            className={cn(
                              "group relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-all duration-200",
                              groupActive
                                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/25"
                                : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900/50",
                            )}
                          >
                            <group.icon
                              className={cn(
                                "h-5 w-5 shrink-0",
                                groupActive ? "text-white" : "text-slate-400",
                              )}
                            />
                            {!effectiveCollapsed ? (
                              <>
                                <span className="flex-1 text-sm font-semibold">{group.name}</span>
                                <ChevronDown
                                  className={cn(
                                    "h-4 w-4 shrink-0 transition-transform",
                                    isOpen ? "rotate-180" : "",
                                    groupActive ? "text-white/90" : "text-slate-400",
                                  )}
                                />
                              </>
                            ) : null}
                          </button>

                          <AnimatePresence initial={false}>
                            {isOpen && !effectiveCollapsed ? (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden pl-3"
                              >
                                {group.children.map((child) => {
                                  const childActive =
                                    pathname === child.href ||
                                    pathname.startsWith(`${child.href}/`);
                                  return (
                                    <Link
                                      key={child.href}
                                      href={child.href}
                                      className={cn(
                                        "relative flex items-center gap-2 rounded-lg py-2.5 pl-9 pr-3 text-sm font-medium transition",
                                        childActive
                                          ? "text-blue-600 dark:text-blue-400"
                                          : "text-slate-500 hover:text-slate-900 dark:hover:text-white",
                                      )}
                                    >
                                      {childActive ? (
                                        <span className="absolute left-4 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-blue-600" />
                                      ) : null}
                                      {child.name}
                                    </Link>
                                  );
                                })}
                              </motion.div>
                            ) : null}
                          </AnimatePresence>
                        </div>
                      );
                    })}

                  {categoryFooter.map((item) => {
                      const href = getHref(item.href);
                      const isActive =
                        pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
                      return (
                        <Link
                          key={item.name}
                          href={href}
                          className={cn(
                            "group relative flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200",
                            isActive
                              ? "bg-blue-50/80 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                              : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-white",
                          )}
                        >
                          <item.icon
                            className={cn(
                              "h-5 w-5 shrink-0",
                              isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400",
                            )}
                          />
                          {!effectiveCollapsed ? (
                            <span className="flex-1 font-semibold">{item.name}</span>
                          ) : null}
                        </Link>
                      );
                    })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200/60 p-4 dark:border-slate-800/50">
          <button
            type="button"
            onClick={() => setIsAccountOpen(!isAccountOpen)}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl border border-slate-200/80 px-3 py-2.5 text-left transition",
              isAccountOpen
                ? "border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/30"
                : "hover:bg-slate-50 dark:hover:bg-slate-900/50",
            )}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-bold text-white">
              {user?.fullName?.charAt(0) || user?.email?.charAt(0) || "U"}
            </div>
            {!effectiveCollapsed ? (
              <span className="flex-1 text-sm font-semibold text-slate-700 dark:text-slate-300">Account</span>
            ) : null}
          </button>
          {!effectiveCollapsed ? (
            <p className="mt-3 px-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Enterprise · v1.0.4
            </p>
          ) : null}
        </div>

        {/* Collapse Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-24 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400"
        >
          {isCollapsed ? <Menu className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </motion.aside>

      <UserAccountDropdown 
        isOpen={isAccountOpen} 
        onClose={() => setIsAccountOpen(false)} 
      />
    </>
  );
}
