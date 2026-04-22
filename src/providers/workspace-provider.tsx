"use client";

import { createContext, ReactNode, useContext } from "react";

const WorkspaceRouteContext = createContext<{ slug: string } | null>(null);

export function WorkspaceRouteProvider({ slug, children }: { slug: string; children: ReactNode }) {
  return <WorkspaceRouteContext.Provider value={{ slug }}>{children}</WorkspaceRouteContext.Provider>;
}

export const useWorkspaceRoute = () => {
  const ctx = useContext(WorkspaceRouteContext);
  if (!ctx) throw new Error("useWorkspaceRoute must be used within WorkspaceRouteProvider");
  return ctx;
};
