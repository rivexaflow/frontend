"use client";

import { ReactNode } from "react";
import { SuperAdminSidebar } from "@/components/layout/sidebar/super-admin-sidebar";

export function SuperAdminAppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#f7f9ff]">
      <SuperAdminSidebar />
      <div className="flex-1 p-6">{children}</div>
    </div>
  );
}
