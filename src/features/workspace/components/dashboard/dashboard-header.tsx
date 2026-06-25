"use client";

import React from "react";
import { Sparkles } from "lucide-react";

import { DashboardLiveClock } from "@/features/workspace/components/dashboard/dashboard-live-clock";
import { authStore } from "@/stores/auth.store";
import { workspaceStore } from "@/stores/workspace.store";
import { cn } from "@/lib/utils/cn";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function getWelcomeMessage() {
  const hour = new Date().getHours();
  if (hour < 12) return "Start your day with a clear view of what matters most.";
  if (hour < 18) return "Your workspace is ready — pick up right where you left off.";
  return "Wind down with a quick look at how your workspace is doing today.";
}

function formatWorkspaceLabel(name: string) {
  return name
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return (parts[0]?.slice(0, 2) ?? "?").toUpperCase();
}

export function DashboardHeader() {
  const user = authStore((s) => s.user);
  const brandName = workspaceStore((s) => s.brandName);
  const workspaceName = workspaceStore((s) => s.workspaceName);

  const displayName = user?.fullName || user?.name || "there";
  const firstName = displayName.split(" ")[0] || "there";
  const rawWorkspace = brandName || workspaceName || "";
  const workspaceLabel = rawWorkspace ? formatWorkspaceLabel(rawWorkspace) : "Your workspace";
  const greeting = getGreeting();
  const welcomeMessage = getWelcomeMessage();
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <section className="relative mb-8 overflow-hidden rounded-2xl border border-slate-200/70 bg-gradient-to-br from-[#191970]/[0.04] via-white to-[#2277FF]/[0.06] p-5 shadow-[0_10px_40px_rgba(15,23,42,0.05)] sm:p-6 dark:border-slate-800 dark:from-[#191970]/20 dark:via-slate-950 dark:to-[#2277FF]/10">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#2277FF]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-[#191970]/10 blur-3xl" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#191970] to-[#2277FF] text-lg font-bold text-white shadow-lg shadow-[#191970]/20"
            aria-hidden
          >
            {getInitials(displayName)}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#2277FF]/10 px-2.5 py-1 text-[11px] font-semibold text-[#191970] dark:text-[#2277FF]">
                <Sparkles className="h-3 w-3" />
                {greeting}
              </span>
              <span className="text-[11px] font-medium text-slate-400">{today}</span>
            </div>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-[1.75rem]">
              Welcome back,{" "}
              <span className="bg-gradient-to-r from-[#191970] to-[#2277FF] bg-clip-text text-transparent">
                {firstName}
              </span>
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {welcomeMessage}
            </p>

            <div className="mt-3 inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/70 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-900/60">
              <span className="font-medium text-slate-500">Workspace</span>
              <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />
              <span className={cn("font-semibold text-slate-800 dark:text-slate-200")}>{workspaceLabel}</span>
            </div>
          </div>
        </div>

        <div className="w-full shrink-0 lg:w-[min(100%,20rem)]">
          <DashboardLiveClock embedded />
        </div>
      </div>
    </section>
  );
}
