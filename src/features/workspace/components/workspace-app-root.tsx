"use client";

import { ReactNode } from "react";

import { OnboardingGuard } from "@/components/auth/onboarding-guard";
import { SessionHydrator } from "@/components/auth/session-hydrator";
import { WorkspaceAppShell } from "@/features/workspace/components/workspace-app-shell";
import { WorkspaceRouteProvider } from "@/providers/workspace-provider";
import { appConfig } from "@/config/app";
import { authStore } from "@/stores/auth.store";
import { workspaceStore } from "@/stores/workspace.store";

export function WorkspaceAppRoot({ children }: { children: ReactNode }) {
  const authSlug = authStore((s) => s.user?.workspaceSlug);
  const storeSlug = workspaceStore((s) => s.workspaceSlug);
  const slug = authSlug ?? storeSlug ?? appConfig.defaultWorkspaceSlug;

  return (
    <WorkspaceRouteProvider slug={slug}>
      <SessionHydrator />
      <OnboardingGuard>
        <WorkspaceAppShell>{children}</WorkspaceAppShell>
      </OnboardingGuard>
    </WorkspaceRouteProvider>
  );
}
