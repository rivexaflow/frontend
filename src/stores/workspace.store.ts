"use client";

import { create } from "zustand";

type WorkspaceState = {
  workspaceId: string | null;
  workspaceName: string | null;
  workspaceSlug: string | null;
  plan: string | null;
  modules: string[] | null;
  logo: string | null;
  brandName: string | null;
  themeConfig: Record<string, any> | null;
  setWorkspace: (payload: {
    workspaceId: string;
    workspaceName: string;
    workspaceSlug: string;
    plan?: string;
    modules?: string[];
    logo?: string | null;
    brandName?: string | null;
    themeConfig?: Record<string, any> | null;
  }) => void;
  clearWorkspace: () => void;
};

export const workspaceStore = create<WorkspaceState>((set) => ({
  workspaceId: null,
  workspaceName: null,
  workspaceSlug: null,
  plan: null,
  modules: null,
  logo: null,
  brandName: null,
  themeConfig: null,
  setWorkspace: ({ workspaceId, workspaceName, workspaceSlug, plan, modules, logo, brandName, themeConfig }) =>
    set({
      workspaceId,
      workspaceName,
      workspaceSlug,
      plan: plan ?? null,
      modules: modules ?? null,
      logo: logo ?? null,
      brandName: brandName ?? null,
      themeConfig: themeConfig ?? null,
    }),
  clearWorkspace: () =>
    set({
      workspaceId: null,
      workspaceName: null,
      workspaceSlug: null,
      plan: null,
      modules: null,
      logo: null,
      brandName: null,
      themeConfig: null,
    }),
}));

