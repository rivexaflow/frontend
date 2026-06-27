"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  ChevronRight,
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
  CreditCard,
  Database,
  Waypoints,
  FileSpreadsheet,
  Key,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { CRM_NAV_CHILDREN, isCrmNavSubGroup } from "@/features/workspace/data/crm-nav";
import { isAttendanceNavChildActive } from "@/features/workspace/data/attendance-tabs";
import { HRM_NAV_CHILDREN, isHrmNavSubGroup } from "@/features/workspace/data/hrm-nav";
import { workspacePaths } from "@/lib/workspace/paths";
import { authStore } from "@/stores/auth.store";
import { workspaceStore } from "@/stores/workspace.store";
import { effectiveNavRole } from "@/types/auth";
import { UserAccountDropdown } from "./user-account-dropdown";
import { SidebarNavIcon, type SidebarIconTone } from "./sidebar-nav-icon";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  category: string;
  tone?: SidebarIconTone;
}

interface NavGroup {
  name: string;
  icon: React.ElementType;
  category: string;
  children: { name: string; href: string; icon: React.ElementType }[];
  isCrm?: boolean;
  isHrm?: boolean;
  tone?: SidebarIconTone;
}

const workspaceNavItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, category: "General" },
  { name: "KYC Center", href: "/kyc", icon: ShieldCheck, category: "Operations", badge: "Live" },
  { name: "Invoices", href: "/invoices", icon: FileText, category: "Operations" },
  { name: "Sheets", href: "/sheets", icon: FileSpreadsheet, category: "Operations" },
  { name: "AI Agents", href: "/ai", icon: Sparkles, category: "Intelligence" },
  { name: "Analytics", href: "/reports", icon: Zap, category: "Intelligence" },
];

const workspaceNavGroups: NavGroup[] = [
  {
    name: "CRM",
    icon: Target,
    category: "Operations",
    children: [],
    isCrm: true,
  },
  {
    name: "HRM",
    icon: Network,
    category: "People",
    children: [],
    isHrm: true,
  },
  {
    name: "User Management",
    icon: UserCog,
    category: "Governance",
    children: [
      { name: "Users", href: workspacePaths.user, icon: Users },
      { name: "Departments", href: workspacePaths.workforce, icon: Building2 },
      { name: "Roles & permissions", href: workspacePaths.role, icon: ShieldCheck },
      { name: "User activity", href: workspacePaths.userActivity, icon: History },
    ],
  },
];

function flattenCrmHrefs(): string[] {
  return CRM_NAV_CHILDREN.flatMap((item) =>
    isCrmNavSubGroup(item) ? item.children.map((c) => c.href) : [item.href],
  );
}

function isNavGroupActive(pathname: string, children: { href: string }[]): boolean {
  return children.some(
    (child) => pathname === child.href || pathname.startsWith(`${child.href}/`),
  );
}

function flattenHrmHrefs(): string[] {
  return HRM_NAV_CHILDREN.flatMap((item) =>
    isHrmNavSubGroup(item) ? item.children.map((c) => c.href) : [item.href],
  );
}

function isCrmNavActive(pathname: string): boolean {
  return flattenCrmHrefs().some(
    (href) => pathname === href || pathname.startsWith(`${href}/`),
  );
}

function isHrmNavActive(pathname: string): boolean {
  return flattenHrmHrefs().some(
    (href) => pathname === href || pathname.startsWith(`${href}/`),
  );
}

const TOP_GROUP_NAMES = ["CRM", "HRM", "User Management"] as const;

const CRM_SUBGROUP_NAMES = ["Report"] as const;
const HRM_SUBGROUP_NAMES = ["Attendance", "HR Settings"] as const;

const workspaceNavFooter: NavItem[] = [
  { name: "Notifications", href: "/notifications", icon: Bell, category: "System" },
  { name: "Settings", href: "/settings", icon: Settings, category: "System", tone: "slate" },
];

const adminNavItems: NavItem[] = [
  { name: "Overview", href: "/super-admin", icon: LayoutDashboard, category: "Platform" },
  { name: "Licenses & Clusters", href: "/super-admin/licenses", icon: Key, category: "Platform" },
  { name: "Tenants", href: "/super-admin/tenants", icon: Building2, category: "Platform" },
  { name: "KYC Submissions", href: "/super-admin/kyc", icon: ShieldCheck, category: "Management" },
  { name: "Support Tickets", href: "/super-admin/support", icon: Ticket, category: "Management" },
  { name: "Users", href: "/super-admin/users", icon: Users, category: "Management" },
  { name: "Audit Logs", href: "/super-admin/audit", icon: History, category: "System", tone: "slate" },
  { name: "Billing", href: "/super-admin/billing", icon: CreditCard, category: "System" },
  { name: "System Health", href: "/super-admin/system-health", icon: Activity, category: "System" },
];

export function ModernSidebar({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isHoverDisabled, setIsHoverDisabled] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const user = authStore((s) => s.user);
  const modules = workspaceStore((s) => s.modules);
  const logo = workspaceStore((s) => s.logo);
  const brandName = workspaceStore((s) => s.brandName);
  const workspaceName = workspaceStore((s) => s.workspaceName);
  const themeConfig = workspaceStore((s) => s.themeConfig);
  const primaryColor = themeConfig?.primaryColor || "#191970";
  
  const getGroupRedirectPath = (groupName: string): string | null => {
    if (groupName === "CRM") return workspacePaths.leads;
    if (groupName === "HRM") return workspacePaths.hrmDashboard;
    if (groupName === "User Management") return workspacePaths.user;
    return null;
  };

  const items = useMemo(() => {
    const rawItems = isAdmin
      ? adminNavItems
      : modules === null
      ? workspaceNavItems
      : workspaceNavItems.filter((item) => {
          if (item.href === "/kyc") return modules.includes("kyc");
          if (item.href === "/invoices") return modules.includes("invoices");
          if (item.href === "/ai") return modules.includes("ai");
          if (item.href === "/reports") return modules.includes("reports");
          return true;
        });

    if (!mounted) {
      return rawItems;
    }

    if (!isAdmin) {
      const currentUser = user;
      const navRole = effectiveNavRole(currentUser);
      const isOwnerOrAdmin =
        navRole === "ADMIN" ||
        navRole === "SUPER_ADMIN" ||
        currentUser?.profileRole === "owner" ||
        currentUser?.profileRole === "manager";
      if (isOwnerOrAdmin) {
        const dashboardIdx = rawItems.findIndex((i) => i.href === workspacePaths.dashboard);
        const graphItem: NavItem = {
          name: "Workspace graph",
          href: workspacePaths.workspaceGraph,
          icon: Waypoints,
          category: "General",
        };
        const withGraph =
          dashboardIdx >= 0
            ? [
                ...rawItems.slice(0, dashboardIdx + 1),
                graphItem,
                ...rawItems.slice(dashboardIdx + 1),
              ]
            : [graphItem, ...rawItems];
        return [
          ...withGraph,
          {
            name: "Data Merge",
            href: workspacePaths.migration,
            icon: Database,
            category: "Operations",
          } as NavItem,
        ];
      }
    }
    return rawItems;
  }, [isAdmin, modules, user, mounted]);

  const groups = useMemo(() => {
    if (isAdmin) return [];
    
    return modules === null
      ? workspaceNavGroups
      : workspaceNavGroups.filter((group) => {
          if (group.isCrm) return modules.includes("crm");
          if (group.isHrm) return modules.includes("team");
          return true;
        });
  }, [isAdmin, modules]);

  const footerItems = isAdmin ? [] : workspaceNavFooter;
  const CATEGORY_ORDER = ["General", "Operations", "People", "Governance", "Intelligence", "System"] as const;
  const categorySet = new Set([
    ...items.map((i) => i.category),
    ...groups.map((g) => g.category),
    ...footerItems.map((i) => i.category),
  ]);
  const categories = CATEGORY_ORDER.filter((c) => categorySet.has(c));
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [openCrmSubGroups, setOpenCrmSubGroups] = useState<Record<string, boolean>>({});
  const [openHrmSubGroups, setOpenHrmSubGroups] = useState<Record<string, boolean>>({});

  const closeAccountMenu = () => setIsAccountOpen(false);

  const toggleTopGroup = (groupName: string, isOpen: boolean) => {
    closeAccountMenu();
    setOpenGroups(() => {
      if (isOpen) {
        return Object.fromEntries(TOP_GROUP_NAMES.map((n) => [n, false]));
      }
      return Object.fromEntries(TOP_GROUP_NAMES.map((n) => [n, n === groupName]));
    });
  };

  const toggleCrmSubGroup = (name: string, isOpen: boolean) => {
    closeAccountMenu();
    setOpenCrmSubGroups(() => {
      if (isOpen) return { [name]: false };
      return Object.fromEntries(CRM_SUBGROUP_NAMES.map((n) => [n, n === name]));
    });
  };

  const toggleHrmSubGroup = (name: string, isOpen: boolean) => {
    closeAccountMenu();
    setOpenHrmSubGroups(() => {
      if (isOpen) return { [name]: false };
      return Object.fromEntries(HRM_SUBGROUP_NAMES.map((n) => [n, n === name]));
    });
  };

  const closeAllNavGroups = () => {
    setOpenGroups(Object.fromEntries(TOP_GROUP_NAMES.map((n) => [n, false])));
    setOpenCrmSubGroups({});
    setOpenHrmSubGroups({});
  };

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
    const nextGroups = Object.fromEntries(TOP_GROUP_NAMES.map((n) => [n, false]));
    for (const group of groups) {
      const active = group.isCrm
        ? isCrmNavActive(pathname)
        : group.isHrm
          ? isHrmNavActive(pathname)
          : isNavGroupActive(pathname, group.children);
      if (active) nextGroups[group.name] = true;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpenGroups(nextGroups);

    const nextCrmSubs = Object.fromEntries(CRM_SUBGROUP_NAMES.map((n) => [n, false]));
    if (pathname.includes("/crm/reports")) nextCrmSubs.Report = true;
    setOpenCrmSubGroups(nextCrmSubs);

    const nextHrmSubs = Object.fromEntries(HRM_SUBGROUP_NAMES.map((n) => [n, false]));
    if (pathname.includes("/hrm/attendance")) {
      nextHrmSubs.Attendance = true;
    }
    if (
      pathname.includes("/hrm/settings") ||
      pathname.includes("/hrm/admin") ||
      pathname.includes("/hrm/setup")
    ) {
      nextHrmSubs["HR Settings"] = true;
    }
    setOpenHrmSubGroups(nextHrmSubs);
  }, [pathname, groups]);

  const effectiveCollapsed = isCollapsed && !(isHovered && !isHoverDisabled);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (effectiveCollapsed) closeAllNavGroups();
  }, [effectiveCollapsed]);

  const handleToggleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextCollapsed = !isCollapsed;
    setIsCollapsed(nextCollapsed);
    if (nextCollapsed) {
      setIsHoverDisabled(true);
    } else {
      setIsHoverDisabled(false);
    }
  };

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
        onMouseLeave={() => {
          setIsHovered(false);
          setIsHoverDisabled(false);
        }}
        className={cn(
          "sticky top-0 shrink-0 flex h-screen flex-col border-r border-slate-200/60 bg-gradient-to-b from-white via-white to-slate-50/80 backdrop-blur-xl transition-colors duration-300 z-40",
          "dark:border-slate-800/50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900/90",
        )}
      >
        {/* Logo Section */}
        <div className="flex h-20 items-center px-6">
          <Link href={getHref("/dashboard")} className="flex items-center gap-3">
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logo}
                alt={brandName || workspaceName || "Logo"}
                className={cn(
                  "shrink-0 object-contain rounded-xl",
                  effectiveCollapsed ? "h-10 w-10" : "h-10 max-w-[200px]"
                )}
              />
            ) : (
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white font-black text-xl shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}, #2277ff)`,
                }}
              >
                {(brandName || workspaceName || "R")[0].toUpperCase()}
              </div>
            )}
            <AnimatePresence mode="wait">
              {!effectiveCollapsed && !logo && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="text-xl font-bold tracking-tight text-slate-900 dark:text-white"
                >
                  {brandName || workspaceName || "Rivexaflow"}
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
                  <div className="mb-3 flex items-center gap-2 px-2">
                    <span className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-700" />
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500"
                    >
                      {category}
                    </motion.span>
                    <span className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-700" />
                  </div>
                )}
                <div className="space-y-1">
                  {categoryItems.map((item) => {
                    const href = getHref(item.href);
                    const isActive = pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
                    return (
                      <Link
                        key={item.name}
                        href={href}
                        onClick={closeAccountMenu}
                        className={cn(
                          "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200",
                          effectiveCollapsed && "justify-center px-2",
                          isActive
                            ? "bg-[#191970]/8 text-[#191970] shadow-sm shadow-[#191970]/5 dark:bg-[#191970]/20 dark:text-[#2277ff]"
                            : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-white",
                        )}
                      >
                        <SidebarNavIcon
                          icon={item.icon}
                          active={isActive}
                          tone={item.tone ?? "brand"}
                        />
                        
                        {!effectiveCollapsed && (
                          <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex-1 font-semibold"
                          >
                            {item.href === "/sheets" ? `${(brandName || workspaceName || "Company").trim().split(/\s+/)[0]} Sheets` : item.name}
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
                            className="absolute left-0 h-6 w-1 rounded-r-full bg-[#191970]"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          />
                        )}
                      </Link>
                    );
                  })}

                  {categoryGroups.map((group) => {
                      const groupActive = group.isCrm
                        ? isCrmNavActive(pathname)
                        : group.isHrm
                          ? isHrmNavActive(pathname)
                          : isNavGroupActive(pathname, group.children);
                      const isOpen = openGroups[group.name] ?? groupActive;

                      return (
                        <div key={group.name} className="space-y-0.5">
                          <button
                            type="button"
                            aria-expanded={isOpen}
                            onClick={() => {
                              toggleTopGroup(group.name, isOpen);
                              const targetPath = getGroupRedirectPath(group.name);
                              if (targetPath) {
                                router.push(targetPath);
                              }
                            }}
                            className={cn(
                              "group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200",
                              effectiveCollapsed && "justify-center px-2",
                              groupActive
                                ? "bg-gradient-to-r from-[#191970] to-[#2277ff] text-white shadow-md shadow-[#191970]/20"
                                : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900/50",
                            )}
                          >
                            {groupActive ? (
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15 text-white ring-1 ring-white/20">
                                <group.icon className="h-4 w-4" strokeWidth={2.25} />
                              </span>
                            ) : (
                              <SidebarNavIcon icon={group.icon} tone={group.tone ?? "brand"} />
                            )}
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
                                transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                                className="overflow-hidden border-l-2 border-[#191970]/15 pl-2 ml-3 dark:border-[#2277FF]/20"
                              >
                                {group.isCrm
                                  ? CRM_NAV_CHILDREN.map((item) => {
                                      if (isCrmNavSubGroup(item)) {
                                        const subActive = isNavGroupActive(pathname, item.children);
                                        const subOpen = openCrmSubGroups[item.name] ?? subActive;
                                        return (
                                          <div key={item.name} className="py-0.5">
                                            <button
                                              type="button"
                                              aria-expanded={subOpen}
                                              onClick={() => {
                                                toggleCrmSubGroup(item.name, subOpen);
                                                if (item.children?.[0]?.href) {
                                                  router.push(item.children[0].href);
                                                }
                                              }}
                                              className={cn(
                                                "flex w-full items-center gap-2.5 rounded-xl py-2 pl-2 pr-3 text-sm font-semibold transition",
                                                subActive
                                                  ? "bg-[#191970]/8 text-[#191970] dark:text-[#2277ff]"
                                                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400",
                                              )}
                                            >
                                              <SidebarNavIcon
                                                icon={item.icon}
                                                active={subActive}
                                                tone="slate"
                                                size="sm"
                                              />
                                              <span className="flex-1 text-left">{item.name}</span>
                                              <ChevronDown
                                                className={cn(
                                                  "h-3.5 w-3.5 shrink-0 transition-transform",
                                                  subOpen ? "rotate-180" : "",
                                                )}
                                              />
                                            </button>
                                            {subOpen ? (
                                              <div className="ml-4 border-l border-slate-200/80 pl-2 dark:border-slate-700">
                                                {item.children.map((child) => {
                                                  const childActive =
                                                    pathname === child.href ||
                                                    pathname.startsWith(`${child.href}/`);
                                                  return (
                                                    <Link
                                                      key={child.href}
                                                      href={child.href}
                                                      onClick={closeAccountMenu}
                                                      className={cn(
                                                        "relative flex items-center gap-2.5 rounded-xl py-2 pl-2 pr-3 text-sm font-medium transition",
                                                        childActive
                                                          ? "bg-[#191970]/8 font-semibold text-[#191970] dark:text-[#2277ff]"
                                                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:hover:text-white",
                                                      )}
                                                    >
                                                      <SidebarNavIcon
                                                        icon={child.icon}
                                                        active={childActive}
                                                        tone="slate"
                                                        size="sm"
                                                      />
                                                      {child.name}
                                                    </Link>
                                                  );
                                                })}
                                              </div>
                                            ) : null}
                                          </div>
                                        );
                                      }
                                      const childActive =
                                        pathname === item.href ||
                                        pathname.startsWith(`${item.href}/`);
                                      return (
                                        <Link
                                          key={item.href}
                                          href={item.href}
                                          onClick={closeAccountMenu}
                                          className={cn(
                                            "relative flex items-center gap-2.5 rounded-xl py-2 pl-2 pr-3 text-sm font-medium transition",
                                            childActive
                                              ? "bg-[#191970]/8 font-semibold text-[#191970] dark:text-[#2277ff]"
                                              : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:hover:text-white",
                                          )}
                                        >
                                          <SidebarNavIcon
                                            icon={item.icon}
                                            active={childActive}
                                            tone="slate"
                                            size="sm"
                                          />
                                          {item.name}
                                        </Link>
                                      );
                                    })
                                  : group.isHrm
                                    ? HRM_NAV_CHILDREN.map((item) => {
                                        if (isHrmNavSubGroup(item)) {
                                          const subActive = isNavGroupActive(pathname, item.children);
                                          const subOpen = openHrmSubGroups[item.name] ?? subActive;
                                          return (
                                            <div key={item.name} className="py-0.5">
                                              <button
                                                type="button"
                                                aria-expanded={subOpen}
                                                onClick={() => {
                                                   toggleHrmSubGroup(item.name, subOpen);
                                                   if (item.children?.[0]?.href) {
                                                     router.push(item.children[0].href);
                                                   }
                                                 }}
                                                className={cn(
                                                  "flex w-full items-center gap-2.5 rounded-xl py-2 pl-2 pr-3 text-sm font-semibold transition",
                                                  subActive
                                                    ? "bg-[#191970]/8 text-[#191970] dark:text-[#2277ff]"
                                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400",
                                                )}
                                              >
                                                <SidebarNavIcon
                                                  icon={item.icon}
                                                  active={subActive}
                                                  tone="slate"
                                                  size="sm"
                                                />
                                                <span className="flex-1 text-left">{item.name}</span>
                                                <ChevronDown
                                                  className={cn(
                                                    "h-3.5 w-3.5 shrink-0 transition-transform",
                                                    subOpen ? "rotate-180" : "",
                                                  )}
                                                />
                                              </button>
                                              {subOpen ? (
                                                <div className="ml-4 border-l border-slate-200/80 pl-2 dark:border-slate-700">
                                                  {item.children.map((child) => {
                                                    const childActive = isAttendanceNavChildActive(
                                                      pathname,
                                                      child.href,
                                                    );
                                                    return (
                                                      <Link
                                                        key={child.href}
                                                        href={child.href}
                                                        onClick={closeAccountMenu}
                                                        className={cn(
                                                          "relative flex items-center gap-2.5 rounded-xl py-2 pl-2 pr-3 text-sm font-medium transition",
                                                          childActive
                                                            ? "bg-[#191970]/8 font-semibold text-[#191970] dark:text-[#2277ff]"
                                                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:hover:text-white",
                                                        )}
                                                      >
                                                        <SidebarNavIcon
                                                          icon={child.icon}
                                                          active={childActive}
                                                          tone="slate"
                                                          size="sm"
                                                        />
                                                        {child.name}
                                                      </Link>
                                                    );
                                                  })}
                                                </div>
                                              ) : null}
                                            </div>
                                          );
                                        }
                                        const childActive =
                                          pathname === item.href ||
                                          pathname.startsWith(`${item.href}/`);
                                        return (
                                          <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={closeAccountMenu}
                                            className={cn(
                                              "relative flex items-center gap-2.5 rounded-xl py-2 pl-2 pr-3 text-sm font-medium transition",
                                              childActive
                                                ? "bg-[#191970]/8 font-semibold text-[#191970] dark:text-[#2277ff]"
                                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:hover:text-white",
                                            )}
                                          >
                                            <SidebarNavIcon
                                              icon={item.icon}
                                              active={childActive}
                                              tone="slate"
                                              size="sm"
                                            />
                                            {item.name}
                                          </Link>
                                        );
                                      })
                                  : group.children.map((child) => {
                                      const childActive =
                                        pathname === child.href ||
                                        pathname.startsWith(`${child.href}/`);
                                      return (
                                        <Link
                                          key={child.href}
                                          href={child.href}
                                          onClick={closeAccountMenu}
                                          className={cn(
                                            "relative flex items-center gap-2.5 rounded-xl py-2 pl-2 pr-3 text-sm font-medium transition",
                                            childActive
                                              ? "bg-[#191970]/8 font-semibold text-[#191970] dark:text-[#2277ff]"
                                              : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:hover:text-white",
                                          )}
                                        >
                                          <SidebarNavIcon
                                            icon={child.icon}
                                            active={childActive}
                                            tone="slate"
                                            size="sm"
                                          />
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
                          onClick={closeAccountMenu}
                          className={cn(
                            "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200",
                            effectiveCollapsed && "justify-center px-2",
                            isActive
                              ? "bg-[#191970]/8 text-[#191970] shadow-sm shadow-[#191970]/5 dark:bg-[#191970]/20 dark:text-[#2277ff]"
                              : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-white",
                          )}
                        >
                          <SidebarNavIcon
                            icon={item.icon}
                            active={isActive}
                            tone={item.tone ?? "brand"}
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
            onClick={() => {
              if (!isAccountOpen) closeAllNavGroups();
              setIsAccountOpen(!isAccountOpen);
            }}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl border border-slate-200/80 px-3 py-2.5 text-left transition",
              isAccountOpen
                ? "border-[#191970]/30 bg-[#191970]/5"
                : "hover:bg-slate-50 dark:hover:bg-slate-900/50",
            )}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#191970] to-[#2277ff] text-xs font-bold text-white">
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
          onClick={handleToggleCollapse}
          className="absolute -right-4 top-24 z-50 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-md transition-all hover:scale-105 active:scale-95 hover:bg-slate-50 hover:text-slate-950 dark:border-slate-850 dark:bg-slate-900 dark:text-slate-400"
        >
          {effectiveCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </motion.aside>

      <UserAccountDropdown
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        sidebarWidth={effectiveCollapsed ? 80 : 280}
      />
    </>
  );
}
