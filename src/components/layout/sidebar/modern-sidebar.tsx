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
  Menu,
  Search,
  Zap,
  HelpCircle,
  Building2,
  Ticket,
  Activity,
  History,
  CreditCard
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { authStore } from "@/stores/auth.store";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  category: string;
}

const workspaceNavItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, category: "General" },
  { name: "Contacts", href: "/crm/contacts", icon: Users, category: "Operations" },
  { name: "Leads", href: "/crm/leads", icon: Target, category: "Operations" },
  { name: "Pipelines", href: "/crm/pipelines", icon: Layers, category: "Operations" },
  { name: "KYC Center", href: "/kyc", icon: ShieldCheck, category: "Operations", badge: "Live" },
  { name: "Invoices", href: "/invoices", icon: FileText, category: "Operations" },
  { name: "AI Agents", href: "/ai", icon: Sparkles, category: "Intelligence" },
  { name: "Analytics", href: "/reports", icon: Zap, category: "Intelligence" },
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

export function ModernSidebar({ slug, isAdmin = false }: { slug?: string; isAdmin?: boolean }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const user = authStore((s) => s.user);

  const items = isAdmin ? adminNavItems : workspaceNavItems;
  const categories = Array.from(new Set(items.map(i => i.category)));

  // Auto-collapse on small screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setIsCollapsed(true);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const effectiveCollapsed = isCollapsed && !isHovered;

  const getHref = (baseHref: string) => {
    if (isAdmin) return baseHref;
    return slug ? `/${slug}${baseHref}` : baseHref;
  };

  return (
    <motion.aside
      initial={false}
      animate={{ 
        width: effectiveCollapsed ? "80px" : "280px",
        transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative flex h-screen flex-col border-r border-slate-200/60 bg-white/80 backdrop-blur-xl transition-colors duration-300",
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
          if (categoryItems.length === 0) return null;

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
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer / User Profile */}
      <div className="border-t border-slate-200/60 p-4 dark:border-slate-800/50">
        <div className={cn(
          "flex items-center gap-3 rounded-2xl p-2 transition-colors",
          !effectiveCollapsed && "hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer"
        )}>
          <div className="relative h-10 w-10 shrink-0 rounded-xl bg-gradient-to-tr from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800">
             {/* Placeholder for Avatar */}
             <div className="flex h-full w-full items-center justify-center text-sm font-bold text-slate-500 uppercase">
                {user?.fullName?.charAt(0) || user?.email?.charAt(0) || "U"}
             </div>
             <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-950"></div>
          </div>
          
          {!effectiveCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 overflow-hidden"
            >
              <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                {user?.fullName || "Active User"}
              </p>
              <p className="truncate text-xs text-slate-500">
                {user?.email || "user@rivexa.com"}
              </p>
            </motion.div>
          )}

          {!effectiveCollapsed && (
             <button className="text-slate-400 hover:text-rose-500 transition-colors">
                <LogOut className="h-5 w-5" />
             </button>
          )}
        </div>
        
        {!effectiveCollapsed && (
          <div className="mt-4 flex items-center justify-between px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <span>v1.0.4 Premium</span>
            <HelpCircle className="h-4 w-4 cursor-pointer hover:text-slate-600" />
          </div>
        )}
      </div>

      {/* Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-24 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400"
      >
        {isCollapsed ? <Menu className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>
    </motion.aside>
  );
}
