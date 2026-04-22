"use client";

import { ReactNode, useEffect } from "react";
import { authStore } from "@/stores/auth.store";
import { workspaceStore } from "@/stores/workspace.store";

export function AuthProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const user = authStore.getState().user;
    if (user?.workspaceId && user.workspaceSlug) {
      workspaceStore.getState().setWorkspace({
        workspaceId: user.workspaceId,
        workspaceName: "Demo Workspace",
        workspaceSlug: user.workspaceSlug,
        plan: "Growth"
      });
    }
  }, []);
  return children;
}
