"use client";

import { authStore } from "@/stores/auth.store";
import { canAccessPlatform, canAccessWorkspace } from "@/lib/auth/permissions";

export const usePermission = () => {
  const role = authStore((s) => s.role);
  return {
    role,
    canWorkspace: canAccessWorkspace(role),
    canPlatform: canAccessPlatform(role)
  };
};
