"use client";

import { ReactNode, useEffect } from "react";
import { authStore } from "@/stores/auth.store";
import { syncWorkspaceContext } from "@/lib/workspace/company-context";

export function AuthProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    syncWorkspaceContext();
    return authStore.subscribe(() => {
      syncWorkspaceContext();
    });
  }, []);
  return children;
}
