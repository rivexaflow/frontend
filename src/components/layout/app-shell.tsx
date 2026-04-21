"use client";

import { ReactNode } from "react";
import { Header } from "@/components/layout/header";
import { LiveFeedWidget } from "@/components/layout/live-feed-widget";
import { Sidebar } from "@/components/layout/sidebar";
import { SocketProvider } from "@/components/providers/socket-provider";
import type { Role } from "@/lib/types";

export function AppShell({ role, children }: { role: Role; children: ReactNode }) {
  return (
    <SocketProvider>
      <div className="flex min-h-screen bg-[#f7f9ff]">
        <Sidebar role={role} />
        <div className="flex-1">
          <Header />
          <main className="grid gap-6 p-6 lg:grid-cols-[1fr_320px]">
            <section>{children}</section>
            <LiveFeedWidget />
          </main>
        </div>
      </div>
    </SocketProvider>
  );
}
