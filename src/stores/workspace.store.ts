"use client";

import { create } from "zustand";

type WorkspaceState = {
  workspaceId: string | null;
  workspaceName: string | null;
  workspaceSlug: string | null;
  plan: string | null;
  modules: string[] | null;
  setWorkspace: (payload: { workspaceId: string; workspaceName: string; workspaceSlug: string; plan?: string; modules?: string[] }) => void;
  clearWorkspace: () => void;
};

export const workspaceStore = create<WorkspaceState>((set) => ({
  workspaceId: null,
  workspaceName: null,
  workspaceSlug: null,
  plan: null,
  modules: null,
  setWorkspace: ({ workspaceId, workspaceName, workspaceSlug, plan, modules }) =>
    set({ workspaceId, workspaceName, workspaceSlug, plan: plan ?? null, modules: modules ?? null }),
  clearWorkspace: () => set({ workspaceId: null, workspaceName: null, workspaceSlug: null, plan: null, modules: null })
}));

