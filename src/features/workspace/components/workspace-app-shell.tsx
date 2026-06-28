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
        <main className="flex-1 px-2.5 pb-3 pt-2 sm:px-4 md:px-5">
          <div className="mx-auto w-full max-w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
