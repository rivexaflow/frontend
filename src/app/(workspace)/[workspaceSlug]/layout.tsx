import { ReactNode } from "react";
import { WorkspaceRouteProvider } from "@/providers/workspace-provider";
import { WorkspaceAppShell } from "@/features/workspace/components/workspace-app-shell";
import { SessionHydrator } from "@/components/auth/session-hydrator";

export default async function WorkspaceLayout({
  children,
  params
}: {
  children: ReactNode;
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = await params;
  return (
    <WorkspaceRouteProvider slug={workspaceSlug}>
      <SessionHydrator />
      <WorkspaceAppShell slug={workspaceSlug}>{children}</WorkspaceAppShell>
    </WorkspaceRouteProvider>
  );
}
