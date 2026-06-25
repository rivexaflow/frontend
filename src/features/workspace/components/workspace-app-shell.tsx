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
        <main className="flex-1 px-4 pb-4 pt-2 md:px-6 md:pb-6 md:pt-2.5 lg:px-8 lg:pb-8 lg:pt-3">
          <div className="mx-auto w-full max-w-[1600px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
