"use client";

import { ReactNode } from "react";
import { ModernSidebar } from "@/components/layout/sidebar/modern-sidebar";
import { WorkspaceHeader } from "@/components/layout/header/workspace-header";

export function WorkspaceAppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#f4f6fb] dark:bg-slate-950">
      <ModernSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <WorkspaceHeader />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[1600px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
