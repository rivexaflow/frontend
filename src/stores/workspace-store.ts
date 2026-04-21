"use client";

import { create } from "zustand";

type WorkspaceState = {
  workspaceId: string | null;
  workspaceName: string | null;
  setWorkspace: (workspaceId: string, workspaceName: string) => void;
  clearWorkspace: () => void;
};

export const workspaceStore = create<WorkspaceState>((set) => ({
  workspaceId: null,
  workspaceName: null,
  setWorkspace: (workspaceId, workspaceName) => set({ workspaceId, workspaceName }),
  clearWorkspace: () => set({ workspaceId: null, workspaceName: null })
}));
