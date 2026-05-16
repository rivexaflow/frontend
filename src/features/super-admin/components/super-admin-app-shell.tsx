"use client";

import { ReactNode } from "react";
import { ModernSidebar } from "@/components/layout/sidebar/modern-sidebar";

export function SuperAdminAppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#f7f9ff] dark:bg-slate-950 transition-colors duration-300">
      <ModernSidebar isAdmin={true} />
      <div className="flex-1 p-6 overflow-y-auto">{children}</div>
    </div>
  );
}
