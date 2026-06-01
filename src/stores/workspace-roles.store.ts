"use client";

import { create } from "zustand";

import {
  INITIAL_WORKSPACE_ROLES,
  type StageAccessRule,
  type WorkspaceRoleRecord,
} from "@/features/workspace/data/workspace-roles-demo";

type WorkspaceRolesState = {
  roles: WorkspaceRoleRecord[];
  upsertRole: (role: WorkspaceRoleRecord) => void;
  removeRole: (id: string) => boolean;
  getRole: (id: string) => WorkspaceRoleRecord | undefined;
};

export const workspaceRolesStore = create<WorkspaceRolesState>((set, get) => ({
  roles: INITIAL_WORKSPACE_ROLES.map((r) => ({
    ...r,
    permissionKeys: [...r.permissionKeys],
    memberIds: [...r.memberIds],
    stageAccess: { ...r.stageAccess },
  })),

  upsertRole: (role) => {
    set((state) => {
      const idx = state.roles.findIndex((r) => r.id === role.id);
      if (idx === -1) {
        return { roles: [...state.roles, role] };
      }
      const next = [...state.roles];
      next[idx] = role;
      return { roles: next };
    });
  },

  removeRole: (id) => {
    const target = get().roles.find((r) => r.id === id);
    if (!target || target.systemLocked) return false;
    set((state) => ({ roles: state.roles.filter((r) => r.id !== id) }));
    return true;
  },

  getRole: (id) => get().roles.find((r) => r.id === id),
}));

export function createEmptyRole(): WorkspaceRoleRecord {
  return {
    id: `role_${Date.now()}`,
    name: "",
    permissionKeys: [],
    memberIds: [],
    allowedIps: "",
    stageAccess: {},
  };
}

export function cloneStageAccess(
  source: Record<string, StageAccessRule>,
): Record<string, StageAccessRule> {
  return Object.fromEntries(
    Object.entries(source).map(([k, v]) => [k, { ...v }]),
  );
}
