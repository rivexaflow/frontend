"use client";

import { ReactNode, useMemo } from "react";
import { usePathname } from "next/navigation";
import { WorkspaceSidebar } from "@/components/layout/sidebar/workspace-sidebar";
import { WorkspaceHeader } from "@/components/layout/header/workspace-header";
import { LiveFeedWidget } from "@/components/shared/app-shell/live-feed-widget";

export function WorkspaceAppShell({ slug, children }: { slug: string; children: ReactNode }) {
  const pathname = usePathname();
  const title = useMemo(() => {
    const parts = pathname.split("/").filter(Boolean);
    return parts.slice(1).join(" / ") || "Overview";
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-[#f7f9ff]">
      <WorkspaceSidebar slug={slug} />
      <div className="flex min-w-0 flex-1 flex-col">
        <WorkspaceHeader slug={slug} title={title} />
        <main className="grid flex-1 gap-6 p-6 lg:grid-cols-[1fr_320px]">
          <section className="min-w-0">{children}</section>
          <LiveFeedWidget />
        </main>
      </div>
    </div>
  );
}
