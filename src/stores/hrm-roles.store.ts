"use client";

import { create } from "zustand";

import {
  DEMO_HRM_ROLES,
  type HrmRoleRecord,
} from "@/features/workspace/data/hrm-roles-demo";

type HrmRolesState = {
  roles: HrmRoleRecord[];
  hydrated: boolean;
  hydrate: (roles: HrmRoleRecord[]) => void;
  upsertRole: (role: HrmRoleRecord) => void;
  removeRole: (id: string) => boolean;
  getRole: (id: string) => HrmRoleRecord | undefined;
};

function cloneRoles(roles: HrmRoleRecord[]): HrmRoleRecord[] {
  return roles.map((r) => ({
    ...r,
    permissionKeys: [...r.permissionKeys],
    permissions: r.permissions ? [...r.permissions] : [...r.permissionKeys],
  }));
}

export const hrmRolesStore = create<HrmRolesState>((set, get) => ({
  roles: cloneRoles(DEMO_HRM_ROLES),
  hydrated: false,

  hydrate: (roles) => {
    set({ roles: cloneRoles(roles.length > 0 ? roles : DEMO_HRM_ROLES), hydrated: true });
  },

  upsertRole: (role) => {
    set((state) => {
      const idx = state.roles.findIndex((r) => r.id === role.id);
      const next = cloneRoles(state.roles);
      const record = {
        ...role,
        permissions: [...role.permissionKeys],
      };
      if (idx === -1) next.push(record);
      else next[idx] = record;
      return { roles: next };
    });
  },

  removeRole: (id) => {
    const target = get().roles.find((r) => r.id === id);
    if (!target || target.isSystem) return false;
    set((state) => ({ roles: state.roles.filter((r) => r.id !== id) }));
    return true;
  },

  getRole: (id) => get().roles.find((r) => r.id === id),
}));

export function duplicateHrmRole(source: HrmRoleRecord): HrmRoleRecord {
  return {
    ...source,
    id: `role_${Date.now()}`,
    name: `${source.name} (copy)`,
    isSystem: false,
    memberCount: 0,
    permissionKeys: [...source.permissionKeys],
    permissions: [...source.permissionKeys],
    createdAt: new Date().toISOString().slice(0, 10),
  };
}
